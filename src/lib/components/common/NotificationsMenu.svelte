<script lang="ts">
    import { DropdownMenu } from "bits-ui";
    import { goto } from "$app/navigation";

    import { notifications } from "$lib/stores";
    import { fade } from "svelte/transition";
    import { getSeriesTitle, kitsu } from "$lib/kitsu";
    import { anizip } from "$lib/anizip";

    let { show = $bindable(false), children } = $props();

    let notificationsToDisplay = [];
    let batch = 10;
    let page = 1;

    async function processNotifications() {
        let currentBatch = $notifications.slice(
            (page - 1) * batch,
            page * batch,
        );

        let kitsuIdsToFetch = currentBatch
            .filter((notification) => notification.type === "episode.aired")
            .map((notification) => notification.kitsu_id);

        let kitsuDataFromIds = await Promise.all(
            kitsuIdsToFetch.map((id) =>
                kitsu.getAnimeAndEpisodesByNumber([
                    {
                        episode: currentBatch.find(
                            (notification) => notification.kitsu_id === id,
                        ).episode_number,
                        kitsu_id: id,
                    },
                ]),
            ),
        );

        let anizipDataFromIds = await Promise.all(
            kitsuIdsToFetch.map(async (id) => {
                return { kitsu_id: id, data: await anizip.getAnimeById(id) };
            }),
        );

        currentBatch = currentBatch.map((notification) => {
            switch (notification.type) {
                case "episode.aired":
                    const title = getSeriesTitle(
                        kitsuDataFromIds.find(
                            (data) =>
                                data[0].anime.anime.id ===
                                notification.kitsu_id,
                        )[0].anime.anime,
                    );
                    const kitsuImage = kitsuDataFromIds.find(
                        (data) =>
                            data[0].anime.anime.id === notification.kitsu_id,
                    )[0].episode.attributes.thumbnail?.original;
                    const anizipImage = anizipDataFromIds.find(
                        (data) => data.kitsu_id === notification.kitsu_id,
                    ).data.episodes?.[String(notification.episode_number)]
                        ?.image;

                    notification.title = `Episode ${notification.episode_number} of ${title} just aired!`;
                    notification.image_url = anizipImage || kitsuImage || "";
                    break;
                default:
                    break;
            }

            return notification;
        });

        notificationsToDisplay = currentBatch;
    }

    $effect(() => {
        processNotifications();
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
