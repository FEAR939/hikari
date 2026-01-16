<script lang="ts">
    import Card from "$lib/components/common/Card.svelte";
    import EpisodeView from "$lib/components/common/Episodeview.svelte";
    import { getAPIClient } from "$lib/api";
    import {
        user,
        currentAnime,
        currentAnimeAccentColor,
        showTrailer,
    } from "$lib/stores";
    import {
        getSeriesBackdrop,
        getSeriesPoster,
        getSeriesTitle,
        kitsu,
    } from "$lib/kitsu";
    import Spinner from "$lib/components/common/Spinner.svelte";
    import { page } from "$app/state";
    import SourceModal from "$lib/components/modals/SourceModal.svelte";
    import { showSource } from "$lib/stores";
    import { onDestroy } from "svelte";
    import { toast } from "svelte-sonner";
    import { fade } from "svelte/transition";
    import Star from "$lib/components/common/Star.svelte";
    import { goto } from "$app/navigation";
    import ColorThief from "colorthief";
    import Trailer from "$lib/components/common/Trailer.svelte";
    import TrailerModal from "$lib/components/modals/TrailerModal.svelte";

    let API = getAPIClient();

    let loaded = $state(false);
    let data = $state<any>(null);
    let isBookmarked = $state(false);
    let minRepeats = $state(3);
    let currentTab = $state(0);

    let currentAnimeColorPalette = $state([]);

    // Get reactive ID from page store
    let animeId = $derived(page.params.id);
    let lastLoadedId = $state<string | null>(null);

    let stars = $state([]);
    let starCount = 25;

    function createStars() {
        let tempstars = [];
        for (let i = 0; i < starCount; i++) {
            let star = {
                position: {
                    x: Math.random(),
                    y: Math.random(),
                },
                rotation: Math.random() * 360,
                size: Math.random() * 5 + 1,
            };

            tempstars.push(star);
        }
        stars = tempstars;
    }

    createStars();

    setInterval(() => {
        createStars();
    }, 10000);

    const tabs = [{ label: "Episodes", default: true }, { label: "Thread" }];

    async function loadAnimeData(id: string) {
        // Reset state
        loaded = false;
        data = null;
        currentTab = 0;

        try {
            const kitsuAnime = await kitsu.getAnimeById(id);

            kitsuAnime.relations = kitsuAnime.relations
                .filter(
                    (relation: any) =>
                        relation.role === "sequel" ||
                        relation.role === "prequel",
                )
                .map((relation: any) => {
                    relation.anime.relationType = relation.role;
                    return relation.anime;
                });

            let progress, bookmarked;

            if ($user) {
                [progress, bookmarked] = await Promise.all([
                    API.getAnimeProgress(
                        kitsuAnime.anime.id,
                        1,
                        kitsuAnime.anime.attributes.episodeCount!,
                    ),
                    API.getBookmarks(parseInt(kitsuAnime.anime.id)),
                ]);
            }

            data = {
                animeObj: kitsuAnime,
                progress: progress || false,
                bookmarked: bookmarked?.[0]?.subscribed || false,
            };

            currentAnime.set(data.animeObj);

            isBookmarked = data.bookmarked;

            minRepeats = Math.max(
                3,
                Math.ceil(
                    (window.innerWidth * 3) /
                        (data.animeObj.genres.length * 100),
                ),
            );

            loaded = true;
        } catch (error) {
            console.error("Failed to load anime:", error);
        }
    }

    // Re-run when animeId changes
    $effect(() => {
        if (animeId && animeId !== lastLoadedId) {
            lastLoadedId = animeId;
            loadAnimeData(animeId);
        }
    });

    onDestroy(() => {
        currentAnime.set(null);
    });
</script>

