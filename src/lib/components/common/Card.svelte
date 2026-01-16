<script lang="ts">
    import { clsx } from "clsx";
    import { onDestroy, onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { getAPIClient } from "$lib/api";
    import { user } from "$lib/stores";
    import { goto } from "$app/navigation";
    import { toast } from "svelte-sonner";
    import {
        getSeriesPoster,
        getSeriesTitle,
        type KitsuAnime,
    } from "$lib/kitsu";
    import ColorThief from "colorthief";

    let API = getAPIClient();

    interface Props {
        item: KitsuAnime;
        class?: string;
        options?: {
            showTitle?: boolean;
            showRelationType?: boolean;
        };
        onclick?: () => null;
    }

    let {
        item,
        class: className = "",
        options = { showTitle: true, showRelationType: false },
        onclick = undefined,
    }: Props = $props();

    let cardElement: HTMLDivElement | null = $state(null);
    let hoveredCardElement: HTMLDivElement | null = $state(null);
    let frame: HTMLIFrameElement | null = $state(null);
    let timeout: ReturnType<typeof setInterval> | null = null;
    let hovered = $state(false);
    let hoveredPosition = $state({ left: 0, top: 0 });

    let accentColor = $state(null);

    let bookmarked = $state(false);

    function calculateCardSize() {
        if (!cardElement) return;

        const rect = cardElement.getBoundingClientRect();
        const cardWidth = 72 * 4; // 288px
        const cardHeight = 88 * 4; // 352px

        const left = rect.left + rect.width / 2 - cardWidth / 2;
        const top = rect.top + rect.height / 2 - cardHeight / 2;

        const minLeft = 8 * 8 + 8; // 72px
        const minTop = 8;
        const maxLeft = window.innerWidth - cardWidth - 8;
        const maxTop = window.innerHeight - cardHeight - 8;

        hoveredPosition = {
            left: Math.min(Math.max(left, minLeft), maxLeft),
            top: Math.min(Math.max(top, minTop), maxTop),
        };
    }

    function initFrame() {
        if (!frame) return;

        timeout = setInterval(() => {
            frame?.contentWindow?.postMessage(
                '{"event":"listening","id":1,"channel":"widget"}',
                "*",
            );
        }, 100);

        frame.contentWindow?.postMessage(
            '{"event":"listening","id":1,"channel":"widget"}',
            "*",
        );
    }

    function handleYouTubeMessage(e: MessageEvent) {
        if (e.origin !== "https://www.youtube-nocookie.com") return;
        if (timeout) {
            clearInterval(timeout);
            timeout = null;
        }
    }

    function handleMouseEnter() {
        return;
        calculateCardSize();
        timeout = setTimeout(async () => {
            hovered = true;
            if (user) {
                const bookmark = await API.getBookmarks(parseInt(item.id));
                bookmarked = bookmark?.[0]?.subscribed || false;
            }
        }, 500);
    }

    function handleMouseLeave() {
        hovered = false;
        if (timeout) {
            clearInterval(timeout);
            timeout = null;
        }
    }

    onMount(() => {
        window.addEventListener("message", handleYouTubeMessage);
    });

    onDestroy(() => {
        window.removeEventListener("message", handleYouTubeMessage);
        if (timeout) clearInterval(timeout);
    });
</script>

<!-- Main Card -->
<button
    class={clsx(
        "group/card h-fit w-36 md:w-48 cursor-pointer shrink-0 block outline-hidden text-left",
        className,
    )}
    style="--delay: 250ms"
    onclick={() => onclick?.()}
>
    <div class="h-full w-full slideIn">
        <div
            class="w-full aspect-[0.7/1] overflow-hidden rounded-lg flex items-stretch justify-stretch bg-gray-800 outline-white outline-offset-2 group-hover/card:outline-2 group-focus-within/card:outline-2"
        >
            <img
                src={getSeriesPoster(item)}
                class="block min-h-full h-full min-w-full w-full object-cover group-hover/card:scale-105 group-focus-within/card:scale-105 transition-transform duration-300"
                alt="Poster"
                loading="lazy"
            />
        </div>

        {#if options.showTitle}
            <div class="mt-2 font-medium space-y-1">
                <div class="text-white line-clamp-2">
                    {getSeriesTitle(item)}
                </div>
                {#if options.showRelationType && item.relationType}
                    <div class="text-neutral-500 text-xs">
                        {item.relationType}
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</button>

<!--
{#if hovered}
    <div
        bind:this={hoveredCardElement}
        class="fixed z-50 h-88 w-72 bg-black/70 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-900 transition-opacity duration-200 cursor-default"
        style="left: {hoveredPosition.left}px; top: {hoveredPosition.top}px;"
        onmouseleave={handleMouseLeave}
        onclick={(e) => {
            e.stopPropagation();
        }}
        onkeydown={undefined}
        role="dialog"
        tabindex="-1"
        transition:fade={{ duration: 200 }}
    >
        <div class="relative w-full aspect-video">
            <img
                src={getSeriesPoster(item)}
                class="w-full h-full object-cover {item.attributes
                    .youtubeVideoId
                    ? 'hidden'
                    : ''}"
                alt="Preview"
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
                            s =
                                l > 0.5
                                    ? d / (2 - max - min)
                                    : d / (max + min);

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
            {#if item.attributes.youtubeVideoId}
                <div
                    class="absolute top-0 w-full h-full overflow-clip rounded-t-2xl bg-black mask-b-to-99% mask-y-gray-900"
                >
                    <iframe
                        bind:this={frame}
                        src="https://www.youtube-nocookie.com/embed/{item
                            .attributes
                            .youtubeVideoId}?autoplay=1&controls=0&mute=1&disablekb=1&loop=1&playlist={item
                            .attributes.youtubeVideoId}&cc_lang_pref=ja"
                        title="Trailer"
                        class="w-full border-0 left-0 h-[calc(100%+200px)] pointer-events-none absolute top-1/2 transform-gpu -translate-y-1/2"
                        frameborder="0"
                        allow="autoplay; encrypted-media"
                        onload={initFrame}
                    ></iframe>
                </div>
            {/if}
        </div>

        <div class="p-4 space-y-2">
            <h3 class="text-white font-semibold text-base line-clamp-2">
                {getSeriesTitle(item)}
            </h3>

            <div class="flex h-7 space-x-2">
                <button
                    class="w-full h-full rounded-full text-black text-xs flex items-center justify-center space-x-1 cursor-pointer"
                    style:background="rgb({accentColor?.join(',')})"
                    onclick={() => {
                        goto(`/anime/${item.id}`);
                    }}
                    aria-label="Watch"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="#000000"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-play size-2.5"
                    >
                        <path
                            d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"
                        />
                    </svg>
                    <div class="h-2.75 leading-none">Watch Now</div>
                </button>
                <button
                    class="relative min-w-7 min-h-7 size-7 bg-black/30 rounded-full flex items-center justify-center cursor-pointer before:content-[''] before:absolute before:inset-1 before:rounded-full hover:before:bg-white/10"
                    onclick={async () => {
                        const result = API.setBookmark(
                            parseInt(item.id),
                            !bookmarked,
                            false,
                            false,
                        );
                        if (!result) return;
                        bookmarked = !bookmarked;
                    }}
                    aria-label="Bookmark"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill={bookmarked ? "currentColor" : "none"}
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-bookmark size-3"
                    >
                        <path
                            d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"
                        />
                    </svg>
                </button>

                <button
                    class="relative min-w-7 min-h-7 size-7 bg-black/30 rounded-full flex items-center justify-center cursor-pointer before:content-[''] before:absolute before:inset-1 before:rounded-full hover:before:bg-white/10"
                    onclick={async () => {
                        window.electronAPI.clipboardWriteText(
                            `hikari://hikari.app/anime/${item.id}`,
                        );
                        toast.success("Link copied to clipboard!");
                    }}
                    aria-label="share"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="currentColor"
                        class="size-3"
                        ><path
                            d="M680-80q-50 0-85-35t-35-85q0-6 3-28L282-392q-16 15-37 23.5t-45 8.5q-50 0-85-35t-35-85q0-50 35-85t85-35q24 0 45 8.5t37 23.5l281-164q-2-7-2.5-13.5T560-760q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-24 0-45-8.5T598-672L317-508q2 7 2.5 13.5t.5 14.5q0 8-.5 14.5T317-452l281 164q16-15 37-23.5t45-8.5q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T720-200q0-17-11.5-28.5T680-240q-17 0-28.5 11.5T640-200q0 17 11.5 28.5T680-160ZM200-440q17 0 28.5-11.5T240-480q0-17-11.5-28.5T200-520q-17 0-28.5 11.5T160-480q0 17 11.5 28.5T200-440Zm480-280q17 0 28.5-11.5T720-760q0-17-11.5-28.5T680-800q-17 0-28.5 11.5T640-760q0 17 11.5 28.5T680-720Zm0 520ZM200-480Zm480-280Z"
                        /></svg
                    >
                </button>
            </div>

            {#if item.attributes.synopsis}
                <p class="text-gray-400 text-sm line-clamp-4">
                    {item.attributes.synopsis}
                </p>
            {/if}
        </div>
    </div>
{/if}
-->

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
