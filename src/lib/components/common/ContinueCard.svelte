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

    let { episode, onclick = () => {}, class: className = "" } = $props();

    let Anizip = $state({});

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
            class="w-full aspect-video overflow-hidden rounded-lg flex items-stretch justify-stretch bg-gray-800 outline-white outline-offset-2 group-hover/card:outline-2 group-focus-within/card:outline-2"
        >
            <img
                src={Anizip?.episodes?.[episode.episode.attributes.number]
                    .image ||
                    (episode.episode.attributes.thumbnail &&
                        episode.episode.attributes.thumbnail.original) ||
                    getSeriesPoster(episode.anime.anime)}
                class="block min-h-full h-full min-w-full w-full object-cover group-hover/card:scale-105 group-focus-within/card:scale-105 transition-transform duration-300"
                alt="Poster"
                loading="lazy"
            />
        </div>

        <div class="mt-2 font-medium space-y-1">
            <div class="text-white truncate">
                {getEpisodeTitle(episode.episode) ||
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
