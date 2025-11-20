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
  // Calculate initial progress percentage (leftoff is usually in seconds, length in minutes)
  const initialPercent =
    episode.attributes.length && episode.leftoff
      ? (episode.leftoff / (episode.attributes.length * 60)) * 100
      : 0;

  const [progress, setProgress, subscribeProgress] =
    createSignal(initialPercent);

  // Function to update progress dynamically
  function renderProgress(prog: number) {
    if (!episode.attributes.length) return;
    const percentage = (prog / (episode.attributes.length * 60)) * 100;
    setProgress(percentage);
  }

  // Helper to resolve the best available title
  const title =
    episode.attributes.titles.en ||
    episode.attributes.titles.en_us ||
    episode.attributes.titles.en_jp ||
    episode.attributes.titles.en_cn ||
    "No title available";

  // Container
  // Uses group to trigger hover effects on children
  const div = (
    <div
      class="group relative flex flex-col gap-3 cursor-pointer select-none"
      onclick={() => sourcepanel_callback(episode.attributes.number)}
    >
      <div class="absolute inset-0 -z-1 bg-[#1a1a1a] rounded-2xl opacity-0 group-hover:opacity-100 group-hover:-inset-3 transition-all duration-300 ease-out"></div>
      {/* Thumbnail Section */}
      <div class="relative w-full aspect-video bg-[#121212] rounded-xl overflow-hidden transition-all">
        {/* Image with gentle zoom on hover */}
        {episode.attributes.thumbnail?.original ? (
          <img
            src={episode.attributes.thumbnail.original}
            class="w-full h-full object-cover transition-transform duration-500"
            loading="lazy"
            alt={`Episode ${episode.attributes.number}`}
          />
        ) : (
          <div class="w-full h-full flex items-center justify-center text-neutral-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
        )}

        {/* Metadata Badge (Duration) */}
        <div class="absolute bottom-2 right-2 px-1.5 py-0.5 text-sm font-bold text-white bg-black/70 rounded-sm backdrop-blur-sm shadow-sm">
          {episode.attributes.length ? `${episode.attributes.length}m` : "N/A"}
        </div>

        {/* Progress Bar */}
        {bind([progress, setProgress, subscribeProgress], (value) => {
          if (!value || value <= 0) return <div class="hidden" />;
          return (
            <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div
                class="h-full bg-[#e50914] shadow-sm"
                style={{ width: `${Math.min(value, 100)}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* Text Content */}
      <div class="w-full space-y-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-white truncate group-hover:text-neutral-200 transition-colors">
            {episode.attributes.number}. {title}
          </span>
        </div>

        <p class="text-xs font-medium text-neutral-400 line-clamp-2 leading-relaxed">
          {episode.attributes.description || "No description available"}
        </p>

        <div class="text-xs font-medium text-neutral-600 tracking-wide pt-1">
          {getRelativeTime(episode.attributes.airdate) || "Unknown Date"}
        </div>
      </div>
    </div>
  ) as EpElement;

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
