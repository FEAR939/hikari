interface Provider {
  label: string;
  url: string;
  icon: string;
  episodes: StreamProvider[];
  languages: string;
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
    from: " ",
    to: "-",
  },
  {
    from: ":",
    to: "",
  },
  {
    from: "(",
    to: "",
  },
  {
    from: ")",
    to: "",
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

async function streamFallback(
  title: string,
  suffixes: string[]
): Promise<{ html: string; suffix: string } | undefined> {
  const sanitized = sanitizeTitle(title);

  for (const suffix of suffixes) {
    let url = `https://animetoast.cc/${sanitized}${suffix}`;
    let res = await fetch(url, { headers: { "Content-Type": "application/x-www-form-urlencoded" } });

    if (res.status === 404 && title.includes("Season 2")) {
      url = `https://animetoast.cc/${sanitizeTitle(title.replace("Season 2", "2nd Season"))}${suffix}`;
      res = await fetch(url, { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
    }

	if (res.ok) {
       return { html: await res.text(), suffix };
    }
  }
  return undefined;
}

export async function getProvider(title: string): Promise<Provider | undefined> {
  const result = await streamFallback(title, ["-ger-dub", "-ger-sub"]);
  if (!result) return;

  const { html: htmlString, suffix } = result;
  const html = new DOMParser().parseFromString(htmlString, "text/html");

  const episodes: StreamProvider[] = Array.from(html.querySelectorAll(".nav-tabs li"))
    .filter((provider) => provider.querySelector("a"))
    .map((provider) => {
      const element = provider.querySelector("a");
      const label = element?.textContent?.trim() || "";
      const tab = element?.getAttribute("href")!;

      const eps = Array.from(html.querySelectorAll(`.tab-content ${tab} a`))
        .map((episode) => ({
          label: episode?.textContent?.trim() || "",
          url: episode?.getAttribute("href")!,
          isBundle: (episode?.textContent || "").includes("-"),
        }));

      return { label, tab, episodes: eps };
    });

  return {
    label: "AnimeToast",
    url: "animetoast.cc",
    icon: html.querySelector('head link[rel="icon"]')?.getAttribute("href") || "",
    episodes,
	languages: /dub/i.test(suffix) ? "(DUB/SUB)" : "(SUB ONLY)"
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
