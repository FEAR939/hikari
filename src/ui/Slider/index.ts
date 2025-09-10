import { router } from "../../lib/router";

export default function CategorySlider(label, children) {
  const categorySlider = document.createElement("div");
  categorySlider.className =
    "relative h-fit w-full overflow-hidden flex items-center p-4 pt-12";

  const categorySliderLabel = document.createElement("div");
  categorySliderLabel.className =
    "absolute top-0 left-4 w-full text-lg font-semibold text-neutral-300";
  categorySliderLabel.textContent = label;

  categorySlider.appendChild(categorySliderLabel);

  const categorySliderInner = document.createElement("div");
  categorySliderInner.className =
    "h-fit w-full flex space-x-2 md:space-x-4 transition-transform duration-300";
  categorySlider.appendChild(categorySliderInner);

  const categorySliderPrev = document.createElement("div");
  categorySliderPrev.className =
    "absolute left-5 h-12 w-12 flex items-center justify-center bg-[#000000]/50 rounded-full cursor-pointer";
  categorySliderPrev.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>';

  const categorySliderNext = document.createElement("div");
  categorySliderNext.className =
    "absolute right-5 h-12 w-12 flex items-center justify-center bg-[#000000]/50 rounded-full cursor-pointer";
  categorySliderNext.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>';

  categorySlider.appendChild(categorySliderPrev);
  categorySlider.appendChild(categorySliderNext);

  let index = 0;
  let cardWidth = 144; // w-48 = 192px
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

  // Use DocumentFragment for better performance when adding multiple cards
  const fragment = document.createDocumentFragment();

  children.map((item) => {
    fragment.appendChild(item);
  });

  categorySliderInner.appendChild(fragment);

  return categorySlider;
}
