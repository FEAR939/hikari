<script lang="ts">
    import Spinner from "$lib/components/common/Spinner.svelte";
    import NewsCard from "$lib/components/common/Newscard.svelte";
    import RSSClient from "$lib/rss";
    import { settings } from "$lib/stores";

    let isLoading = $state(true);
    let news = $state([]);

    async function load_feed() {
        isLoading = true;
        news = [];

        const url = {
            "en-US": {
                chrunchyroll:
                    "https://cr-news-api-service.prd.crunchyrollsvc.com/v1/en-US/rss",
            },
            "de-DE": {
                chrunchyroll:
                    "https://cr-news-api-service.prd.crunchyrollsvc.com/v1/de-DE/rss",
            },
        };

        const currentLang = $state($settings["language"]);
        const rss = new RSSClient(url[currentLang]["chrunchyroll"]);

        news = (await rss.getRSSFeed()) || [];

        isLoading = false;
    }

    $effect(() => {
        load_feed();
    });
</script>

<div class="relative h-full w-full px-4 pt-16 pb-4 space-y-4 overflow-y-scroll">
    <div class="mx-auto w-full max-w-5xl h-fit space-y-4">
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
