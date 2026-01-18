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

    interface Category {
        type: string;
        title: string;
        data: KitsuAnime[] | null;
        loading: boolean;
        loaded: boolean;
    }

    let categories = $state<Category[]>([]);
    let forUpcomingCarousel = $state<KitsuAnime[] | null>(null);
    let initialLoaded = $state(false);

    const categoryDefinitions = [
        { type: "continue", title: "Continue Watching" },
        { type: "bookmark", title: "Your List" },
        { type: "seasonal", title: "Popular this season" },
        { type: "trending", title: "Trending Now" },
        { type: "highest_rated", title: "Highest Rated" },
        { type: "upcoming", title: "Top Upcoming" },
    ];

    async function loadCategory(type: string): Promise<KitsuAnime[]> {
        switch (type) {
            case "continue": {
                if (!$user) return [];
                const continueAnime = await API.getContinueAnime();
                const continueIds = continueAnime
                    .filter((item) => item.kitsu_id != null)
                    .map((item) => String(item.kitsu_id));
                if (continueIds.length === 0) return [];
                return (await kitsu.getAnimeByIds(continueIds)) as KitsuAnime[];
            }
            case "bookmark": {
                if (!$user) return [];
                const bookmarkAnime = await API.getBookmarks();
                const bookmarkIds = bookmarkAnime
                    .filter((item) => item.kitsu_id != null)
                    .map((item) => String(item.kitsu_id));
                if (bookmarkIds.length === 0) return [];
                return (await kitsu.getAnimeByIds(bookmarkIds)) as KitsuAnime[];
            }
            case "seasonal":
                return (
                    (
                        await kitsu.getCategories(
                            [{ type: "seasonal", title: "" }],
                            20,
                        )
                    )[0]?.data ?? []
                );
            case "trending":
                return (
                    (
                        await kitsu.getCategories(
                            [{ type: "trending", title: "" }],
                            20,
                        )
                    )[0]?.data ?? []
                );
            case "highest_rated":
                return (
                    (
                        await kitsu.getCategories(
                            [{ type: "highest_rated", title: "" }],
                            20,
                        )
                    )[0]?.data ?? []
                );
            case "upcoming":
                return (
                    (
                        await kitsu.getCategories(
                            [{ type: "upcoming", title: "" }],
                            20,
                        )
                    )[0]?.data ?? []
                );
            default:
                return [];
        }
    }

    async function handleCategoryVisible(index: number) {
        const category = categories[index];
        if (category.loaded || category.loading) return;

        categories[index].loading = true;

        try {
            const data = await loadCategory(category.type);
            categories[index].data = data;
            categories[index].loaded = true;
        } catch (error) {
            console.error(`Error loading category ${category.type}:`, error);
            categories[index].loaded = true;
        } finally {
            categories[index].loading = false;
        }
    }

    function observeVisibility(node: HTMLElement, index: number) {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    handleCategoryVisible(index);
                }
            },
            { rootMargin: "300px" },
        );

        observer.observe(node);

        return {
            destroy() {
                observer.disconnect();
            },
        };
    }

    onMount(async () => {
        categories = categoryDefinitions.map((def) => ({
            ...def,
            data: null,
            loading: false,
            loaded: false,
        }));

        try {
            const seasonalData = await kitsu.getCategories(
                [{ type: "seasonal", title: "Popular this season" }],
                20,
            );
            forUpcomingCarousel = seasonalData[0]?.data?.slice(0, 5) ?? null;

            const seasonalIndex = categories.findIndex(
                (c) => c.type === "seasonal",
            );
            if (seasonalIndex !== -1) {
                categories[seasonalIndex].data = seasonalData[0]?.data ?? [];
                categories[seasonalIndex].loaded = true;
            }
        } catch (error) {
            console.error("Error loading carousel:", error);
        }

        initialLoaded = true;
    });

    let visibleCategories = $derived(
        categories
            .map((cat, index) => ({ ...cat, index }))
            .filter((cat) => !cat.loaded || (cat.data && cat.data.length > 0)),
    );
</script>

<div class="w-full max-w-full h-fit space-y-4">
    {#if initialLoaded}
        <Carousel slides={forUpcomingCarousel} />

        {#each visibleCategories as category (category.type)}
            <div use:observeVisibility={category.index} class="min-h-[200px]">
                {#if category.loading}
                    <Slider title={category.title}>
                        <div
                            class="flex justify-center items-center w-full h-48"
                        >
                            <Spinner />
                        </div>
                    </Slider>
                {:else if category.loaded && category.data && category.data.length > 0}
                    <Slider title={category.title}>
                        {#each category.data as item (item.id)}
                            <Card
                                {item}
                                onclick={() => goto(`/anime/${item.id}`)}
                            />
                        {/each}
                    </Slider>
                {:else if !category.loaded}
                    <div class="space-y-2">
                        <div
                            class="h-6 w-48 bg-gray-700 rounded animate-pulse"
                        ></div>
                        <div
                            class="h-48 w-full bg-gray-800 rounded animate-pulse"
                        ></div>
                    </div>
                {/if}
            </div>
        {/each}
    {:else}
        <div class="flex justify-center items-center w-full h-screen">
            <Spinner />
        </div>
    {/if}
</div>
