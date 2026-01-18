<script lang="ts">
    import { getEpisodeTitle, getSeriesPoster } from "$lib/kitsu";
    import {
        showSource,
        sourceInitialIndex,
        currentAnimeAccentColor,
    } from "$lib/stores";

    let { anime, episode, index } = $props();

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
        class="relative w-full aspect-video bg-gray-950 rounded-lg overflow-hidden outline-white outine-offset-2 group-hover/episode:outline-2 group-focus-within/episode:outline-2"
    >
        <!-- Image -->
        <img
            src={episode.anizipImage ||
                (episode.attributes?.thumbnail &&
                    episode.attributes?.thumbnail?.original) ||
                getSeriesPoster(anime)}
            class="w-full h-full object-cover transition-transform duration-300 group-hover/episode:scale-105 group-focus-within/episode:scale-105"
            loading="lazy"
            alt={`Episode ${episode.attributes.number}`}
        />

        <!-- Episode Number -->
        <div
            class="absolute top-0 right-0 h-8 w-fit px-2 rounded-bl-md bg-black/70 flex items-center justify-center text-sm"
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

        <!-- /* Progress Bar */ -->
        {#if episode.leftoff}
            <div
                class="absolute bottom-0 left-0 right-0 h-3 bg-linear-to-t from-black/50 to-transparent rounded-full"
            >
                <div
                    class="absolute bottom-0 h-0.75 shadow-xl rounded-full"
                    style:background="rgb({$currentAnimeAccentColor?.join(
                        ',',
                    )})"
                    style:width={`${Math.min(
                        getTimePercentage(
                            episode.attributes.length * 60,
                            episode.leftoff,
                        ),
                        100,
                    )}%`}
                ></div>
            </div>
        {/if}
    </div>

    <!-- /* Text Content */ -->
    <div class="relative w-full min-w-0 pb-1">
        <div class="flex items-center gap-2">
            <div class="font-semibold! text-white truncate">
                {getEpisodeTitle(episode) ||
                    `Episode ${episode.attributes.number}`}
            </div>
        </div>

        <p
            class="text-sm font-medium text-gray-400 line-clamp-2 leading-relaxed"
        >
            {episode.attributes.description || ""}
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
