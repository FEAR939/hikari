<script lang="ts">
    import {
        getSeriesTitle,
        getSeriesBackdrop,
        getSeriesPoster,
    } from "$lib/kitsu";
    import ColorThief from "colorthief";

    let { slides } = $props();

    let currentIndex = $state(0);
    let currentSlide = $derived(slides[currentIndex]);

    let accentColor = $state(null);

    let slideInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % slides.length;
    }, 10000);
</script>

<div class="relative w-full max-w-full aspect-[3.5/1] flex items-center">
    <div
        class="absolute top-0 w-full aspect-[2.5/1] mask-b-from-60% bg-black overflow-hidden"
    >
        <img
            src={getSeriesBackdrop(currentSlide) ||
                getSeriesPoster(currentSlide, "original")}
            alt=""
            class="min-w-full w-fit min-h-full h-fit object-cover brightness-50"
            crossorigin="anonymous"
            onload={(e) => {
                const img = e.target;

                if (!img) return;

                const colorThief = new ColorThief();

                const palette = colorThief.getPalette(img, 8);

                let bestColor = palette[0];
                let bestScore = -1;

                for (const [r, g, b] of palette) {
                    const { s, l } = rgbToHsl(r, g, b);
                    const score = s * (1 - Math.abs(l - 0.5) * 2);

                    if (score > bestScore) {
                        bestScore = score;
                        bestColor = [r, g, b];
                    }
                }

                function rgbToHsl(r, g, b) {
                    r /= 255;
                    g /= 255;
                    b /= 255;

                    const max = Math.max(r, g, b);
                    const min = Math.min(r, g, b);
                    const l = (max + min) / 2;

                    let h = 0;
                    let s = 0;

                    if (max !== min) {
                        const d = max - min;
                        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

                        switch (max) {
                            case r:
                                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                                break;
                            case g:
                                h = ((b - r) / d + 2) / 6;
                                break;
                            case b:
                                h = ((r - g) / d + 4) / 6;
                                break;
                        }
                    }

                    return { h, s, l };
                }

                accentColor = bestColor;
            }}
        />
    </div>
    <div class="absolute z-1 px-12 w-full h-fit flex items-center gap-8">
        <div class="w-full space-y-1 mt-8">
            <div
                class="text-white md:text-5xl font-bold! max-w-xl line-clamp-2"
            >
                {getSeriesTitle(currentSlide)}
            </div>
            <div class="flex gap-4 text-xs items-center">
                <div
                    class="px-3 py-1 bg-black/30 backdrop-blur-lg rounded-full"
                >
                    {currentSlide.attributes.showType.toUpperCase()}
                </div>
                <div class="text-gray-400">
                    {currentSlide.attributes.startDate.slice(0, 4)}
                </div>
            </div>

            <div class="text-gray-300 max-w-xl line-clamp-3">
                {currentSlide.attributes.description}
            </div>

            <a
                href={`/anime/${currentSlide.id}`}
                class="h-10 w-fit mt-4 flex items-center justify-center space-x-1.5 bg-black/30 backdrop-blur-lg text-white text-sm pl-5.5 pr-6.5 rounded-full cursor-pointer transition-colors duration-150 outline-white outline-offset-2 focus-within:outline-2"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="currentColor"
                    class="size-5"
                    ><path
                        d="M320-273v-414q0-17 12-28.5t28-11.5q5 0 10.5 1.5T381-721l326 207q9 6 13.5 15t4.5 19q0 10-4.5 19T707-446L381-239q-5 3-10.5 4.5T360-233q-16 0-28-11.5T320-273Z"
                    /></svg
                >
                <div class="h-3.5 leading-none">Watch Now</div>
            </a>
        </div>
    </div>
    <div class="absolute bottom-0 z-1 left-4 w-full flex justify-center gap-1">
        {#each slides as slide, index}
            <button
                class="{currentIndex === index
                    ? 'w-16'
                    : 'w-8'} h-1 rounded-full bg-gray-800 outline-none cursor-pointer transition-all duration-300"
                onclick={() => {
                    currentIndex = index;
                    clearInterval(slideInterval);
                    slideInterval = setInterval(() => {
                        currentIndex = (currentIndex + 1) % slides.length;
                    }, 10000);
                }}
                tabindex="-1"
            >
                {#if index === currentIndex}
                    <div
                        class="w-full h-full animate-progress transform-gpu rounded-full"
                        style:background="rgb({accentColor?.join(',')})"
                        style="--duration: 10s; transform-origin: left;"
                    ></div>
                {/if}
            </button>
        {/each}
    </div>
</div>

<style>
    .animate-progress {
        animation: progress var(--duration) linear forwards;
    }

    @keyframes progress {
        from {
            transform: scaleX(0);
        }
        to {
            transform: scaleX(1);
        }
    }
</style>
