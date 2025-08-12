interface EpElement extends HTMLDivElement {
  updateSource?: (source: Source | boolean) => void;
}

interface Source {
  icon: string;
  url: string;
  isBundle: boolean;
  bundleEpisodeNumber: number;
}

interface Episode {
  title: { en: string };
  image: string | undefined;
  episode: number;
  overview: string;
}

export default function Episode(episode: Episode, index: number): EpElement {
  const episodeCard: EpElement = document.createElement("div");
  episodeCard.className =
    "relative h-32 w-full bg-[#0c0c0c] flex overflow-hidden rounded-xl cursor-pointer";

  if (episode.image) {
    const episodeCardImage = document.createElement("img");
    episodeCardImage.src = episode.image;
    episodeCardImage.className = "h-full aspect-video object-cover";
    episodeCard.appendChild(episodeCardImage);
  }

  const episodeSide = document.createElement("div");
  episodeSide.className = "h-full w-full space-y-4 p-4 overflow-hidden";

  const episodeTitle = document.createElement("h2");
  episodeTitle.className = "text-xl font-bold truncate";
  episodeTitle.textContent =
    `${episode.episode}. ${episode.title.en || ""}` || `Episode ${index + 1}`;
  episodeSide.appendChild(episodeTitle);

  const episodeDescription = document.createElement("p");
  episodeDescription.className = "text-[10px] text-neutral-600 truncate";
  episodeDescription.textContent = episode.overview;
  episodeSide.appendChild(episodeDescription);

  const episodeSource = document.createElement("div");
  episodeSource.className = "absolute bottom-4 right-4";
  episodeSource.textContent = "Loading Source...";

  episodeCard.appendChild(episodeSource);

  episodeCard.updateSource = function (source: Source | boolean) {
    if (!source && typeof source == "boolean") {
      episodeSource.innerHTML = "";
      return;
    } else if (typeof source == "boolean") return;

    episodeSource.innerHTML = `<img src=${source.icon} class="size-4 object-cover">`;

    episodeCard.addEventListener("click", async () => {
      document.router.navigate(
        `/player?url=${source.url}&episodeNumber=${episode.episode}&isBundle=${source.isBundle}${Boolean(source.isBundle) ? `&bundleEpisodeNumber=${source.bundleEpisodeNumber}` : ""}`,
      );
    });
  };

  episodeCard.appendChild(episodeSide);

  return episodeCard;
}
