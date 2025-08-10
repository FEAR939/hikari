function sanitizeTitle(title: string): string {
  return title.replaceAll(" ", "-").replaceAll(":", "").trim();
}

export async function getProviderEpisodes(title: string) {
  console.log(title, sanitizeTitle(title));
  const response = await fetch(`https://animetoast.cc/${sanitizeTitle(title)}`);
  const data = await response.text();

  if (!data) return;

  const html = new DOMParser().parseFromString(data, "text/html");

  console.log(html);

  const episodes = Array.from(html.querySelectorAll(".nav-tabs li"))
    .filter((provider) => provider.querySelector("a") !== null)
    .map((provider) => {
      const element = provider.querySelector("a");
      const label = element?.textContent?.trim() || "";
      const tab = element?.getAttribute("href")!;

      const episodes = Array.from(
        html.querySelectorAll(`.tab-content ${tab} a`),
      ).map((episode) => {
        const label = episode?.textContent?.trim() || "";
        const url = episode?.getAttribute("href")!;
        return { label, url };
      });
      return { label, tab, episodes };
    });

  console.log(episodes);
}
