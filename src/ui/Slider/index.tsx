import { h } from "../../lib/jsx/runtime";

interface CategorySliderProps {
  label: string;
  children?: any;
}

export default function CategorySlider({
  label,
  children,
}: CategorySliderProps) {
  let sliderInner: HTMLDivElement;
  let prevButton: HTMLDivElement;
  let nextButton: HTMLDivElement;

  const updateButtonVisibility = () => {
    if (!sliderInner) return;

    const { scrollLeft, scrollWidth, clientWidth } = sliderInner;

    // Update prev button
    if (scrollLeft <= 0) {
      prevButton.style.display = "none";
    } else {
      prevButton.style.display = "flex";
    }

    // Update next button
    if (scrollLeft + clientWidth >= scrollWidth - 1) {
      nextButton.style.display = "none";
    } else {
      nextButton.style.display = "flex";
    }
  };

  const handleNext = () => {
    if (!sliderInner) return;

    // Scroll by one viewport width
    sliderInner.scrollBy({
      left: sliderInner.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  const handlePrev = () => {
    if (!sliderInner) return;

    // Scroll back by one viewport width
    sliderInner.scrollBy({
      left: -sliderInner.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  return (
    <div class="group relative h-fit w-full p-4 pt-12">
      {/* Label */}
      <div class="absolute top-0 left-4 w-full text-xl font-medium text-white">
        {label}
      </div>

      {/* Slider Inner with native scroll */}
      <div
        ref={(el) => {
          sliderInner = el as HTMLDivElement;

          // Update button visibility on scroll
          sliderInner.addEventListener("scroll", updateButtonVisibility);

          // Initialize button visibility
          requestAnimationFrame(() => {
            updateButtonVisibility();
          });

          // Handle window resize
          const handleResize = () => {
            updateButtonVisibility();
          };
          window.addEventListener("resize", handleResize);

          // Cleanup
          (el as any).__cleanup = () => {
            sliderInner.removeEventListener("scroll", updateButtonVisibility);
            window.removeEventListener("resize", handleResize);
          };
        }}
        class="flex space-x-2 md:space-x-4 overflow-x-scroll scroll-smooth snap-x snap-mandatory"
      >
        {children}
      </div>

      {/* Previous Button */}
      <div
        ref={(el) => (prevButton = el as HTMLDivElement)}
        class="absolute left-5 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center bg-neutral-800/80 backdrop-blur-md rounded-full cursor-pointer opacity-0 group-hover:opacity-100 hover:bg-neutral-700/80 transition-all duration-300 z-10"
        style="display: none;"
        onClick={handlePrev}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </div>

      {/* Next Button */}
      <div
        ref={(el) => (nextButton = el as HTMLDivElement)}
        class="absolute right-5 top-1/2 -translate-y-1/2 h-12 w-12 flex items-center justify-center bg-neutral-800/80 backdrop-blur-md rounded-full cursor-pointer opacity-0 group-hover:opacity-100 hover:bg-neutral-700/80 transition-all duration-300 z-10"
        onClick={handleNext}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </div>
    </div>
  );
}
