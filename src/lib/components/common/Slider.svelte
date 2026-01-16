<!-- src/lib/components/Carousel.svelte -->
<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        title: string;
        children: Snippet;
        showViewAll?: boolean;
        onViewAllClick?: () => void;
        scrollAmount?: number;
        gap?: number;
    }

    let {
        title,
        children,
        showViewAll = true,
        onViewAllClick,
        scrollAmount = 624,
        gap = 16,
    }: Props = $props();

    let containerRef: HTMLDivElement | null = $state(null);
    let scrollPosition = $state(0);
    let maxScroll = $state(0);
    let isScrolling = $state(false);

    function updateScrollState() {
        if (containerRef) {
            scrollPosition = containerRef.scrollLeft;
            maxScroll = containerRef.scrollWidth - containerRef.clientWidth;
        }
    }

    function scroll(direction: "left" | "right") {
        if (!containerRef || isScrolling) return;

        isScrolling = true;
        const amount = direction === "left" ? -scrollAmount : scrollAmount;

        containerRef.scrollBy({
            left: amount,
            behavior: "smooth",
        });

        setTimeout(() => {
            isScrolling = false;
            updateScrollState();
        }, 400);
    }

    let canScrollLeft = $derived(scrollPosition > 0);
    let canScrollRight = $derived(scrollPosition < maxScroll - 1);

    $effect(() => {
        if (containerRef) {
            updateScrollState();

            const resizeObserver = new ResizeObserver(() =>
                updateScrollState(),
            );
            resizeObserver.observe(containerRef);

            return () => resizeObserver.disconnect();
        }
    });
</script>

<section class="relative">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4 px-12">
        <h2 class="text-2xl font-bold text-white max-md:text-xl">{title}</h2>

        <div class="flex items-center gap-4">
            <!-- {#if showViewAll}
                <button
                    class="flex items-center gap-1 text-orange-500 font-semibold text-sm px-3 py-2 rounded hover:bg-orange-500/10 transition-colors"
                    onclick={onViewAllClick}
                >
                    View All
                    <svg
                        class="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"
                        />
                    </svg>
                </button>
            {/if} -->

            <!-- Navigation Buttons -->
            <div class="flex gap-2 max-md:hidden">
                <button
                    class="relative p-2 rounded-full bg-black/30 text-white flex items-center justify-center disabled:text-gray-700 disabled:cursor-not-allowed cursor-pointer before:content-[''] before:absolute before:inset-1 before:rounded-full hover:before:bg-white/10"
                    onclick={() => scroll("left")}
                    disabled={!canScrollLeft}
                    aria-label="Scroll left"
                >
                    <svg class="size-7" viewBox="0 0 24 24" fill="currentColor">
                        <path
                            d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
                        />
                    </svg>
                </button>
                <button
                    class="relative p-2 rounded-full bg-black/30 text-white flex items-center justify-center disabled:text-gray-700 disabled:cursor-not-allowed cursor-pointer before:content-[''] before:absolute before:inset-1 before:rounded-full hover:before:bg-white/10"
                    onclick={() => scroll("right")}
                    disabled={!canScrollRight}
                    aria-label="Scroll right"
                >
                    <svg class="size-7" viewBox="0 0 24 24" fill="currentColor">
                        <path
                            d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"
                        />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- Carousel Wrapper -->
    <div class="relative group">
        <!-- Left Gradient Fade -->
        <div
            class="absolute left-0 top-0 bottom-0 w-20 bg-linear-to-r from-black to-transparent pointer-events-none z-10 transition-opacity duration-300 max-md:w-10"
            class:opacity-0={!canScrollLeft}
        ></div>

        <!-- Scrollable Container -->
        <div
            class="flex overflow-x-auto scroll-smooth px-12 py-2 max-md:px-4 scrollbar-hide"
            style="gap: {gap}px;"
            bind:this={containerRef}
            onscroll={updateScrollState}
        >
            {@render children()}
        </div>

        <!-- Right Gradient Fade -->
        <div
            class="absolute right-0 top-0 bottom-0 w-20 bg-linear-to-l from-black to-transparent pointer-events-none z-10 transition-opacity duration-300 max-md:w-10"
            class:opacity-0={!canScrollRight}
        ></div>

        <!-- Hover Navigation Button - Left -->
        <button
            class="absolute left-2 top-1/2 -translate-y-full rounded-full bg-white text-black flex items-center justify-center outline-hidden disabled:text-gray-700 disabled:cursor-not-allowed cursor-pointer z-20 disabled:hidden opacity-0 group-hover:opacity-100 hover:scale-125 transition-transform duration-150"
            onclick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
        >
            <svg class="size-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
        </button>

        <!-- Hover Navigation Button - Right -->
        <button
            class="absolute right-2 top-1/2 -translate-y-full rounded-full bg-white text-black flex items-center justify-center outline-hidden disabled:text-gray-700 disabled:cursor-not-allowed cursor-pointer z-20 disabled:hidden opacity-0 group-hover:opacity-100 hover:scale-125 transition-transform duration-150"
            onclick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll right"
        >
            <svg class="size-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
            </svg>
        </button>
    </div>
</section>

<style>
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
</style>
