interface Provider {
  label: string;
  url: string;
  icon: string;
  episodes: StreamProvider[];
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
    from: "Season 2",
    to: "2nd Season",
  },
  {
    from: "Part 2",
    to: "2nd Season",
  },
];

function sanitizeTitle(title: string): string {
  let tempString = title;
  replacements.map(
    (replacement) =>
      (tempString = tempString.replaceAll(replacement.from, replacement.to)),
  );

  console.log(tempString);

  return tempString.trim();
}

export async function getProvider(
  title: string,
): Promise<Provider | undefined> {
  const sanitized = sanitizeTitle(title);
  const url = `https://animetoast.cc/?s=${sanitized} Ger Dub`;

  const res = await fetch(url);

  if (!res.ok) return;

  const data = await res.text();

  const search_html = new DOMParser().parseFromString(data, "text/html");

  const search_result = search_html.querySelector(".blog-item .item-head h3 a");

  if (!search_result) return;

  const seriesUrl = search_result.getAttribute("href")!;

  console.debug("Found URL for series: ", seriesUrl);

  const series_res = await fetch(seriesUrl);

  if (!series_res.ok) return;

  const series_data = await series_res.text();

  const series_html = new DOMParser().parseFromString(series_data, "text/html");

  const episodes: StreamProvider[] = Array.from(
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

  return {
    label: "AnimeToast",
    url: "animetoast.cc",
    icon:
      series_html
        .querySelector('head link[rel="icon"]')
        ?.getAttribute("href") || "",
    episodes,
  };
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
