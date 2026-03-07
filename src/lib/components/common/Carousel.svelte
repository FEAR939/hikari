<script lang="ts">
    import {
        getSeriesTitle,
        getSeriesBackdrop,
        getSeriesPoster,
    } from "$lib/kitsu";
    import { getPalette } from "colorthief";
    import { pageScrollPosition } from "$lib/stores";

    let { slides, hasScrolled = $bindable(false) } = $props();
    let currentIndex = $state(0);
    let currentSlide = $derived(slides[currentIndex]);
    let accentColor = $state(null);
    let transitioning = $state(false);
    let displayedSlide = $state(slides[0]);
    let displayedAccentColor = $state(null);

    let slideInterval = setInterval(advance, 10000);

    function advance() {
        currentIndex = (currentIndex + 1) % slides.length;
    }

    // When currentIndex changes, trigger a crossfade
    $effect(() => {
        // Access currentIndex to track it
        const newSlide = slides[currentIndex];
        if (newSlide === displayedSlide) return;

        transitioning = true;

        // After fade out completes, swap content and fade back in
        setTimeout(() => {
            displayedSlide = newSlide;
            displayedAccentColor = null; // Reset until new image loads
            transitioning = false;
        }, 500); // matches the CSS transition duration
    });

    function extractAccentColor(img: HTMLImageElement) {
        if (!img) return;
        const palette = getPalette(img, 8);
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

        function rgbToHsl(r: number, g: number, b: number) {
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

        displayedAccentColor = bestColor;
        accentColor = bestColor;
    }

    function resetInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(advance, 10000);
    }
</script>

<div
    class="relative w-full max-w-full h-112 min-[128rem]:h-196! flex items-center overflow-visible"
>
    <!-- Backdrop Image with crossfade -->
    <div
        class="fixed top-0 left-0 right-0 w-screen aspect-[2.5/1] {$pageScrollPosition <
        250
            ? 'mask-b-from-60% brightness-50'
            : 'mask-b-from-60% brightness-10'} bg-black transition-all duration-250"
    >
        <img
            src={getSeriesBackdrop(displayedSlide) ||
                getSeriesPoster(displayedSlide, "original")}
            alt=""
            class="min-w-full w-fit h-full object-cover
transition-opacity duration-500 ease-in-out"
            class:opacity-0={transitioning}
            class:opacity-100={!transitioning}
            crossorigin="anonymous"
            onload={(e) => {
                extractAccentColor(e.target);
            }}
        />
    </div>

    <!-- Content overlay with crossfade -->
    <div
        class="absolute z-1 px-12 h-full w-full flex items-center gap-8 transition-all duration-500 ease-in-out"
        class:opacity-0={transitioning}
        class:translate-y-2={transitioning}
        class:opacity-100={!transitioning}
        class:translate-y-0={!transitioning}
    >
        <div class="w-full space-y-3">
            <div
                class="text-white text-xl md:text-6xl min-[128rem]:text-8xl! tracking-[-4px] min-[128rem]:tracking-[-6px]! font-semibold! break-keep truncate leading-tight"
            >
                {getSeriesTitle(displayedSlide)}
            </div>
            <div class="flex gap-4 text-xs items-center">
                <div
                    class="px-4 py-1.5 bg-black/30 backdrop-blur-lg rounded-full"
                >
                    {displayedSlide.attributes.showType.toUpperCase()}
                </div>
                <div class="text-gray-400">
                    {displayedSlide.attributes.startDate.slice(0, 4)}
                </div>
            </div>
            <div class="text-white text-sm font-normal max-w-xl line-clamp-3">
                {displayedSlide.attributes.description}
            </div>
            <a
                href={`/anime/${displayedSlide.id}`}
                class="h-10 w-fit flex items-center justify-center space-x-1.5 bg-black/30 backdrop-blur-lg text-white text-sm pl-5.5 pr-6.5 rounded-full cursor-pointer transition-colors duration-150 outline-white outline-offset-2 focus-within:outline-2 before:content-[''] before:absolute before:inset-1 before:rounded-full hover:before:bg-white/10 before:transition-colors before:duration-150"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="currentColor"
                    class="size-5"
                >
                    <path
                        d="M320-273v-414q0-17 12-28.5t28-11.5q5 0 10.5 1.5T381-721l326 207q9 6 13.5 15t4.5 19q0 10-4.5 19T707-446L381-239q-5 3-10.5 4.5T360-233q-16 0-28-11.5T320-273Z"
                    />
                </svg>
                <div class="h-3.5 leading-none">Watch Now</div>
            </a>
        </div>
    </div>

    <!-- Progress indicators -->
    <div class="absolute bottom-0 z-1 left-4 w-full flex justify-center gap-1">
        {#each slides as slide, index}
            <button
                class="w-12 h-1.5 rounded-full bg-white/10 backdrop-blur-lg outline-none cursor-pointer transition-all duration-300 overflow-hidden"
                onclick={() => {
                    if (index === currentIndex) return;
                    currentIndex = index;
                    resetInterval();
                }}
                tabindex="-1"
            >
                {#if index === currentIndex}
                    <div
                        class="w-full h-full animate-progress transform-gpu transition-colors duration-500"
                        style:background={displayedAccentColor
                            ? `rgb(${displayedAccentColor.join(",")})`
                            : "rgb(255,255,255)"}
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
