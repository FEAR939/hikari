<script lang="ts">
    import Modal from "$lib/components/common/Modal.svelte";
    import { fileSelectedPath } from "$lib/stores";

    let { show = $bindable(false) } = $props();

    let episodes = $state([]);

    $effect(() => {
        if ($fileSelectedPath && show) {
            (async () => {
                const files =
                    await window.electronAPI?.getDir($fileSelectedPath);

                files.filter(
                    (file) => file.endsWith(".mp4") || file.endsWith(".mkv"),
                );

                episodes = files || [];
            })();
        }
    });

    function reverseMap(title: string) {
        const match = title.toLowerCase().match(/e(\d+)/);
        const matchAlt = title.toLowerCase().match(/ep(\d+)/);

        if (match && parseInt(match[1])) return parseInt(match[1]);
        if (matchAlt && parseInt(matchAlt[1])) return parseInt(matchAlt[1]);
        return false;
    }
</script>

<Modal bind:show>
    <div class="text-gray-700 dark:text-gray-100 mx-1">
        <div
            class="flex justify-between dark:text-gray-300 px-4 md:px-4.5 pt-4.5 pb-0.5 md:pb-2.5"
        >
            <div class=" text-lg font-medium self-center">
                {$fileSelectedPath}
            </div>
            <button
                aria-label="Close settings modal"
                class="self-center cursor-pointer"
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
        <div
            class="flex-1 px-3.5 md:pl-0 md:pr-4.5 md:min-h-[42rem] max-h-[42rem] overflow-y-scroll"
        >
            <div class="pl-4.5 h-fit w-full space-y-2">
                <div>Episodes</div>
                <div class="flex gap-1 h-8 w-full">
                    <button
                        class="h-full px-4 flex gap-1 items-center bg-gray-950 rounded-full hover:bg-gray-900 outline-hidden cursor-pointer"
                        onclick={() =>
                            window.electronAPI?.openFolder($fileSelectedPath!)}
                    >
                        <svg
                            width="100%"
                            height="100%"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            class="size-4"
                        >
                            <path
                                d="M13 7L11.8845 4.76892C11.5634 4.1268 11.4029 3.80573 11.1634 3.57116C10.9516 3.36373 10.6963 3.20597 10.4161 3.10931C10.0992 3 9.74021 3 9.02229 3H5.2C4.0799 3 3.51984 3 3.09202 3.21799C2.71569 3.40973 2.40973 3.71569 2.21799 4.09202C2 4.51984 2 5.0799 2 6.2V7M2 7H17.2C18.8802 7 19.7202 7 20.362 7.32698C20.9265 7.6146 21.3854 8.07354 21.673 8.63803C22 9.27976 22 10.1198 22 11.8V16.2C22 17.8802 22 18.7202 21.673 19.362C21.3854 19.9265 20.9265 20.3854 20.362 20.673C19.7202 21 18.8802 21 17.2 21H6.8C5.11984 21 4.27976 21 3.63803 20.673C3.07354 20.3854 2.6146 19.9265 2.32698 19.362C2 18.7202 2 17.8802 2 16.2V7Z"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                        <span class="text-sm">Open Folder</span>
                    </button>
                </div>
                <div
                    class="border border-gray-900 rounded-2xl [&>*:last-of-type]:rounded-b-2xl"
                >
                    <div
                        class="px-6 py-3 grid grid-cols-2 text-sm text-neutral-500 border-b border-gray-900"
                    >
                        <div>Filename</div>
                        <div>Mapped</div>
                    </div>
                    {#if episodes.length > 0}
                        {#each episodes as dir}
                            {@const mapped = reverseMap(dir)}
                            <div
                                class="text-sm px-6 py-3 grid grid-cols-2 hover:bg-gray-950 border-b border-gray-900"
                            >
                                <div class="truncate">{dir}</div>
                                {#if mapped}
                                    <div class="truncate">
                                        Episode {mapped}
                                    </div>
                                {:else}
                                    <div
                                        class="truncate flex gap-1 text-yellow-400"
                                    >
                                        <svg
                                            width="100%"
                                            height="100%"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            class="size-4"
                                        >
                                            <path
                                                d="M11.9998 8.99999V13M11.9998 17H12.0098M10.6151 3.89171L2.39019 18.0983C1.93398 18.8863 1.70588 19.2803 1.73959 19.6037C1.769 19.8857 1.91677 20.142 2.14613 20.3088C2.40908 20.5 2.86435 20.5 3.77487 20.5H20.2246C21.1352 20.5 21.5904 20.5 21.8534 20.3088C22.0827 20.142 22.2305 19.8857 22.2599 19.6037C22.2936 19.2803 22.0655 18.8863 21.6093 18.0983L13.3844 3.89171C12.9299 3.10654 12.7026 2.71396 12.4061 2.58211C12.1474 2.4671 11.8521 2.4671 11.5935 2.58211C11.2969 2.71396 11.0696 3.10655 10.6151 3.89171Z"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                            />
                                        </svg>
                                        <span>Failed to Map</span>
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    {:else}
                        <div
                            class="w-full py-8 flex flex-col items-center justify-center space-y-1"
                        >
                            <div class="text-3xl">😕</div>
                            <div class="text-lg">No Episodes found</div>
                            <div class="text-neutral-500 text-xs">
                                Try adding episodes, they will be listed here
                                afterwards.
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</Modal>