<div class="relative h-full w-full">
    {#if loaded && data}
        <SourceModal bind:show={$showSource} anime={data.animeObj.anime}
        ></SourceModal>

        <TrailerModal bind:show={$showTrailer} anime={data.animeObj.anime}
        ></TrailerModal>

        <div class="h-full">
            <!-- Banner -->
            <div
                class="relative w-screen aspect-[2.5/1] mask-b-from-60% bg-black overflow-hidden"
            >
                <img
                    class="min-w-full w-fit min-h-full h-fit object-cover brightness-25"
                    src={getSeriesBackdrop(data.animeObj.anime) ||
                        getSeriesPoster(data.animeObj.anime, "original")}
                    alt=""
                />
            </div>

            <div
                class="absolute top-[calc(100dvw*(1/2.5)-550px)] h-full w-full md:px-12"
            >
                <div class="max-w-400 w-full h-fit pb-8 mx-auto">
                    <!-- Hero Section -->
                    <div class="relative z-1 h-fit w-full mt-32 md:mt-64 flex">
                        <!-- Cover Image -->
                        <div
                            class="relative w-24 md:w-56 h-fit shrink-0 space-y-3 md:space-y-6"
                        >
                            <div
                                class="relative z-1 w-full aspect-[0.7/1] overflow-hidden rounded-2xl grid place-items-center"
                            >
                                <img
                                    src={getSeriesPoster(data.animeObj.anime)}
                                    class="min-w-full w-fit min-h-full h-fit object-cover"
                                    alt=""
                                    crossorigin="anonymous"
                                    onload={(e) => {
                                        const img = e.target;

                                        if (!img) return;

                                        const colorThief = new ColorThief();

                                        const palette = colorThief.getPalette(
                                            img,
                                            8,
                                        );

                                        let bestColor = palette[0];
                                        let bestScore = -1;

                                        for (const [r, g, b] of palette) {
                                            const { s, l } = rgbToHsl(r, g, b);
                                            const score =
                                                s * (1 - Math.abs(l - 0.5) * 2);

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
                                                s =
                                                    l > 0.5
                                                        ? d / (2 - max - min)
                                                        : d / (max + min);

                                                switch (max) {
                                                    case r:
                                                        h =
                                                            ((g - b) / d +
                                                                (g < b
                                                                    ? 6
                                                                    : 0)) /
                                                            6;
                                                        break;
                                                    case g:
                                                        h =
                                                            ((b - r) / d + 2) /
                                                            6;
                                                        break;
                                                    case b:
                                                        h =
                                                            ((r - g) / d + 4) /
                                                            6;
                                                        break;
                                                }
                                            }

                                            return { h, s, l };
                                        }

                                        $currentAnimeAccentColor = bestColor;
                                        currentAnimeColorPalette = palette;
                                    }}
                                />
                            </div>
                            <div
                                class="absolute top-0 blur-xl w-full aspect-[0.7/1] overflow-hidden rounded-2xl grid place-items-center"
                            >
                                <img
                                    src={getSeriesPoster(data.animeObj.anime)}
                                    class="min-w-full w-fit min-h-full h-fit object-cover"
                                    alt=""
                                />
                            </div>
                        </div>

                        <!-- Info -->
                        <div
                            class="relative flex-1 p-4 pt-8 space-y-2 md:space-y-4 overflow-hidden"
                        >
                            <h1
                                class="w-full text-white text-shadow-2xl text-xl md:text-4xl font-bold! flex items-center space-x-4 leading-none truncate"
                            >
                                {getSeriesTitle(data.animeObj.anime)}
                            </h1>

                            <!-- Chips -->
                            <div
                                class="w-full flex items-center gap-4 text-xs overflow-hidden"
                            >
                                <span
                                    class="p-1.5 rounded bg-black/50 text-white"
                                >
                                    {data.animeObj.anime.attributes.showType.toUpperCase()}
                                </span>
                                <span class="text-gray-400"
                                    >{data.animeObj.anime.attributes.startDate.slice(
                                        0,
                                        4,
                                    )}</span
                                >
                                <span class="text-gray-400"
                                    >{data.animeObj.anime.attributes
                                        .episodeCount} Episodes</span
                                >
                            </div>

                            <!-- Button Row -->
                            <div
                                class="w-full h-12 my-8 flex items-center space-x-1 md:space-x-2 shrink-0 grow-0"
                            >
                                <!-- Bookmark -->
                                <button
                                    class="relative h-full w-fit px-4.5 space-x-2 bg-white text-black rounded-full flex items-center justify-center cursor-pointer"
                                    style:background="rgb({$currentAnimeAccentColor?.join(
                                        ',',
                                    )})"
                                    onclick={async () => {
                                        const result = API.setBookmark(
                                            parseInt(data.animeObj.anime.id),
                                            !isBookmarked,
                                            false,
                                            false,
                                        );
                                        if (!result) return;
                                        isBookmarked = !isBookmarked;
                                    }}
                                    aria-label="bookmark"
                                >
                                    <svg
                                        width="100%"
                                        height="100%"
                                        viewBox="0 0 24 24"
                                        fill={isBookmarked
                                            ? "currentColor"
                                            : "none"}
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="size-5"
                                    >
                                        <path
                                            d="M5 7.8C5 6.11984 5 5.27976 5.32698 4.63803C5.6146 4.07354 6.07354 3.6146 6.63803 3.32698C7.27976 3 8.11984 3 9.8 3H14.2C15.8802 3 16.7202 3 17.362 3.32698C17.9265 3.6146 18.3854 4.07354 18.673 4.63803C19 5.27976 19 6.11984 19 7.8V21L12 17L5 21V7.8Z"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        />
                                    </svg>
                                    <span class="leading-none h-3.5"
                                        >{isBookmarked
                                            ? "Remove from"
                                            : "Add to"} your Watchlist</span
                                    >
                                </button>

                                <!-- Favourite -->
                                <div
                                    class="relative size-12 bg-white/5 rounded-full flex items-center justify-center cursor-pointer before:content-[''] before:absolute before:inset-1 before:rounded-full hover:before:bg-white/10"
                                >
                                    <svg
                                        width="100%"
                                        height="100%"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        class="size-5"
                                    >
                                        <path
                                            d="M16.1111 3C19.6333 3 22 6.3525 22 9.48C22 15.8138 12.1778 21 12 21C11.8222 21 2 15.8138 2 9.48C2 6.3525 4.36667 3 7.88889 3C9.91111 3 11.2333 4.02375 12 4.92375C12.7667 4.02375 14.0889 3 16.1111 3Z"
                                            stroke="currentColor"
                                            stroke-width="2"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        />
                                    </svg>
                                </div>

                                <!-- Share -->
                                <button
                                    class="relative size-12 bg-white/5 rounded-full flex items-center justify-center cursor-pointer before:content-[''] before:absolute before:inset-1 before:rounded-full hover:before:bg-white/10"
                                    onclick={async () => {
                                        window.electronAPI.clipboardWriteText(
                                            `hikari://hikari.app/anime/${animeId}`,
                                        );
                                        toast.success(
                                            "Link copied to clipboard!",
                                        );
                                    }}
                                    aria-label="share"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="24px"
                                        viewBox="0 -960 960 960"
                                        width="24px"
                                        fill="currentColor"
                                        class="size-5"
                                        ><path
                                            d="M680-80q-50 0-85-35t-35-85q0-6 3-28L282-392q-16 15-37 23.5t-45 8.5q-50 0-85-35t-35-85q0-50 35-85t85-35q24 0 45 8.5t37 23.5l281-164q-2-7-2.5-13.5T560-760q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-24 0-45-8.5T598-672L317-508q2 7 2.5 13.5t.5 14.5q0 8-.5 14.5T317-452l281 164q16-15 37-23.5t45-8.5q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T720-200q0-17-11.5-28.5T680-240q-17 0-28.5 11.5T640-200q0 17 11.5 28.5T680-160ZM200-440q17 0 28.5-11.5T240-480q0-17-11.5-28.5T200-520q-17 0-28.5 11.5T160-480q0 17 11.5 28.5T200-440Zm480-280q17 0 28.5-11.5T720-760q0-17-11.5-28.5T680-800q-17 0-28.5 11.5T640-760q0 17 11.5 28.5T680-720Zm0 520ZM200-480Zm480-280Z"
                                        /></svg
                                    >
                                </button>
                            </div>

                            <!-- Description -->
                            <div
                                class="max-w-240 w-full text-base text-gray-300 line-clamp-3"
                            >
                                {data.animeObj.anime.attributes.description}
                            </div>
                        </div>
                    </div>

                    <!-- Stars -->
                    <div class="absolute top-128 left-0 right-0 h-48 w-full">
                        <div class="relative h-full w-full"></div>
                        {#each new Array(15) as _}
                            <Star />
                        {/each}
                    </div>

                    <!-- Genres -->
                    <div
                        class="w-full inline-flex flex-nowrap mt-8 mask-l-from-98% mask-r-from-98% mask-x-[#080808]"
                    >
                        {#each Array.from({ length: minRepeats }) as _}
                            <div
                                class="flex items-center [&_span]:mx-1 infinite-scroll"
                            >
                                {#each data.animeObj.genres as genre}
                                    <span
                                        class="px-2 md:px-4 py-1 md:py-2 text-sm rounded-full text-white text-nowrap"
                                    >
                                        {genre.attributes.title}
                                    </span>
                                {/each}
                            </div>
                        {/each}
                    </div>

                    <!-- Relations Section -->
                    {#if data.animeObj.relations.length > 0}
                        <div
                            class="w-full h-fit space-y-4 pt-8 mt-8 border-t border-white/10"
                        >
                            <h2 class="text-2xl font-bold">Relations</h2>
                            <div class="flex gap-4">
                                {#each data.animeObj.relations as relation}
                                    <Card
                                        item={relation}
                                        onclick={() =>
                                            goto(`/anime/${relation.id}`)}
                                    />
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <!-- Tab Section -->
                    <div class="w-full h-fit space-y-8 pt-8 mt-8">
                        <div class="flex w-full gap-4 border-b border-white/10">
                            {#each tabs as tab, index}
                                <button
                                    class={`px-2 py-2 text-md cursor-pointer ${currentTab === index ? "border-b-2 border-white text-white" : "text-neutral-500 outline-none"}`}
                                    onclick={() => {
                                        currentTab = index;
                                    }}
                                >
                                    {tab.label}
                                </button>
                            {/each}
                        </div>
                        <div class="w-full h-fit">
                            {#if currentTab === 0}
                                {#key animeId}
                                    <EpisodeView anime={data.animeObj.anime} />
                                {/key}
                            {/if}
                        </div>
                    </div>

                    <!-- Trailer Section -->
                    {#if data.animeObj.anime.attributes.youtubeVideoId}
                        <div
                            class="w-full h-fit space-y-4 pt-8 mt-8 border-t border-white/10"
                        >
                            <h2 class="text-2xl font-bold">Trailer</h2>
                            <div class="flex gap-4">
                                <Trailer
                                    youtubeId={data.animeObj.anime.attributes
                                        .youtubeVideoId}
                                />
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    {:else}
        <div class="w-full h-screen flex items-center justify-center">
            <Spinner />
        </div>
    {/if}
</div>

<style>
    .infinite-scroll {
        animation: infinite-scroll 25s linear infinite;
    }

    @keyframes infinite-scroll {
        0% {
            transform: translateX(0);
        }
        100% {
            transform: translateX(-100%);
        }
    }
</style>
