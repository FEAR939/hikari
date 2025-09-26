import { router } from "../../lib/router/index";
import {
  getTrendingAnime,
  getSeasonAnime,
  getMultipleAnime,
} from "../../lib/anilist";
import CategorySlider from "../../ui/Slider";

export default async function Home(query) {
  const page = document.createElement("div");
  page.className = "h-full w-full space-y-4 overflow-y-scroll";

  document.root.appendChild(page);

  const trendingCarousel = document.createElement("div");
  trendingCarousel.className = "relative 0 w-full h-48 md:h-96";

  page.appendChild(trendingCarousel);

  const trendingCarouselIndicator = document.createElement("div");
  trendingCarouselIndicator.className =
    "absolute z-1 bottom-4 left-4 h-0.75 w-fit flex space-x-1";

  trendingCarousel.appendChild(trendingCarouselIndicator);

  const trendingAnime = await getTrendingAnime();

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
    router.navigate(`/anime?id=${trendingAnime[slideIndex].id}`);
  });

  let timeout = null;

  const indicators = trendingAnime.map((anime, i) => {
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
      trendingAnime[index].bannerImage ||
      trendingAnime[index].trailer.thumbnail;

    trendingCarouselTitle.textContent = trendingAnime[index].title.romaji;
    trendingCarouselDescription.textContent = trendingAnime[index].description
      .substring(0, trendingAnime[index].description.indexOf("(Source:"))
      .replaceAll(/<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g, "");

    indicators.map((indicator, i) => {
      if (i !== index) {
        indicator.classList.replace("w-12", "w-6");
        return;
      }

      indicator.classList.replace("w-6", "w-12");
      indicator.timer();
    });

    timeout = setTimeout(
      () => nextSlide((index + 1) % trendingAnime.length),
      10000,
    );
  }

  setTimeout(() => nextSlide(0), 250);

  async function getContinueAnime() {
    try {
      const response = await fetch(
        `${localStorage.getItem("app_server_adress")}/get-last-watched`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );

      if (!response.ok || response.status !== 200) {
        throw new Error("Failed to fetch continue anime");
      }

      const data = await response.json();

      const list = await getMultipleAnime(data.map((item) => item.anilist_id));

      return list;
    } catch (error) {
      console.warn(error);
      return false;
    }
  }

  const continueAnime = await getContinueAnime();

  if (continueAnime !== false) {
    const continueCards = Object.values(continueAnime).map((item) => {
      const card = document.createElement("div");
      card.className = "h-fit w-36 md:w-48 shrink-0";

      const cardImage = document.createElement("img");
      cardImage.src = item.coverImage.large;
      cardImage.className = "w-full aspect-[5/7] object-cover rounded-lg";
      cardImage.loading = "lazy"; // Add lazy loading

      card.appendChild(cardImage);
      card.addEventListener("click", () => {
        router.navigate(`/anime?id=${item.id}`);
      });

      return card;
    });

    const continueSlider = CategorySlider("Continue Watching", continueCards);
    page.appendChild(continueSlider);
  }

  const anime = await getSeasonAnime();

  const animeCards = anime.map((item) => {
    const card = document.createElement("div");
    card.className = "h-fit w-36 md:w-48 shrink-0";

    const cardImage = document.createElement("img");
    cardImage.src = item.coverImage.large;
    cardImage.className = "w-full aspect-[5/7] object-cover rounded-lg";
    cardImage.loading = "lazy"; // Add lazy loading

    card.appendChild(cardImage);
    card.addEventListener("click", () => {
      router.navigate(`/anime?id=${item.id}`);
    });

    return card;
  });

  const animeSlider = CategorySlider("Popular this Season", animeCards);
  page.appendChild(animeSlider);
}
