import { h } from "../../lib/jsx/runtime";
import { router } from "../../lib/router";
import { createSignal, bind } from "../../lib/jsx/reactive";

export function Carousel({ items }: { items: any[] }) {
  const [slideIndex, setSlideIndex, subscribeSlideIndex] = createSignal(0);
  let timeout: NodeJS.Timeout | null = null;
  const indicators: Array<
    HTMLDivElement & { timer: () => void; stopTimer: () => void }
  > = [];

  const trendingCarouselIndicator = (
    <div class="absolute z-1 bottom-4 left-4 h-0.75 w-fit flex space-x-1">
      {items.map((anime, i) => {
        const indicatorProgress = (
          <div
            class="h-full bg-white"
            style="width: 100%; transform-origin: left; transform: scaleX(0);"
          />
        ) as HTMLDivElement;

        const indicator = (
          <div
            class="w-6 h-full bg-neutral-700 rounded-lg transition-all duration-300 cursor-pointer overflow-hidden"
            onClick={() => {
              if (slideIndex() === i) return;
              indicators.forEach((ind) => ind.stopTimer());
              setSlideIndex(i);
            }}
          >
            {indicatorProgress}
          </div>
        ) as HTMLDivElement & { timer: () => void; stopTimer: () => void };

        indicator.timer = () => {
          indicatorProgress.style.transition = "transform 10s linear";
          indicatorProgress.style.transform = "scaleX(1)";
          setTimeout(() => {
            indicatorProgress.style.transition = "none";
            indicatorProgress.style.transform = "scaleX(0)";
          }, 10000);
        };

        indicator.stopTimer = () => {
          indicatorProgress.style.transition = "none";
          indicatorProgress.style.transform = "scaleX(0)";
        };

        indicators.push(indicator);
        return indicator;
      })}
    </div>
  ) as HTMLDivElement;

  const trendingCarousel = (
    <div class="relative 0 w-full h-48 md:h-96">
      {trendingCarouselIndicator}

      {/* Reactively update banner */}
      {bind([slideIndex, setSlideIndex, subscribeSlideIndex], (index) => (
        <img
          class="w-full h-full object-cover brightness-50 mask-b-from-50% bg-[#080808]"
          src={
            items[index].attributes?.coverImage?.original ||
            items[index].attributes?.posterImage?.original
          }
        />
      ))}

      {/* Reactively update title */}
      {bind([slideIndex, setSlideIndex, subscribeSlideIndex], (index) => (
        <div class="absolute z-1 top-20 md:top-48 left-4 text-white text-sm md:text-3xl font-bold max-w-1/2 truncate">
          {items[index].attributes?.titles?.en ||
            items[index].attributes?.titles?.en_jp ||
            items[index].attributes?.titles?.en_cn ||
            items[index].attributes?.titles?.ja_jp}
        </div>
      ))}

      {/* Reactively update description */}
      {bind([slideIndex, setSlideIndex, subscribeSlideIndex], (index) => (
        <div class="absolute z-1 top-24 md:top-58 left-4 text-neutral-400 text-xs md:text-sm max-w-1/2 line-clamp-2">
          {items[index].attributes.description}
        </div>
      ))}

      <div
        class="absolute z-1 top-34 md:top-72 left-4 h-6 flex items-center justify-center space-x-1 bg-white text-black text-xs px-10 rounded-md cursor-pointer"
        onClick={() => {
          router.navigate(`/anime?id=${items[slideIndex()].id}`);
        }}
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
    </div>
  ) as HTMLDivElement;

  // Subscribe to slide changes to handle side effects
  subscribeSlideIndex(() => {
    const index = slideIndex();

    // Clear existing timeout
    if (timeout) clearTimeout(timeout);

    // Update indicator states
    indicators.forEach((indicator, i) => {
      if (i !== index) {
        indicator.classList.replace("w-12", "w-6");
        return;
      }
      indicator.classList.replace("w-6", "w-12");
      indicator.timer();
    });

    // Set next slide timeout
    timeout = setTimeout(
      () => setSlideIndex((index + 1) % items.length),
      10000,
    );
  });

  // Start the carousel
  setTimeout(() => setSlideIndex(0), 250);

  return trendingCarousel;
}
