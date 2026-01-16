<script lang="ts">
    import Modal from "../common/Modal.svelte";
    import {
        kitsu,
        getEpisodeTitle,
        getSeriesBackdrop,
        getSeriesPoster,
    } from "$lib/kitsu";
    import { cache } from "$lib/cache/cache";

    import {
        sourceInitialIndex,
        showPlayer,
        playerAnime,
        playerEpisode,
        playerSources,
        playerSourceIndex,
        settings,
    } from "$lib/stores";
    import EpisodeInput from "../common/EpisodeInput.svelte";
    import SourceMenu from "../common/SourceMenu.svelte";
    import Source from "../common/Source.svelte";
    import { toast } from "svelte-sonner";

    let currentIndex = $derived<number>($sourceInitialIndex);
    let currentEpisode = $state<null | {}>(null);
    let sources = $state([]);
    let extensions;
    let episodes;

    let showSourceMenu = $state(false);

    let { show = $bindable(false), anime } = $props();

    async function prepareLoad() {
        const episodesPerPage = 15;
        const relativeEpisodePage = Math.floor(currentIndex / episodesPerPage);
        const relativeEpisodeIndex =
            currentIndex - relativeEpisodePage * episodesPerPage;

        episodes = (
            await kitsu.getEpisodesPagination(
                anime.id,
                relativeEpisodePage,
                episodesPerPage,
            )
        ).map((episode) => {
            // For compatibility with the extensions
            return {
                ...episode,
                episode: episode.attributes.number,
            };
        });

        currentEpisode = episodes[relativeEpisodeIndex];

        const extensionSettings = JSON.parse(
            localStorage.getItem("extensions") || "[]",
        );
        extensions = (await window.electronAPI.loadExtensions()).filter(
            (extension) => {
                return (
                    extensionSettings.find((ext) => ext.id === extension.github)
                        ?.enabled ?? true
                );
            },
        );

        for (const extension of extensions) {
            const data = await window.electronAPI.readFileBinary(
                `${extension.path}/icon.png`,
            );
            if (data) {
                const blob = new Blob([data], { type: "image/png" });
                const imageUrl = URL.createObjectURL(blob);
                extension.icon = imageUrl;
            }
        }

        console.log(extensions);
    }

    async function loadExtension(filePath) {
        const code = await window.electronAPI.readFile(filePath);
        const extension = await import(
            `data:text/javascript,${encodeURIComponent(code)}`
        );
        return extension;
    }

    async function sanitizeTitle(title: string) {
        return title
            .replaceAll(" ", "-")
            .replaceAll(":", "")
            .replaceAll("'", "")
            .replaceAll('"', "");
    }

    async function loadLocal() {
        const storage_path = $settings.media_storage_path;

        if (!storage_path) return;

        const animeTitles = [
            await sanitizeTitle(anime.attributes.titles.en || ""),
            await sanitizeTitle(anime.attributes.titles.en_us || ""),
            await sanitizeTitle(anime.attributes.titles.en_jp || ""),
            await sanitizeTitle(anime.attributes.titles.en_cn || ""),
            await sanitizeTitle(anime.attributes.titles.ja_jp || ""),
            await sanitizeTitle(anime.attributes.titles.ch_cn || ""),
        ].filter((title) => title !== "");

        const stored_anime = await window.electronAPI.getLocalMedia(
            storage_path,
            animeTitles,
        );

        if (!stored_anime || stored_anime.length === 0) return;

        const episode_file = stored_anime.filter((file: any) => {
            const match = file.name.toLowerCase().match(/e(\d+)/);
            const matchAlt = file.name.toLowerCase().match(/ep(\d+)/);
            // if (anime.attributes.showType === "MOVIE") return true;
            if (match && parseInt(match[1]) === currentIndex + 1) return true;
            if (matchAlt && parseInt(matchAlt[1]) === currentIndex + 1)
                return true;
            return false;
        });

        if (episode_file.length === 0) return;

        const file_metadata = await window.electronAPI.getLocalMediaMetadata(
            episode_file[0].path,
        );

        if (!file_metadata) return;

        console.log({
            ...episode_file[0],
            ...file_metadata,
        });

        function formatBytes(bytes: number, decimals = 2) {
            if (bytes === 0) return "0 Bytes";
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return (
                parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) +
                " " +
                sizes[i]
            );
        }

        sources.push({
            type: "local",
            from: "This Device",
            icon: "/icon.png",
            file_name: episode_file[0].name,
            file_url: episode_file[0].path,
            file_size: formatBytes(episode_file[0].size),
            file_quality: `${file_metadata.height}p`,
            ...episode_file[0],
            ...file_metadata,
        });
    }

    async function loadExternal() {
        extensions
            .filter((extension) => extension.type === "source")
            .forEach(async (source_extension) => {
                const imported_extension = await loadExtension(
                    `${source_extension.path}/${source_extension.main}`,
                );
                const SourceExtensionClass = new imported_extension.Extension(
                    cache,
                );

                const source = await SourceExtensionClass.getProvider({
                    romaji: anime.attributes.titles.en_jp,
                    english: anime.attributes.titles.en,
                });

                if (!source) return;

                source.hosters.forEach(async (source_hoster) => {
                    const extensionIndex = extensions.findIndex(
                        (extension_hoster: any) =>
                            extension_hoster.type === "stream" &&
                            extension_hoster.name === source_hoster.label,
                    );

                    if (extensionIndex === -1) return;

                    const imported_stream_extension = await loadExtension(
                        `${extensions[extensionIndex].path}/${extensions[extensionIndex].main}`,
                    );
                    const StreamExtensionClass =
                        new imported_stream_extension.Extension(cache);

                    const source_episode =
                        await SourceExtensionClass.getEpisode(
                            source_hoster,
                            episodes[currentIndex],
                        );

                    if (!source_episode) return;

                    const stream =
                        await StreamExtensionClass.getMetadata(source_episode);

                    if (!stream) return;

                    console.log(stream);

                    sources.push({
                        type: "external",
                        from: extensions[extensionIndex].name,
                        icon: extensions[extensionIndex].icon,
                        file_name: stream.name,
                        file_url: stream.mp4,
                        file_size: stream.size,
                        file_quality: stream.quality,
                        headers: stream.headers || {},
                    });
                });
            });
    }

    async function createSourceFolder() {
        const storage_path = $settings.media_storage_path;

        if (!storage_path) return;

        const animeTitles = [
            await sanitizeTitle(anime.attributes.titles.en || ""),
            await sanitizeTitle(anime.attributes.titles.en_us || ""),
            await sanitizeTitle(anime.attributes.titles.en_jp || ""),
            await sanitizeTitle(anime.attributes.titles.en_cn || ""),
            await sanitizeTitle(anime.attributes.titles.ja_jp || ""),
            await sanitizeTitle(anime.attributes.titles.ch_cn || ""),
        ].filter((title) => title !== "");

        window.electronAPI?.createLocalMediaDir(
            `${storage_path}${animeTitles[0]}`,
        );

        toast.success("Source folder created");
    }

    function updatePlayerSourceLive(sourceIndex) {
        playerAnime.set(anime);
        playerEpisode.set({
            number: currentIndex + 1,
            title: getEpisodeTitle(currentEpisode) || "No Title",
        });
        playerSources.set(sources);
        playerSourceIndex.set(sourceIndex);
    }

    $effect(() => {
        if (currentIndex !== null && show) {
            (async () => {
                sources = [];
                await prepareLoad();
                await loadLocal();
                await loadExternal();

                // This is for navigating the episodes in the player

                const local = sources.findIndex(
                    (source) => source.type === "local",
                );

                if ($showPlayer && sources.length > 0 && local !== -1) {
                    // local is preferred
                    updatePlayerSourceLive(local);
                } else if ($showPlayer && sources.length > 0) {
                    // take whatever is left
                    updatePlayerSourceLive(0);
                }
            })();
        }
    });
