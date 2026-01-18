<script lang="ts">
    import { onDestroy } from "svelte";
    import { twMerge } from "tailwind-merge";
    import { fade, fly, scale, slide } from "svelte/transition";
    import {
        playerAnime,
        playerAnizip,
        playerEpisode,
        sourceInitialIndex,
        user,
    } from "$lib/stores";
    import {
        getEpisodeTitle,
        getSeriesTitle,
        kitsu,
        getSeriesBackdrop,
        getSeriesPoster,
    } from "$lib/kitsu";
    import { getAPIClient } from "$lib/api";
    import Pagecontrols from "./Pagecontrols.svelte";
    import Spinner from "./Spinner.svelte";

    let { show = $bindable(false), class: className } = $props();

    const API = getAPIClient();

    let modalElement = null;
    let isLoading = $state(true);
    let episodes = $state([]);

    $effect(() => {
        if (show && modalElement) {
            document.body.appendChild(modalElement);
            episodeHandler($playerAnime, 0);
        } else if (modalElement?.parentElement === document.body) {
            document.body.removeChild(modalElement);
        }
    });

    async function episodeHandler(anime: KitsuAnime, page: number) {
        isLoading = true;
        const episodesPerPage = 15;

        const [episodesObj, episodesProgress] = await Promise.all([
            await kitsu.getEpisodesPagination(anime.id, page, episodesPerPage),
            $user && false
                ? await API.getAnimeProgress(
                      anime.id,
                      page * episodesPerPage,
                      page * episodesPerPage + episodesPerPage,
                  )
                : [],
        ]);

        episodesObj.map((episode) => {
            // const progress = episodesProgress.find(
            //     (progress) => progress.episode === episode.attributes.number,
            // );
            // episode.leftoff = progress ? progress.leftoff : 0;

            const anizipEpisode =
                $playerAnizip?.episodes[episode.attributes.number];

            episode.anizipImage = anizipEpisode?.image;
        });

        episodes = episodesObj;
        isLoading = false;
    }

    onDestroy(() => {
        show = false;
        if (modalElement) {
            document.body.removeChild(modalElement);
        }
    });
</script>

{#if show}
    <div
        bind:this={modalElement}
        aria-modal="true"
        role="dialog"
        class={twMerge(
            "modal fixed top-12 right-3 bottom-18 bg-black/70 aspect-1/2 flex flex-col h-auto z-3332 overflow-hidden rounded-2xl text-white backdrop-blur-2xl border border-gray-900",
            className,
        )}
        in:slide={{ duration: 250 }}
    >
        <div class="h-18 w-full bg-gray-950 p-4 line-clamp-2 flex items-center">
            <span>{getSeriesTitle($playerAnime)}</span>
            <button
                aria-label="Close settings modal"
                class="absolute right-4 top-4 self-center cursor-pointer"
                onclick={() => {
                    show = false;
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-x size-5"
                >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                </svg>
            </button>
        </div>
        <div class="h-full w-full overflow-y-scroll">
            {#if isLoading}
                <div
                    class="h-48 col-span-full flex items-center justify-center"
                >
                    <Spinner />
                </div>
            {:else if !isLoading && episodes.length === 0}
                <div
                    class="h-full col-span-full flex items-center justify-center"
                >
                    <div
                        class="w-full py-8 flex flex-col items-center justify-center space-y-1"
                    >
                        <div class="text-3xl">😕</div>
                        <div class="text-lg">No Episodes found</div>
                        <div class="text-neutral-500 text-xs">
                            Try coming back later.
                        </div>
                    </div>
                </div>
            {:else if !isLoading && episodes.length}
                {#each episodes as episode}
                    <button
                        class="py-1.5 px-2 w-full aspect-5/1 flex text-left outline-hidden {$playerEpisode.number ===
                        episode.attributes.number
                            ? 'bg-white/10'
                            : 'hover:bg-white/15 cursor-pointer'}"
                        onclick={() => {
                            if (
                                $playerEpisode.number ===
                                episode.attributes.number
                            )
                                return;

                            sourceInitialIndex.set(
                                episode.attributes.number - 1,
                            );
                        }}
                    >
                        <div
                            class="relative h-full aspect-video overflow-hidden rounded-md shrink-0"
                        >
                            <img
                                class="h-full w-full object-cover"
                                src={episode.anizipImage ||
                                    (episode.attributes?.thumbnail &&
                                        episode.attributes?.thumbnail
                                            ?.original) ||
                                    getSeriesBackdrop($playerAnime) ||
                                    getSeriesPoster($playerAnime)}
                                alt=""
                            />
                            <div
                                class="absolute right-1 bottom-1 px-1 py-0.5 text-xs rounded bg-black/30 backdrop-blur-2xl"
                            >
                                {episode.attributes?.length}Min
                            </div>
                        </div>
                        <div
                            class="h-full w-full p-2 flex flex-col justify-center truncate"
                        >
                            <div class="truncate">
                                {getEpisodeTitle(episode) ||
                                    `Episode ${episode.attributes.number}`}
                            </div>
                            <div class="text-sm text-gray-400">
                                {`Episode ${episode.attributes.number}`}
                            </div>
                        </div>
                    </button>
                {/each}
            {/if}
        </div>
        <Pagecontrols
            totalPages={Math.ceil($playerAnime.attributes.episodeCount / 15)}
            currentPage={1}
            callback={(page) => episodeHandler($playerAnime, page - 1)}
            class="p-2 ml-auto"
        />
    </div>
{/if}
