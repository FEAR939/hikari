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
    "relative h-fit w-full shadow-lg overflow-hidden shadow-lg cursor-pointer";
  episodeCard.updateProgress = (progress) => renderProgress(progress);

  let episodeCardImageWrapper = document.createElement("div");
  episodeCardImageWrapper.className = "relative w-full aspect-video rounded-lg";

  episodeCard.appendChild(episodeCardImageWrapper);

  if (episode.image) {
    const episodeCardImage = document.createElement("img");
    episodeCardImage.src = episode.image;
    episodeCardImage.className = "w-full aspect-video object-cover rounded-lg";
    episodeCardImageWrapper.appendChild(episodeCardImage);
  }

  const episodeDuration = document.createElement("div");
  episodeDuration.className =
    "absolute bottom-2 right-2 px-2 py-1 text-xs text-neutral-300 bg-[#1a1a1a]/50 backdrop-blur-sm rounded";
  episodeDuration.textContent = `${episode.runtime} Min`;

  episodeCardImageWrapper.appendChild(episodeDuration);

  const episodeSide = document.createElement("div");
  episodeSide.className =
    "relative h-fit w-full space-y-1 md:space-y-2 overflow-hidden py-2";

  const episodeTitle = document.createElement("h2");
  episodeTitle.className = "text-sm font-medium truncate";
  episodeTitle.textContent =
    `${episode.episode}. ${episode.title.en || ""}` || `Episode ${index + 1}`;
  episodeSide.appendChild(episodeTitle);

  const progress = document.createElement("div");
  progress.className = "h-0.5 bg-neutral-800 rounded hidden";

  const progbar = document.createElement("div");
  progbar.className = "h-full bg-[#DC143C]";

  progress.appendChild(progbar);

  episodeSide.appendChild(progress);

  function renderProgress(prog) {
    const duration = (prog / (episode.runtime * 60)) * 100;
    progbar.style.width = `${duration}%`;

    progress.classList.remove("hidden");
  }

  const episodeDescription = document.createElement("p");
  episodeDescription.className =
    "text-xs font-medium text-neutral-500 line-clamp-2";
  episodeDescription.textContent = episode.overview;
  episodeSide.appendChild(episodeDescription);

  const episodeAirDate = document.createElement("div");
  episodeAirDate.className = "text-xs font-medium m-0 text-neutral-500";
  episodeAirDate.textContent = getRelativeTime(episode.airdate) || "Unknown";

  episodeSide.appendChild(episodeAirDate);

  episodeCard.appendChild(episodeSide);

  return episodeCard;
}

function getRelativeTime(dateString) {
  const airDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  airDate.setHours(0, 0, 0, 0);

  const diffTime = airDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const inFuture = diffDays > 0;
  const absDays = Math.abs(diffDays);

  let timeText;

  if (absDays === 0) {
    timeText = "today";
  } else if (absDays === 1) {
    timeText = inFuture ? "tomorrow" : "yesterday";
  } else if (absDays < 30) {
    timeText = `${absDays} days`;
  } else if (absDays < 365) {
    const months = Math.floor(absDays / 30);
    timeText = `${months} ${months === 1 ? "month" : "months"}`;
  } else {
    const years = Math.floor(absDays / 365);
    timeText = `${years} ${years === 1 ? "year" : "years"}`;
  }

  if (absDays === 0) {
    return `Airs ${timeText}`;
  } else if (inFuture) {
    return `Airs in ${timeText}`;
  } else {
    return `Aired ${timeText} ago`;
  }
}
