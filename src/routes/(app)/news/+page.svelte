<script lang="ts">
    import Spinner from "$lib/components/common/Spinner.svelte";
    import NewsCard from "$lib/components/common/Newscard.svelte";
    import RSSClient from "$lib/rss";
    import { onMount } from "svelte";

    let isLoading = $state(true);
    let news = $state([]);

    onMount(async () => {
        const rss = new RSSClient(
            "https://cr-news-api-service.prd.crunchyrollsvc.com/v1/en-US/rss",
        );

        news = (await rss.getRSSFeed()) || [];
        console.log(news);
        isLoading = false;
    });
</script>

<div class="relative h-full w-full px-4 pt-16 pb-4 space-y-4 overflow-y-scroll">
    <div
        class="h-fit w-full grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4"
    >
        {#if isLoading}
            <div
                class="col-span-full h-[calc(100vh-12rem)] grid place-items-center"
            >
                <Spinner />
            </div>
        {:else if !isLoading && news.length > 0}
            {#each news as newsEntry}
                <NewsCard news={newsEntry} />
            {/each}
        {/if}
    </div>
</div>
