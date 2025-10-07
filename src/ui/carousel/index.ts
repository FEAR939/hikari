export function Carousel(items) {
  const trendingCarousel = document.createElement("div");
  trendingCarousel.className = "relative 0 w-full h-48 md:h-96";

  const trendingCarouselIndicator = document.createElement("div");
  trendingCarouselIndicator.className =
    "absolute z-1 bottom-4 left-4 h-0.75 w-fit flex space-x-1";

  trendingCarousel.appendChild(trendingCarouselIndicator);

  const trendingCarouselBanner = document.createElement("img");
  trendingCarouselBanner.className =
    "w-full h-full object-cover brightness-50 mask-b-from-50% bg-[#080808]";

  trendingCarousel.appendChild(trendingCarouselBanner);

  const trendingCarouselTitle = document.createElement("div");
  trendingCarouselTitle.className =
    "absolute z-1 top-20 md:top-48 left-4 text-white text-sm md:text-3xl font-bold max-w-1/2 truncate";

  trendingCarousel.appendChild(trendingCarouselTitle);

  const trendingCarouselDescription = document.createElement("div");
  trendingCarouselDescription.className =
    "absolute z-1 top-24 md:top-58 left-4 text-neutral-400 text-xs md:text-sm max-w-1/2 line-clamp-2";

  trendingCarousel.appendChild(trendingCarouselDescription);

  const trendingCarouselWatchButton = document.createElement("div");
  trendingCarouselWatchButton.className =
    "absolute z-1 top-34 md:top-72 left-4 flex items-center justify-center space-x-2 bg-white text-black text-xs px-10 py-1.5 rounded-md cursor-pointer";
  trendingCarouselWatchButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play-icon lucide-play size-3"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>
    <div class="h-fit">Watch Now</div>
  `;

  trendingCarousel.appendChild(trendingCarouselWatchButton);

  let slideIndex = 0;

  trendingCarouselWatchButton.addEventListener("click", () => {
    router.navigate(`/anime?id=${items[slideIndex].id}`);
  });

  let timeout = null;

  const indicators = items.map((anime, i) => {
    const indicator = document.createElement("div");
    indicator.className =
      "w-6 h-full bg-neutral-700 rounded-lg transition-all duration-300 cursor-pointer overflow-hidden";

    trendingCarouselIndicator.appendChild(indicator);

    const indicatorProgress = document.createElement("div");
    indicatorProgress.className = "h-full bg-white";
    indicatorProgress.style.width = "0%";

    indicator.timer = () => {
      indicatorProgress.style.transition = "width 10s linear";
      indicatorProgress.style.width = "100%";
      setTimeout(() => {
        indicatorProgress.style.transition = "none";
        indicatorProgress.style.width = "0%";
      }, 10000);
    };

    indicator.stopTimer = () => {
      indicatorProgress.style.transition = "none";
      indicatorProgress.style.width = "0%";
    };

    indicator.appendChild(indicatorProgress);

    indicator.addEventListener("click", () => {
      if (slideIndex === i) return;
      indicators.forEach((indicator) => {
        indicator.stopTimer();
      });

      slideIndex = i;
      nextSlide(i);
    });

    return indicator;
  });

  function nextSlide(index) {
    clearTimeout(timeout);

    trendingCarouselBanner.src =
      items[index].bannerImage || items[index].trailer.thumbnail;

    trendingCarouselTitle.textContent =
      items[index].title.english || items[index].title.romaji;
    trendingCarouselDescription.textContent = items[index].description
      .substring(0, items[index].description.indexOf("(Source:"))
      .replaceAll(/<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g, "");

    indicators.map((indicator, i) => {
      if (i !== index) {
        indicator.classList.replace("w-12", "w-6");
        return;
      }

      indicator.classList.replace("w-6", "w-12");
      indicator.timer();
    });

    timeout = setTimeout(() => nextSlide((index + 1) % items.length), 10000);
  }

  setTimeout(() => nextSlide(0), 250);

  return trendingCarousel;
}
