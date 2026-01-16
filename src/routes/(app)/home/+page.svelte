<script lang="ts">
    import Carousel from "$lib/components/common/Carousel.svelte";
    import Slider from "$lib/components/common/Slider.svelte";
    import Card from "$lib/components/common/Card.svelte";
    import Spinner from "$lib/components/common/Spinner.svelte";
    import { getAPIClient } from "$lib/api";
    import { kitsu } from "$lib/kitsu";
    import type { KitsuAnime } from "$lib/kitsu";
    import { user } from "$lib/stores";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    let API = getAPIClient();

    let continueList: KitsuAnime[] = [];
    let bookmarkList: KitsuAnime[] = [];

    let categories: null;
    let forUpcomingCarousel: null;

    let loaded = $state(false);

    onMount(async () => {
        if ($user) {
            try {
                const continueAnime = await API.getContinueAnime();
                const bookmarkAnime = await API.getBookmarks();

                const continueIds: string[] = continueAnime
                    .filter((item) => item.kitsu_id != null)
                    .map((item) => String(item.kitsu_id));

                const bookmarkIds: string[] = bookmarkAnime
                    .filter((item) => item.kitsu_id != null)
                    .map((item) => String(item.kitsu_id));

                if (continueIds.length > 0) {
                    continueList = (await kitsu.getAnimeByIds(
                        continueIds,
                    )) as KitsuAnime[];
                }
                if (bookmarkIds.length > 0) {
                    bookmarkList = (await kitsu.getAnimeByIds(
                        bookmarkIds,
                    )) as KitsuAnime[];
                }
            } catch (error) {
                console.error("Error fetching continue watching:", error);
            }
        }

        const categoriesdefault = await kitsu.getCategories(
            [
                {
                    type: "upcoming",
                    title: "Top Upcoming",
                },
                {
                    type: "highest_rated",
                    title: "Highest Rated",
                },
                {
                    type: "seasonal",
                    title: "Popular this season",
                },
                {
                    type: "trending",
                    title: "Trending Now",
                },
            ],
            20,
        );

        categories = [
            continueList.length !== 0
                ? {
                      type: "continue",
                      title: "Continue Watching",
                      data: continueList,
                  }
                : null,
            bookmarkList.length !== 0
                ? { type: "bookmark", title: "Your List", data: bookmarkList }
                : null,
            ...categoriesdefault,
        ].filter(Boolean);

        console.assert(categories.length > 0, "No categories found");

        forUpcomingCarousel = categories
            .find((category) => category.type === "seasonal")
            .data.slice(0, 5);

        loaded = true;
    });
</script>

<div class="w-full max-w-full h-fit space-y-4">
    {#if loaded}
        <Carousel slides={forUpcomingCarousel} />

        {#each categories as category}
            <Slider title={category.title}>
                {#each category.data as item}
                    <Card {item} onclick={() => goto(`/anime/${item.id}`)} />
                {/each}
            </Slider>
        {/each}
    {:else}
        <div class="flex justify-center items-center w-full h-screen">
            <Spinner />
        </div>
    {/if}
</div>
