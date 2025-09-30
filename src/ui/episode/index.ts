import { router } from "../../lib/router/index";
import { authService } from "../../services/auth";

interface EpElement extends HTMLDivElement {
  updateProgress?: (progress: number) => void;
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
  mal_id: number;
}

export default function Episode(episode: Episode, index: number): EpElement {
  const episodeCard: EpElement = document.createElement("div");
  episodeCard.className =
    "relative h-20 md:h-28 w-full bg-[#0f0f0f] ring-1 ring-gray-700/50 shadow-lg flex overflow-hidden rounded-lg shadow-lg cursor-pointer";
  episodeCard.updateProgress = (progress) => renderProgress(progress);

  if (episode.image) {
    const episodeCardImage = document.createElement("img");
    episodeCardImage.src = episode.image;
    episodeCardImage.className = "h-full aspect-video object-cover";
    episodeCard.appendChild(episodeCardImage);
  }

  const episodeDuration = document.createElement("div");
  episodeDuration.className =
    "absolute bottom-2 left-2 px-2 py-1 text-xs text-gray-300 bg-[#1a1a1a] rounded";
  episodeDuration.textContent = `${episode.runtime} Min`;

  episodeCard.appendChild(episodeDuration);

  const episodeSide = document.createElement("div");
  episodeSide.className =
    "relative h-full w-full space-y-1 md:space-y-2 p-2 md:p-4 overflow-hidden";

  const episodeTitle = document.createElement("h2");
  episodeTitle.className = "text-xs font-semibold truncate";
  episodeTitle.textContent =
    `${episode.episode}. ${episode.title.en || ""}` || `Episode ${index + 1}`;
  episodeSide.appendChild(episodeTitle);

  const progress = document.createElement("div");
  progress.className = "h-0.5 bg-[#2c2c2c] rounded hidden";

  const progbar = document.createElement("div");
  progbar.className = "h-full bg-indigo-400";

  progress.appendChild(progbar);

  episodeSide.appendChild(progress);

  function renderProgress(prog) {
    const duration = (prog / (episode.runtime * 60)) * 100;
    console.log(prog, episode.runtime * 60, duration);
    progbar.style.width = `${duration}%`;

    progress.classList.remove("hidden");
  }

  const episodeDescription = document.createElement("p");
  episodeDescription.className = "text-[9px] text-[#a4a4a4] line-clamp-2";
  episodeDescription.textContent = episode.overview;
  episodeSide.appendChild(episodeDescription);

  const episodeAirDate = document.createElement("div");
  episodeAirDate.className =
    "absolute bottom-2 md:bottom-4 left-2 md:left-4 text-[9px] m-0 text-[#fcfcfc]";

  const inFuture = episode.airdate > new Date().toISOString().split("T")[0];

  if (inFuture) {
    episodeAirDate.textContent = `Airs on ${episode.airdate}`;
  } else {
    episodeAirDate.textContent = `Aired on ${episode.airdate}`;
  }

  episodeSide.appendChild(episodeAirDate);

  episodeCard.appendChild(episodeSide);

  return episodeCard;
}
