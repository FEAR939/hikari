<script lang="ts">
    import { DropdownMenu } from "bits-ui";
    import { goto } from "$app/navigation";

    import { notifications } from "$lib/stores";
    import { fade } from "svelte/transition";
    import { getSeriesTitle, kitsu } from "$lib/kitsu";
    import { anizip } from "$lib/anizip";

    let { show = $bindable(false), children } = $props();

    let notificationsToDisplay = $state([]);
    let batch = 10;
    let page = 1;

    async function processNotifications() {
        let currentBatch = $notifications.slice(
            (page - 1) * batch,
            page * batch,
        );

        // Deduplicate kitsu IDs
        let episodeNotifications = currentBatch.filter(
            (n) => n.type === "episode.aired",
        );
        let uniqueKitsuIds = [
            ...new Set(episodeNotifications.map((n) => n.kitsu_id)),
        ];

        // Build the query array once (one entry per unique ID)
        let kitsuQueries = uniqueKitsuIds.map((id) => ({
            kitsu_id: id,
            episode: episodeNotifications.find((n) => n.kitsu_id === id)
                .episode_number,
        }));

        // Fetch kitsu and anizip data in parallel
        let [kitsuResults, anizipResults] = await Promise.all([
            Promise.all(
                kitsuQueries.map((q) => kitsu.getAnimeAndEpisodesByNumber([q])),
            ),
            Promise.all(
                uniqueKitsuIds.map(async (id) => ({
                    kitsu_id: id,
                    data: await anizip.getAnimeById(id),
                })),
            ),
        ]);

        // Build lookup maps for O(1) access
        let kitsuMap = new Map();
        for (let result of kitsuResults) {
            let entry = result[0];
            kitsuMap.set(entry.anime.anime.id, entry);
        }

        let anizipMap = new Map();
        for (let result of anizipResults) {
            anizipMap.set(result.kitsu_id, result.data);
        }

        // Enrich notifications
        currentBatch = currentBatch.map((notification) => {
            if (notification.type === "episode.aired") {
                let kitsuData = kitsuMap.get(notification.kitsu_id);
                let anizipData = anizipMap.get(notification.kitsu_id);

                let title = getSeriesTitle(kitsuData.anime.anime);
                let kitsuImage =
                    kitsuData.episode.attributes.thumbnail?.original;
                let anizipImage =
                    anizipData?.episodes?.[String(notification.episode_number)]
                        ?.image;

                notification.title = `Episode ${notification.episode_number} of ${title} just aired!`;
                notification.image_url = anizipImage || kitsuImage || "";
            }
            return notification;
        });

        notificationsToDisplay = currentBatch;
    }

    $effect(() => {
        if (show) {
            processNotifications();
        }
    });
</script>

<DropdownMenu.Root bind:open={show}>
    <DropdownMenu.Trigger class="group/notificationsmenu outline-hidden">
        {@render children()}
    </DropdownMenu.Trigger>

    <DropdownMenu.Content
        sideOffset={4}
        align="center"
        forceMount
        class="outline-hidden"
    >
        {#if show}
            <div
                class="w-sm px-1 py-1 rounded-2xl border border-gray-100 dark:border-gray-900 z-50 bg-white dark:bg-black/70 dark:text-white shadow-lg text-sm backdrop-blur-2xl"
                transition:fade={{ duration: 100 }}
            >
                <DropdownMenu.Item class="py-1.5 px-3">
                    <div class="text-lg font-semibold!">Notifications</div>
                </DropdownMenu.Item>
                {#each notificationsToDisplay as notification}
                    <DropdownMenu.Item
                        class="flex items-center gap-x-4 rounded-xl py-1.5 px-3 w-full hover:bg-gray-50 dark:hover:bg-white/10 focus:bg-white/10 transition cursor-pointer outline-hidden"
                        onclick={async () => {
                            // show = false;
                            // TODO!
                        }}
                    >
                        <div class="self-center line-clamp-2">
                            {notification.title}
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
                    </DropdownMenu.Item>
                {/each}
            </div>
        {/if}
    </DropdownMenu.Content>
</DropdownMenu.Root>
