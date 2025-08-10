export default function Episode(episode, index) {
  const episodeCard = document.createElement("div");
  episodeCard.className =
    "h-32 w-full bg-[#0c0c0c] flex overflow-hidden rounded-xl";

  if (episode.image) {
    const episodeCardImage = document.createElement("img");
    episodeCardImage.src = episode.image;
    episodeCardImage.className = "h-full aspect-video object-cover";
    episodeCard.appendChild(episodeCardImage);
  }

  const episodeSide = document.createElement("div");
  episodeSide.className = "h-full w-full space-y-4 p-4";

  const episodeTitle = document.createElement("h2");
  episodeTitle.className = "text-xl font-bold";
  episodeTitle.textContent =
    `${episode.episodeNumber}. ${episode.title.en || ""}` ||
    `Episode ${index + 1}`;
  episodeSide.appendChild(episodeTitle);

  const episodeDescription = document.createElement("p");
  episodeDescription.className = "text-[10px] text-neutral-600";
  episodeDescription.textContent = episode.overview;
  episodeSide.appendChild(episodeDescription);

  episodeCard.appendChild(episodeSide);

  return episodeCard;
}
