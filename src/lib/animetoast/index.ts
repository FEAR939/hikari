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

  return tempString.trim() + "-ger-dub";
}

export async function getProvider(
  title: string,
): Promise<Provider | undefined> {
  const sanitizedTitle = sanitizeTitle(title);
  const combined = "https://animetoast.cc/" + sanitizeTitle(title).toString();
  console.log(title, sanitizedTitle, combined);

  let response = await fetch(combined, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (response.status == 404 && title.includes("Season 2")) {
    response = await fetch(
      `https://animetoast.cc/${sanitizeTitle(title.replace("Season 2", "2nd Season"))}`,
    );
  }

  const data = await response.text();

  if (!data) return;

  const html = new DOMParser().parseFromString(data, "text/html");

  const episodes: StreamProvider[] = Array.from(
    html.querySelectorAll(".nav-tabs li"),
  )
    .filter((provider) => provider.querySelector("a") !== null)
    .map((provider) => {
      const element = provider.querySelector("a");
      const label = element?.textContent?.trim() || "";
      const tab = element?.getAttribute("href")!;

      let episodes = Array.from(
        html.querySelectorAll(`.tab-content ${tab} a`),
      ).map((episode) => {
        const label = episode?.textContent?.trim() || "";
        const url = episode?.getAttribute("href")!;
        return { label, url, isBundle: label.includes("-") };
      });
      return { label, tab, episodes };
    });

  return {
    label: "AnimeToast",
    url: "animetoast.cc",
    icon:
      html.querySelector('head link[rel="icon"]')?.getAttribute("href") || "",
    episodes: episodes,
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
