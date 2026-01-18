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

<div class="relative w-full max-w-full aspect-[2.5/1] flex items-center">
    <div
        class="absolute w-full aspect-[2.5/1] mask-b-from-60% bg-black overflow-hidden"
    >
        <img
            src={getSeriesBackdrop(currentSlide) ||
                getSeriesPoster(currentSlide, "original")}
            alt=""
            class="min-w-full w-fit min-h-full h-fit object-cover brightness-25"
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
    <div class="absolute bottom-24 z-1 px-12 w-full h-fit flex gap-8">
        <div
            class="shrink-0 w-56 aspect-[0.7/1] overflow-hidden rounded-2xl flex items-stretch justify-stretch bg-gray-800"
        >
            <img
                src={getSeriesPoster(currentSlide)}
                class="block min-h-full h-full min-w-full w-full object-cover"
                alt="Poster"
                loading="lazy"
            />
        </div>
        <div class="w-full space-y-4 mt-8">
            <div class="text-white md:text-4xl font-bold! max-w-3/4 truncate">
                {getSeriesTitle(currentSlide)}
            </div>
            <div class="flex gap-4 text-xs items-center">
                <div class="p-1.5 bg-black/50 rounded">
                    {currentSlide.attributes.showType.toUpperCase()}
                </div>
                <div class="text-gray-400">
                    {currentSlide.attributes.startDate.slice(0, 4)}
                </div>
            </div>
            <a
                href={`/anime/${currentSlide.id}`}
                class="h-12 w-fit my-8 flex items-center justify-center space-x-2 text-black text-base pl-5 pr-5.5 rounded-full cursor-pointer transition-colors duration-150"
                style:background="rgb({accentColor?.join(',')})"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-play size-5"
                >
                    <path
                        d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"
                    />
                </svg>
                <div class="h-3.25 leading-none">Watch Now</div>
            </a>
            <div class="text-gray-300 max-w-2/3 line-clamp-3">
                {currentSlide.attributes.description}
            </div>
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
