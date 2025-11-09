import { Episode } from "../../lib/anizip";
import { createSignal, bind } from "../../lib/jsx/reactive";
import { h } from "../../lib/jsx/runtime";
import { KitsuEpisode } from "../../lib/kitsu";

interface EpElement extends HTMLDivElement {
  updateProgress?: (progress: number) => void;
}

export function Episode({
  episode,
  index,
  sourcepanel_callback,
}: {
  episode: KitsuEpisode;
  index: number;
  sourcepanel_callback: (index: number) => void;
}): EpElement {
  const [progress, setProgress, subscribeProgress] = createSignal(
    (episode.leftoff / (episode.attributes.length! * 60)) * 100,
  );

  function renderProgress(prog: number) {
    const duration = (prog / (episode.attributes.length! * 60)) * 100;
    const progPercent = duration;
    setProgress(progPercent);
  }

  const div = (
    <div
      class="relative h-fit w-full shadow-lg overflow-hidden cursor-pointer"
      onclick={() => sourcepanel_callback(episode.attributes.number)}
    >
      <div class="relative w-full bg-neutral-800 aspect-video rounded-lg overflow-hidden flex items-center justify-center">
        {episode.attributes.thumbnail?.original ? (
          <img
            src={episode.attributes.thumbnail.original}
            class="block w-full aspect-video object-cover rounded-lg"
            alt="No thumbnail available"
          />
        ) : (
          <div class="text-neutral-300">No thumbnail available</div>
        )}
        <div class="absolute bottom-2 right-2 px-2 py-1 text-xs text-neutral-300 bg-neutral-950/50 backdrop-blur-sm rounded">
          {episode.attributes.length || "N/A"} Min
        </div>
        {bind([progress, setProgress, subscribeProgress], (value) => (
          <div
            class={`absolute bottom-0 right-0 left-0 h-0.5 bg-neutral-700 rounded ${value > 0 ? "" : "hidden"}`}
          >
            <div class="h-full bg-[#DC143C]" style={{ width: `${value}%` }} />
          </div>
        ))}
      </div>
      <div class="relative h-fit w-full space-y-1 md:space-y-2 overflow-hidden py-2">
        <div class="text-sm font-medium truncate lg:text-lg">
          {`E${episode.attributes.number} | ${episode.attributes.titles.en || episode.attributes.titles.en_us || episode.attributes.titles.en_jp || episode.attributes.titles.en_cn || "No title available"}`}
        </div>
        <div class="text-xs font-medium text-neutral-500 line-clamp-2 lg:max-3xl:text-sm 4xl:text-md">
          {episode.attributes.description || "No description available"}
        </div>
        <div class="text-xs font-medium m-0 text-neutral-500 lg:max-3xl:text-sm 4xl:text-md">
          {getRelativeTime(episode.attributes.airdate) || "Unknown airdate"}
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
