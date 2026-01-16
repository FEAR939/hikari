<script lang="ts">
    import Episode from "$lib/components/common/Episode.svelte";
    import Pagecontrols from "$lib/components/common/Pagecontrols.svelte";
    import Spinner from "$lib/components/common/Spinner.svelte";
    import { kitsu, type KitsuAnime } from "$lib/kitsu";
    import { getAPIClient } from "$lib/api";
    import { visibleEpisodes, user } from "$lib/stores";
    import { onDestroy } from "svelte";

    const API = getAPIClient();

    let { anime } = $props();

    let isLoading = $state(true);

    $effect(() => {
        episodeHandler(anime, 0);
    });

    async function episodeHandler(anime: KitsuAnime, page: number) {
        isLoading = true;
        const episodesPerPage = 15;

        const [episodesObj, episodesProgress] = await Promise.all([
            await kitsu.getEpisodesPagination(anime.id, page, episodesPerPage),
            $user
                ? await API.getAnimeProgress(
                      anime.id,
                      page * episodesPerPage,
                      page * episodesPerPage + episodesPerPage,
                  )
                : [],
        ]);

        episodesObj.map((episode) => {
            const progress = episodesProgress.find(
                (progress) => progress.episode === episode.attributes.number,
            );
            episode.leftoff = progress ? progress.leftoff : 0;
        });

        visibleEpisodes.set(episodesObj);
        isLoading = false;
    }

    onDestroy(() => {
        visibleEpisodes.set([]);
    });
</script>

<div
    class="h-fit w-full grid grid-cols-1
      lg:grid-cols-5
      gap-4"
>
    {#if isLoading}
        <div class="h-48 col-span-full flex items-center justify-center">
            <Spinner />
        </div>
    {:else if !isLoading && $visibleEpisodes.length === 0}
        <div class="h-full col-span-full flex items-center justify-center">
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
    {:else if !isLoading && $visibleEpisodes.length > 0}
        {#each $visibleEpisodes as episode, index}
            <Episode {anime} {episode} {index} />
        {/each}
    {/if}
</div>
<Pagecontrols
    totalPages={Math.ceil(anime.attributes.episodeCount / 15)}
    currentPage={1}
    callback={(page) => episodeHandler(anime, page - 1)}
    class="mt-6 ml-auto"
/>
