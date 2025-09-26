import { cache } from "../../services/cache";

interface Provider {
  label: string;
  url: string;
  icon: string;
  hosters: StreamProvider[];
}

interface StreamProvider {
  label: string;
  tab: string;
  episodes: Episode[];
}

interface Episode {
  label: string;
  url: string;
  isBundle: boolean;
}

const replacements = [
  {
    from: ":",
    to: "",
  },
  {
    from: "- ",
    to: "",
  },
  {
    from: /\bSeason 2.*[^Ger Dub]\b/g,
    to: "2",
  },
  {
    from: /\b2nd Season.*[^Ger Dub]\b/g,
    to: "2",
  },
  {
    from: /\bII\b/g,
    to: "2",
  },
  {
    from: /\bIII\b/g,
    to: "3",
  },
  {
    from: /\bIV\b/g,
    to: "4",
  },
  {
    from: /\bV\b/g,
    to: "5",
  },
];

function sanitizeTitle(title: string): string {
  let tempString = title;
  replacements.map((replacement) => {
    if (!tempString.includes("Season"))
      tempString = tempString.replace(/\bPart\b/g, "");

    return (tempString = tempString.replaceAll(
      replacement.from,
      replacement.to,
    ));
  });

  return tempString.trim();
}

export async function getProvider(title: {
  romaji: string;
  english: string;
}): Promise<Provider | undefined> {
  if (
    cache.get("extension.animetoast") !== null &&
    JSON.parse(cache.get("extension.animetoast")!).anime === title.romaji
  ) {
    return JSON.parse(cache.get("extension.animetoast")!);
  }

  const sanitized = sanitizeTitle(title.romaji);

  const url = `https://animetoast.cc/?s=${sanitized} Ger Dub`;
  const seasonNumber =
    sanitized.match(/(?<!^)(?<!\d)\d{1,2}/)?.[0] || undefined;
  const lang = "Ger Dub";

  const res = await fetch(url);

  if (!res.ok) return;

  const data = await res.text();

  const search_html = new DOMParser().parseFromString(data, "text/html");

  let search_results = Array.from(
    search_html.querySelectorAll(".blog-item .item-head h3 a"),
  );

  if (seasonNumber) {
    search_results = search_results.filter((result) => {
      const sanitized = sanitizeTitle(result.textContent!);

      return sanitized.includes(seasonNumber) && sanitized.includes(lang);
    });
  } else if (!seasonNumber) {
    search_results = search_results.filter((result) => {
      const sanitized = sanitizeTitle(result.textContent!);

      return (
        !sanitized.match(/(?<!^)(?<!\d)\d{1,2}/)?.[0] &&
        sanitized.includes(lang)
      );
    });
  }

  const simularities = search_results.map((result, i) => {
    const sim = levenshtein(title.romaji, result.textContent!);
    // console.log(`result: ${result.textContent}, similarity: ${sim}`);

    return { similarity: sim, index: i };
  });

  if (!simularities.length) return;

  const bestMatch = simularities.reduce((prev, curr) => {
    return prev.similarity < curr.similarity ? prev : curr;
  });

  if (!search_results.length) return;

  const seriesUrl = search_results[bestMatch.index].getAttribute("href")!;

  console.debug("Found URL for series: ", seriesUrl);

  const series_res = await fetch(seriesUrl);

  if (!series_res.ok) return;

  const series_data = await series_res.text();

  const series_html = new DOMParser().parseFromString(series_data, "text/html");

  const hosters: StreamProvider[] = Array.from(
    series_html.querySelectorAll(".nav-tabs li"),
  )
    .filter((provider) => provider.querySelector("a"))
    .map((provider) => {
      const element = provider.querySelector("a");
      const label = element?.textContent?.trim() || "";
      const tab = element?.getAttribute("href")!;

      const eps = Array.from(
        series_html.querySelectorAll(`.tab-content ${tab} a`),
      ).map((episode) => ({
        label: episode?.textContent?.trim() || "",
        url: episode?.getAttribute("href")!,
        isBundle: (episode?.textContent || "").includes("-"),
      }));

      return { label, tab, episodes: eps };
    });

  const source = {
    label: "AnimeToast",
    anime: title.romaji,
    url: "animetoast.cc",
    icon:
      series_html
        .querySelector('head link[rel="icon"]')
        ?.getAttribute("href") || "",
    hosters,
  };

  cache.set("extension.animetoast", JSON.stringify(source), 60 * 60 * 1000); // 1 hour cache lifetime

  return source;
}

export async function getEpisodeLink(url: string) {
  const response = await fetch(url);
  const data = await response.text();

  if (!data) return;

  const html = new DOMParser().parseFromString(data, "text/html");

  const link =
    html.querySelector("#player-embed a")?.getAttribute("href") || "";

  return link;
}

export async function getEpisode(source_hoster, episode) {
  let sourceEpisode = false;
  let bundleEpisodeNumber = -1;

  if (source_hoster.episodes[0].isBundle) {
    console.log("Episodes are bundled");
    sourceEpisode = source_hoster.episodes.find((sourceEpisode) => {
      const match = sourceEpisode.label.match(/E?(\d+)-E?(\d+)/);

      const [bundleStart, bundleEnd] = match
        ? [parseInt(match[1]), parseInt(match[2])]
        : [0, 0];

      const episodeNumber = parseInt(episode.episode);

      bundleEpisodeNumber = episodeNumber - bundleStart + 1;

      return bundleStart <= episodeNumber && bundleEnd >= episodeNumber;
    });
  } else {
    sourceEpisode = source_hoster.episodes.find(
      (sourceEpisode) =>
        sourceEpisode.label.replace("Ep. ", "") == episode.episode,
    );
  }

  if (!sourceEpisode) {
    console.log("Episode not found");
    return;
  }

  if (bundleEpisodeNumber === -1) {
    const streamlink = await getEpisodeLink(sourceEpisode.url);

    return streamlink;
  }

  const bundle = await getBundle(sourceEpisode.url);

  const bundleEpisode = bundle![bundleEpisodeNumber - 1];

  const streamlink = await getEpisodeLink(bundleEpisode.url);

  return streamlink;
}

export async function getBundle(url: string) {
  let response = await fetch(url);
  let data = await response.text();

  if (!data) return;

  let html = new DOMParser().parseFromString(data, "text/html");

  const link =
    html.querySelector("#player-embed a")?.getAttribute("href") || "";

  response = await fetch(link);
  data = await response.text();

  if (!data) return;

  html = new DOMParser().parseFromString(data, "text/html");

  let episodes = Array.from(
    html.querySelectorAll(`.tab-content .active a`),
  ).map((episode) => {
    const label = episode?.textContent?.trim() || "";
    const url = episode?.getAttribute("href")!;
    return { label, url };
  });

  return episodes;
}

function levenshtein(a: string, b: string) {
  const an = a.length;
  const bn = b.length;
  if (an == 0) {
    return bn;
  }
  if (bn == 0) {
    return an;
  }
  const matrix = new Array<number[]>(bn + 1);
  for (let i = 0; i <= bn; ++i) {
    const row = (matrix[i] = new Array<number>(an + 1));
    row[0] = i;
  }
  const firstRow = matrix[0];
  for (let j = 1; j <= an; ++j) {
    firstRow![j] = j;
  }
  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i]![j] = matrix[i - 1]![j - 1]!;
      } else {
        matrix[i]![j] =
          Math.min(
            matrix[i - 1]![j - 1]!, // substitution
            matrix[i]![j - 1]!, // insertion
            matrix[i - 1]![j]!, // deletion
          ) + 1;
      }
    }
  }
  return matrix[bn]![an]!;
}
