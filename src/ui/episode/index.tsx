import { createSignal, bind } from "../../lib/jsx/reactive";
import { h } from "../../lib/jsx/runtime";

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
  runtime?: number;
  airdate?: string;
}

export default function Episode(episode: Episode, index: number): EpElement {
  const [progress, setProgress, subscribeProgress] = createSignal(0);

  function renderProgress(prog: number) {
    const duration = (prog / (episode.runtime * 60)) * 100;
    const progPercent = duration;
    setProgress(progPercent);
  }

  const div = (
    <div class="relative h-fit w-full shadow-lg overflow-hidden cursor-pointer">
      <div class="relative w-full bg-neutral-800 aspect-video rounded-lg">
        {episode.image && (
          <img
            src={episode.image}
            class="w-full aspect-video object-cover rounded-lg"
          />
        )}
      </div>
      <div class="absolute bottom-2 right-2 px-2 py-1 text-xs text-neutral-300 bg-[#1a1a1a]/50 backdrop-blur-sm rounded">
        {episode.runtime || "N/A"} Min
      </div>
      <div class="relative h-fit w-full space-y-1 md:space-y-2 overflow-hidden py-2">
        <div class="text-sm font-medium truncate">
          {`${episode.episode}. ${episode.title.en || ""}` ||
            `Episode ${index + 1}`}
        </div>
        {bind([progress, setProgress, subscribeProgress], (value) => (
          <div
            class={`h-0.5 bg-neutral-800 rounded ${value > 0 ? "" : "hidden"}`}
          >
            <div class="h-full bg-[#DC143C]" style={{ width: `${value}%` }} />
          </div>
        ))}
        <div class="text-xs font-medium text-neutral-500 line-clamp-2">
          {episode.overview}
        </div>
        <div class="text-xs font-medium m-0 text-neutral-500">
          {getRelativeTime(episode.airdate) || "Unknown"}
        </div>
      </div>
    </div>
  ) as EpElement;

  // Attach the updateProgress method to the element
  div.updateProgress = renderProgress;

  return div;
}

function getRelativeTime(dateString?: string) {
  if (!dateString) return null;

  const airDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  airDate.setHours(0, 0, 0, 0);
  const diffTime = airDate.getTime() - today.getTime();
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