</script>

<Modal bind:show>
    <div class="text-gray-700 dark:text-gray-100 mx-1 w-full aspect-video">
        <div
            class="flex justify-between dark:text-gray-300 px-4 md:px-4.5 pt-4.5 pb-0.5 md:pb-2.5"
        >
            <!-- <div class="relative z-5 text-lg font-medium self-center">
                Source
            </div> -->
            <button
                aria-label="Close settings modal"
                class="ml-auto self-center cursor-pointer"
                onclick={() => {
                    show = false;
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="lucide lucide-x size-5"
                >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                </svg>
            </button>
        </div>
        <div class="px-4 md:min-h-[42rem] max-h-[42rem]">
            <!-- <div class="flex gap-2">
                <EpisodeInput {anime} bind:currentIndex bind:currentEpisodeName
                ></EpisodeInput>
                <SourceMenu
                    bind:show={showSourceMenu}
                    onCreateSourceFolder={createSourceFolder}
                >
                    <div
                        class="flex items-center justify-center h-full w-8 rounded-full bg-gray-100/80 dark:bg-gray-950 cursor-pointer"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="lucide lucide-settings-icon lucide-settings size-4"
                        >
                            <path
                                d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"
                            />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    </div>
                </SourceMenu>
            </div> -->

            <div class="h-48 w-full flex">
                <div class="h-full w-full flex">
                    <div class="relative h-full aspect-video">
                        <div
                            class="absolute z-1 h-full w-full rounded-2xl overflow-hidden shrink-0"
                        >
                            <img
                                class="h-full w-full object-cover"
                                src={(currentEpisode?.attributes?.thumbnail &&
                                    currentEpisode?.attributes?.thumbnail
                                        .original) ||
                                    getSeriesBackdrop(anime) ||
                                    getSeriesPoster(anime)}
                                alt=""
                            />
                        </div>
                        <div class="absolute top-0 blur-xl h-full w-full">
                            <img
                                src={(currentEpisode?.attributes?.thumbnail &&
                                    currentEpisode?.attributes?.thumbnail
                                        .original) ||
                                    getSeriesBackdrop(anime) ||
                                    getSeriesPoster(anime)}
                                class="h-full w-full object-cover"
                                alt=""
                            />
                        </div>
                    </div>
                    <div
                        class="relative z-1 h-full w-full space-y-1 px-4 py-2 flex flex-col justify-center"
                    >
                        <div class="font-semibold!">
                            {(currentEpisode?.attributes?.titles &&
                                getEpisodeTitle(currentEpisode)) ||
                                `Episode ${currentEpisode?.attributes.number}`}
                        </div>
                        <div class="w-full text-sm text-gray-400">
                            {currentEpisode?.attributes?.description
                                ? currentEpisode.attributes.description
                                : "No Description"}
                        </div>
                        <div class="mt-2">
                            <SourceMenu
                                bind:show={showSourceMenu}
                                onCreateSourceFolder={createSourceFolder}
                            >
                                <div
                                    class="relative flex items-center justify-center size-8 rounded-full bg-black/30 cursor-pointer before:content-[''] before:absolute before:inset-1 before:rounded-full hover:before:bg-white/10"
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
                                </div>
                            </SourceMenu>
                        </div>
                    </div>
                </div>
                <div
                    class="relative right-0 h-full w-6 flex flex-col items-center justify-center"
                >
                    <button
                        class="flex items-center h-2.5 outline-hidden {currentIndex <
                        anime.attributes.episodeCount - 1
                            ? 'text-gray-700 hover:text-white cursor-pointer'
                            : 'text-gray-800'}"
                        aria-label="Increase"
                        onclick={() => {
                            if (
                                currentIndex <
                                anime.attributes.episodeCount - 1
                            ) {
                                currentIndex += 1;
                            }
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="currentColor"
                            class="size-5"
                            ><path
                                d="M328-400q-9 0-14.5-6t-5.5-14q0-2 6-14l145-145q5-5 10-7t11-2q6 0 11 2t10 7l145 145q3 3 4.5 6.5t1.5 7.5q0 8-5.5 14t-14.5 6H328Z"
                            /></svg
                        >
                    </button>
                    <div class="text-sm text-gray-700">
                        {currentIndex + 1}
                    </div>
                    <button
                        class="flex items-center h-2.5 outline-hidden {currentIndex >
                        0
                            ? 'text-gray-700 hover:text-white cursor-pointer'
                            : 'text-gray-800'}"
                        aria-label="Decrease"
                        onclick={() => {
                            if (currentIndex > 0) {
                                currentIndex -= 1;
                            }
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="currentColor"
                            class="size-5"
                            ><path
                                d="M459-381 314-526q-3-3-4.5-6.5T308-540q0-8 5.5-14t14.5-6h304q9 0 14.5 6t5.5 14q0 2-6 14L501-381q-5 5-10 7t-11 2q-6 0-11-2t-10-7Z"
                            /></svg
                        >
                    </button>
                </div>
            </div>

            <div class="mt-4 pt-4 border-t border-gray-950 space-y-1">
                {#each sources as source, index}
                    <Source
                        {source}
                        onclick={() => {
                            playerAnime.set(anime);
                            playerEpisode.set({
                                number: currentIndex + 1,
                                title:
                                    getEpisodeTitle(currentEpisode) ||
                                    "No Title",
                            });
                            playerSources.set(sources);
                            playerSourceIndex.set(index);
                            showPlayer.set(true);
                        }}
                    />
                {/each}
            </div>
        </div>
    </div></Modal
>
