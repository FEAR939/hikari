<script lang="ts">
    let { notification } = $props();
    import { goto } from "$app/navigation";

    function getRelativeTime(dateString?: string) {
        if (!dateString) return null;
        const airDate = new Date(dateString);
        const now = new Date();
        const diffTime = airDate.getTime() - now.getTime();
        const inFuture = diffTime > 0;
        const absDiff = Math.abs(diffTime);

        const seconds = Math.floor(absDiff / 1000);
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);
        const weeks = Math.round(days / 7);
        const months = Math.round(days / 30);
        const years = Math.round(days / 365);

        let timeText: string;

        if (seconds < 60) {
            timeText = `${seconds} ${seconds === 1 ? "second" : "seconds"}`;
        } else if (minutes < 60) {
            timeText = `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
        } else if (hours < 24) {
            timeText = `${hours} ${hours === 1 ? "hour" : "hours"}`;
        } else if (days < 7) {
            timeText = `${days} ${days === 1 ? "day" : "days"}`;
        } else if (days < 30) {
            timeText = `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
        } else if (days < 365) {
            timeText = `${months} ${months === 1 ? "month" : "months"}`;
        } else {
            timeText = `${years} ${years === 1 ? "year" : "years"}`;
        }

        if (seconds === 0) {
            return "Just now";
        } else if (inFuture) {
            return `In ${timeText}`;
        } else {
            return `${timeText} ago`;
        }
    }
</script>

<button
    class="flex gap-x-4 rounded-xl py-1.5 px-3 w-full text-left hover:bg-gray-50 dark:hover:bg-white/10 focus:bg-white/10 transition cursor-pointer outline-hidden"
    onclick={async () => {
        // show = false;
        // TODO!

        if (notification.type === "episode.aired") {
            await goto(`/anime/${notification.kitsu_id}`);
        }
    }}
>
    <div class="space-y-2">
        <div class="self-center line-clamp-2">
            {notification.title}
        </div>
        <div class="text-gray-500 text-xs">
            {getRelativeTime(notification.created_at)}
        </div>
    </div>

    {#if notification.type === "episode.aired"}
        <div>
            <img
                src={notification.image_url}
                alt="Episode Aired"
                class="w-32 aspect-video rounded-md"
            />
        </div>
    {/if}
</button>
