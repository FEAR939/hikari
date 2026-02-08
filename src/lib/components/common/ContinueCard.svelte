<script lang="ts">
    import { clsx } from "clsx";
    import {
        getEpisodeTitle,
        getSeriesPoster,
        getSeriesTitle,
    } from "$lib/kitsu";
    import { anizip } from "$lib/anizip";
    import { onMount } from "svelte";
    import { cache } from "$lib/cache/cache";
    import ColorThief from "colorthief";

    let { episode, onclick = () => {}, class: className = "" } = $props();

    let Anizip = $state({});
    let accentColor = $state([]);

    function getTimePercentage(time1: number, time2: number) {
        return (time2 / time1) * 100;
    }

    onMount(async () => {
        if (cache.get(`anizip-${episode.anime.anime.id}`)) {
            return (Anizip = cache.get(`anizip-${episode.anime.anime.id}`));
        }

        Anizip = await anizip.getAnimeById(episode.anime.anime.id);

        cache.set(
            `anizip-${episode.anime.anime.id}`,
            Anizip,
            1000 * 60 * 60 * 3,
        );
        // Cache for 3 hours
    });
</script>

<!-- Main Card -->
<button
    class={clsx(
        "group/card h-fit w-36 md:w-96 cursor-pointer shrink-0 block outline-hidden text-left",
        className,
    )}
    style="--delay: 250ms"
    onclick={() => onclick?.()}
>
    <div class="h-full w-full slideIn">
        <div
            class="relative w-full aspect-video overflow-hidden rounded-xl flex items-stretch justify-stretch bg-gray-800 outline-white outline-offset-2 group-hover/card:outline-2 group-focus-within/card:outline-2"
        >
            <img
                src={(Anizip?.episodes?.[episode?.episode?.attributes.number] &&
                    Anizip?.episodes?.[episode?.episode?.attributes.number]
                        .image) ||
                    (episode.episode.attributes.thumbnail &&
                        episode.episode.attributes.thumbnail.original) ||
                    getSeriesPoster(episode.anime.anime)}
                class="block min-h-full h-full min-w-full w-full object-cover group-hover/card:scale-105 group-focus-within/card:scale-105 transition-transform duration-300"
                alt="Poster"
                loading="lazy"
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
            <div
                class="absolute bottom-0 left-0 right-0 h-6 bg-linear-to-t from-black/50 to-transparent"
            >
                <div
                    class="absolute left-1.5 right-1.5 bottom-1.5 h-1 w-auto bg-black/70 rounded-full overflow-hidden"
                >
                    <div
                        class="h-full bg-gray-200 rounded-full"
                        style:background="rgb({accentColor?.join(',')})"
                        style:width={`${getTimePercentage(
                            episode.episode.attributes.length * 60,
                            episode.leftoff,
                        )}%`}
                    ></div>
                </div>
            </div>
        </div>

        <div class="mt-2 font-medium space-y-1">
            <div class="text-white truncate">
                {(Anizip?.episodes?.[episode?.episode?.attributes.number] &&
                    Anizip?.episodes?.[episode?.episode?.attributes.number]
                        .title?.en) ||
                    getEpisodeTitle(episode.episode) ||
                    `Episode ${episode.episode.attributes.number}`}
            </div>
            <div class="flex divide-x divide-gray-700">
                <div class="text-gray-400 max-w-2/3 text-sm truncate pr-2">
                    {getSeriesTitle(episode.anime.anime)}
                </div>
                <div class="text-gray-400 max-w-1/3 text-sm truncate px-2">
                    {`Episode ${episode.episode.attributes.number}`}
                </div>
            </div>
        </div>
    </div>
</button>

<style>
    .slideIn {
        animation: slideIn 250ms ease-out var(--delay) forwards;
        opacity: 0;
    }

    @keyframes slideIn {
        from {
            transform: translateY(25px);
            opacity: 0;
        }
        to {
            transform: "none";
            opacity: 1;
        }
    }
</style>
