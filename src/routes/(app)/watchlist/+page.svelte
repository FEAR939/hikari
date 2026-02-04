<script lang="ts">
    import { getAPIClient } from "$lib/api";
    import Card from "$lib/components/common/Card.svelte";
    import { kitsu } from "$lib/kitsu";
    import type { KitsuAnime } from "$lib/kitsu";
    import { goto } from "$app/navigation";

    const API = getAPIClient();

    let watchlist = $state([]);

    async function load_watchlist() {
        const bookmarkAnime = await API.getBookmarks();
        const bookmarkIds = bookmarkAnime
            .filter((item) => item.kitsu_id != null)
            .map((item) => String(item.kitsu_id));
        if (bookmarkIds.length === 0) return [];
        watchlist = (await kitsu.getAnimeByIds(bookmarkIds)) as KitsuAnime[];
    }

    $effect(() => {
        load_watchlist();
    });
</script>

<div class="h-full w-full space-y-4 overflow-y-scroll p-4 pt-16">
    <h1 class="text-2xl font-bold!">Your Watchlist</h1>
    <div
        class="grid auto-rows-min grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-x-2 gap-y-6 p-4 pb-16"
    >
        {#each watchlist as item}
            <Card
                {item}
                onclick={() => {
                    goto(`/anime/${item.id}`);
                }}
            />
        {/each}
    </div>
</div>
