import { router } from "../../lib/router";
import { h } from "../../lib/jsx/runtime";
import { cn } from "../../lib/util";
import { createSignal, bind } from "../../lib/jsx/reactive";
import { authService } from "../../services/auth";
import { API } from "../../app";
import { KitsuAnime } from "../../lib/kitsu";

interface CardOptions {
  label?: boolean;
  type?: CardType;
  size?: CardSize;
}

export enum CardType {
  DEFAULT = 0,
  RELATION = 1,
}

export enum CardSize {
  AUTO = 0,
  MANUAL = 1,
}

export function Card(
  {
    item = {},
    className = "",
    options = {},
  }: {
    item: any;
    className?: string;
    options?: CardOptions;
  } = { item: {}, className: "", options: {} },
) {
  if (!options.size) options.size = CardSize.MANUAL;
  if (!options.type) options.type = CardType.DEFAULT;
  if (!options.label) options.label = false;

  let timeout: NodeJS.Timeout | null = null;
  const [hovered, setHovered, subscribeHovered] = createSignal(false);

  let cardRef: HTMLDivElement;

  return (
    <div
      ref={(el: HTMLElement) => (cardRef = el as HTMLDivElement)}
      class={cn(
        `h-fit ${options.size === CardSize.MANUAL ? "w-36 md:w-48" : "w-full"} cursor-pointer shrink-0 overflow-visible`,
        className,
      )}
      onclick={() => router.navigate(`/anime?id=${item.id}`)}
      onmouseenter={() => (timeout = setTimeout(() => setHovered(true), 500))}
      onmouseleave={() => {
        if (timeout) clearTimeout(timeout);
        setHovered(false);
      }}
    >
      <div class="w-full aspect-3/4 transform-gpu">
        <img
          src={item.attributes.posterImage.medium}
          class="block h-full w-full object-cover rounded-lg "
          alt="Cover"
          loading="lazy"
        />
      </div>
      {options.label && (
        <div class="text-sm mt-2 font-medium space-y-1">
          <div class="text-white line-clamp-2">
            {item.attributes.titles.en ||
              item.attributes.titles.en_us ||
              item.attributes.titles.en_cn ||
              item.attributes.titles.en_jp}
          </div>
          {item.relationType && (
            <div class="text-neutral-500 text-xs">{item.relationType}</div>
          )}
        </div>
      )}
      {bind([hovered, setHovered, subscribeHovered], (value) => {
        if (!value) return document.createComment("not-hovered");

        const rect = cardRef.getBoundingClientRect();
        const left = rect.left + rect.width / 2 - 72 * 2;
        const top = rect.top + rect.height / 2 - 88 * 2;

        const minLeft = 8 * 8 + 8;
        const minTop = 8;

        const maxLeft = window.innerWidth - 72 * 4 - 8;
        const maxTop = window.innerHeight - 88 * 4 - 8;

        const finalLeft = Math.min(Math.max(left, minLeft), maxLeft);
        const finalTop = Math.min(Math.max(top, minTop), maxTop);

        const [bookmark, setBookmark, subscribeBookmark] = createSignal(false);
        if (authService.getUser()) {
          (async () => {
            const bookmarked = await API.getBookmarks(parseInt(item.id));

            setBookmark(bookmarked[0]?.subscribed || false);
          })();
        }

        let frame;
        let timeout;

        function initFrame() {
          // Send listening event repeatedly until YouTube responds
          timeout = setInterval(() => {
            frame.contentWindow?.postMessage(
              '{"event":"listening","id":1,"channel":"widget"}',
              "*",
            );
          }, 100);

          frame.contentWindow?.postMessage(
            '{"event":"listening","id":1,"channel":"widget"}',
            "*",
          );
        }

        function handleYouTubeMessage(e) {
          if (e.origin !== "https://www.youtube-nocookie.com") return;

          clearInterval(timeout);
        }

        // Add message listener
        window.addEventListener("message", handleYouTubeMessage);

        const expandedCard = (
          <div
            class="fixed z-50 h-88 w-72 bg-neutral-950 rounded-lg shadow-2xl space-y-2 cursor-default transition-all ease-in-out duration-150 opacity-0 scale-75"
            style={`top: ${finalTop}px; left: ${finalLeft}px;`}
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
            }}
          >
            {/* Expanded content */}
            {/*<img
              src={
                item.attributes.coverImage?.original ||
                item.attributes.posterImage?.original
              }
              class="w-full aspect-[2.5/1] object-cover rounded-t-lg mask-b-to-95% mask-y-neutral-950"
              loading="lazy"
            />*/}
            <div class="w-full aspect-video relative">
              <div class="w-full h-full overflow-clip rounded-t-lg mask-b-to-95% mask-y-neutral-950 absolute top-0">
                <iframe
                  class="w-full border-0 left-0 h-[calc(100%+200px)] pointer-events-none absolute top-1/2 transform-gpu -translate-y-1/2"
                  title="trailer"
                  allow="autoplay"
                  allowfullscreen
                  ref={(el: HTMLIFrameElement) => (frame = el)}
                  onLoad={initFrame}
                  src={`https://www.youtube-nocookie.com/embed/${item.attributes.youtubeVideoId}?autoplay=1&controls=0&mute=1&disablekb=1&loop=1&playlist=${item.attributes.youtubeVideoId}&cc_lang_pref=ja`}
                ></iframe>
              </div>
            </div>
            <div class="text-neutral-100 truncate text-lg px-4">
              {item.attributes.titles.en ||
                item.attributes.titles.en_us ||
                item.attributes.titles.en_cn ||
                item.attributes.titles.en_jp}
            </div>
            <div class="flex h-7 space-x-2 px-4">
              <div
                class="w-full h-full bg-neutral-200 hover:bg-neutral-400 rounded text-black text-xs flex items-center justify-center space-x-1 cursor-pointer transition-colors duration-150"
                onclick={() => router.navigate(`/anime?id=${item.id}`)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="#000000"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-play size-2.5"
                >
                  <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
                </svg>
                <div class="h-2.75 leading-none">Watch Now</div>
              </div>
              <div
                class="size-7 bg-neutral-800 rounded flex items-center justify-center cursor-pointer"
                onClick={async () => {
                  const result = await API.setBookmark(
                    parseInt(item.id),
                    !bookmark(),
                    false,
                    false,
                  );
                  if (!result) return;
                  setBookmark(!bookmark());
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-bookmark size-3"
                  ref={(el: SVGElement) => {
                    subscribeBookmark(() => {
                      const value = bookmark();

                      el.setAttribute("fill", value ? "currentColor" : "none");
                    });
                  }}
                >
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
              </div>
            </div>
            <div class="text-neutral-500 line-clamp-5 text-xs px-4">
              {item.attributes.description || "No description available"}
            </div>
          </div>
        ) as HTMLDivElement;

        document.body.appendChild(expandedCard);
        expandedCard.offsetWidth;
        // A rather interesting workaround ... but works so -_-
        setTimeout(() => {
          expandedCard.classList.remove("scale-75", "opacity-0");
        }, 10);

        // Cleanup on next update
        return expandedCard;
      })}
    </div>
  );
}
