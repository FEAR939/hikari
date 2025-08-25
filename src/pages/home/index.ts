import { router } from "../../lib/router/index";
import { getSeasonAnime } from "../../lib/anilist";

export default async function Home(query) {
  const page = document.createElement("div");
  page.className = "h-full w-full p-4 pt-12";

  document.root.appendChild(page);

  const categorySlider = document.createElement("div");
  categorySlider.className =
    "relative h-fit w-full overflow-hidden flex items-center";

  const categorySliderInner = document.createElement("div");
  categorySliderInner.className =
    "h-fit w-full flex space-x-2 md:space-x-4 transition-transform duration-300";
  categorySlider.appendChild(categorySliderInner);

  const categorySliderPrev = document.createElement("div");
  categorySliderPrev.className =
    "absolute left-1 h-12 w-12 flex items-center justify-center bg-[#000000]/50 rounded-full cursor-pointer";
  categorySliderPrev.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>';

  const categorySliderNext = document.createElement("div");
  categorySliderNext.className =
    "absolute right-1 h-12 w-12 flex items-center justify-center bg-[#000000]/50 rounded-full cursor-pointer";
  categorySliderNext.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>';

  categorySlider.appendChild(categorySliderPrev);
  categorySlider.appendChild(categorySliderNext);

  let index = 0;
  let cardWidth = 192; // w-48 = 192px
  let gap = 8; // space-x-4 = 16px

  if (window.matchMedia("(min-width: 768px)").matches) {
    cardWidth = 256;
    gap = 16;
  }

  // Calculate how many cards are visible at once
  const getVisibleCards = () =>
    Math.floor(categorySlider.offsetWidth / (cardWidth + gap));

  // Update slider position
  const updateSlider = () => {
    const translateX = index * (cardWidth + gap);
    categorySliderInner.style.transform = `translateX(-${translateX}px)`;
  };

  categorySliderNext.addEventListener("click", () => {
    const visibleCards = getVisibleCards();
    const maxIndex = Math.max(
      0,
      categorySliderInner.children.length - visibleCards,
    );

    if (index < maxIndex) {
      index = Math.min(index + visibleCards, maxIndex);
      updateSlider();
    }
  });

  categorySliderPrev.addEventListener("click", () => {
    if (index > 0) {
      const visibleCards = getVisibleCards();
      index = Math.max(index - visibleCards, 0);
      updateSlider();
    }
  });

  page.appendChild(categorySlider);

  const anime = await getSeasonAnime();

  // Use DocumentFragment for better performance when adding multiple cards
  const fragment = document.createDocumentFragment();

  anime.forEach((item) => {
    const card = document.createElement("div");
    card.className = "h-fit w-48 md:w-64 shrink-0";

    const cardImage = document.createElement("img");
    cardImage.src = item.coverImage.large;
    cardImage.className = "w-full aspect-[1/1.35] object-cover rounded-lg";
    cardImage.loading = "lazy"; // Add lazy loading

    card.appendChild(cardImage);
    card.addEventListener("click", () => {
      router.navigate(`/anime?id=${item.id}`);
    });

    fragment.appendChild(card);
  });

  categorySliderInner.appendChild(fragment);
}
