<script lang="ts">
    import { getEpisodeTitle, getSeriesPoster } from "$lib/kitsu";
    import {
        showSource,
        sourceInitialIndex,
        currentAnimeAccentColor,
        user,
    } from "$lib/stores";
    import { DropdownMenu } from "bits-ui";
    import { fade } from "svelte/transition";
    import { getAPIClient } from "$lib/api";

    let { anime, episode, index, show = $bindable(false) } = $props();

    const API = getAPIClient();

    let episode_leftoff = $derived(episode.leftoff ?? 0);

    function getTimePercentage(time1: number, time2: number) {
        return (time2 / time1) * 100;
    }

    function getRelativeTime(dateString?: string) {
        if (!dateString) return null;
        const airDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        airDate.setHours(0, 0, 0, 0);

        const diffTime = airDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const inFuture = diffDays > 0;
        const absDays = Math.abs(diffDays);

        let timeText;
        if (absDays === 0) {
            timeText = "today";
        } else if (absDays === 1) {
            timeText = inFuture ? "tomorrow" : "yesterday";
        } else if (absDays < 30) {
            timeText = `${absDays} days`;
        } else if (absDays < 365) {
            const months = Math.floor(absDays / 30);
            timeText = `${months} ${months === 1 ? "month" : "months"}`;
        } else {
            const years = Math.floor(absDays / 365);
            timeText = `${years} ${years === 1 ? "year" : "years"}`;
        }

        if (absDays === 0) {
            return `Airs ${timeText}`;
        } else if (inFuture) {
            return `Airs in ${timeText}`;
        } else {
            return `Aired ${timeText} ago`;
        }
    }
</script>

<button
    class="group/episode relative text-start flex flex-col gap-3 cursor-pointer select-none outline-none slideIn"
    style="--delay: {index * 50}ms;"
    onclick={() => {
        sourceInitialIndex.set(episode.attributes.number - 1);
        showSource.set(true);
    }}
>
    <!-- /* Thumbnail Section */ -->
    <div
        class="relative w-full aspect-video bg-gray-950 rounded-lg overflow-hidden outline-white outline-offset-2 group-hover/episode:outline-2 group-focus-within/episode:outline-2"
    >
        <!-- Image -->
        <img
            src={episode.anizip?.image ||
                (episode.attributes?.thumbnail &&
                    episode.attributes?.thumbnail?.original) ||
                getSeriesPoster(anime)}
            class="w-full h-full object-cover transition-transform duration-300 group-hover/episode:scale-105 group-focus-within/episode:scale-105"
            loading="lazy"
            alt={`Episode ${episode.attributes.number}`}
        />

        <!-- Episode Number -->
        <div
            class="absolute top-0 right-0 h-8 w-fit px-2 rounded-bl-sm bg-black/80 flex items-center justify-center text-xs"
        >
            {`E${episode.attributes.number}`}
        </div>

        <!-- /* Metadata Badge (Duration) */ -->
        <!-- <div
            class="absolute bottom-2 right-2 px-1.5 py-0.5 text-sm font-bold text-white bg-black/30 rounded-md backdrop-blur-sm shadow-sm"
        >
            {episode.attributes.length
                ? `${episode.attributes.length}min`
                : "N/A"}
        </div> -->

        <DropdownMenu.Root bind:open={show}>
            <DropdownMenu.Trigger
                class="absolute {episode.leftoff
                    ? 'bottom-5'
                    : 'bottom-0'} right-0"
            >
                <button
                    class="opacity-0 size-6 group-hover/episode:opacity-100 group-focus-within/episode:opacity-100 cursor-pointer"
                    aria-label="More options"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="currentColor"
                        class="size-5"
                        ><path
                            d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"
                        /></svg
                    >
                </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content forceMount>
                    {#if show}
                        <div
                            class="w-[260px] px-1 py-1 rounded-2xl border border-gray-100 dark:border-gray-900 z-50 bg-white dark:bg-black/70 dark:text-white shadow-lg text-sm backdrop-blur-2xl"
                            transition:fade={{ duration: 100 }}
                        >
                            {#if user}
                                <DropdownMenu.Item
                                    class="flex rounded-xl py-1.5 px-3 w-full hover:bg-gray-50 dark:hover:bg-white/10 transition cursor-pointer"
                                    onclick={() => {
                                        let to_set_leftoff =
                                            episode.leftoff > 0
                                                ? 0
                                                : episode.attributes.length *
                                                  60;

                                        API.setLeftoff({
                                            kitsu_id: parseInt(anime.id),
                                            episode: episode.attributes.number,
                                            leftoff: to_set_leftoff,
                                        });

                                        episode.leftoff = to_set_leftoff;
                                        episode_leftoff = to_set_leftoff;
                                    }}
                                >
                                    <div class="self-center truncate">
                                        {episode.leftoff > 0
                                            ? "Reset Episode Progress"
                                            : "Mark Episode as Watched"}
                                    </div>
                                </DropdownMenu.Item>
                            {/if}
                        </div>
                    {/if}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <!-- /* Progress Bar */ -->
        {#if episode_leftoff}
            <div
                class="absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-black/90 to-transparent"
            >
                <div
                    class="absolute left-2 right-2 bottom-2 h-1 w-auto bg-white/10 rounded-full"
                >
                    <div
                        class="h-full bg-gray-200 rounded-full"
                        style:background="rgb({$currentAnimeAccentColor?.join(
                            ',',
                        )})"
                        style:width={`${Math.min(
                            getTimePercentage(
                                episode.attributes.length * 60,
                                episode_leftoff,
                            ),
                            100,
                        )}%`}
                    ></div>
                </div>
            </div>
        {/if}
    </div>

    <!-- /* Text Content */ -->
    <div class="relative w-full min-w-0 pb-1">
        <div class="flex items-center gap-2">
            <div class="font-semibold! text-white truncate">
                {episode.anizip?.title?.en ||
                    getEpisodeTitle(episode) ||
                    `Episode ${episode.attributes.number}`}
            </div>
        </div>

        <p
            class="text-sm font-medium text-gray-400 line-clamp-2 leading-relaxed"
        >
            {episode.anizip?.overview || episode.attributes.description || ""}
        </p>

        <!-- <div class="text-sm font-medium text-gray-400 tracking-wide">
            {getRelativeTime(episode.attributes.airdate) || "Unknown Airdate"}
        </div> -->
    </div>
</button>

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
            transform: translateY(0);
            opacity: 1;
        }
    }
</style>
