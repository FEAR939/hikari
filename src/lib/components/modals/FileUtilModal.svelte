<script lang="ts">
    import { Select } from "bits-ui";
    import Modal from "../common/Modal.svelte";

    let { show = $bindable(false), fileUtilPath = $bindable("") } = $props();

    let fileMetadata = $state({});

    let selectedAudioCodec = $state("");

    // !IMPORTANT values here need to follow ffmpeg spec
    const audioCodecs = [
        {
            value: "aac",
            label: "AAC",
        },
    ];

    let targetFilepath = $state("");

    let progress = $state<null | number>(null);

    window.electronAPI.ontranscodeprogress((p) => {
        if (p.done) {
            progress = null;
        } else {
            progress = Math.floor(p.percent);
        }
    });

    async function load_file_metadata(filepath: string) {
        const metadata =
            await window.electronAPI.getLocalMediaMetadata(filepath);
        fileMetadata = metadata;
    }

    async function transcode_file() {
        if (!fileUtilPath || !targetFilepath || !selectedAudioCodec) {
            return;
        }
        const targetPath = targetFilepath;
        const audioCodec = selectedAudioCodec;
        await window.electronAPI.convertVideoCodec(
            fileUtilPath,
            audioCodec,
            targetPath,
        );
    }

    $effect(() => {
        if (fileUtilPath) {
            load_file_metadata(fileUtilPath);
            targetFilepath = fileUtilPath;
        }
    });
</script>

<Modal bind:show class="z-3333">
    <div class="text-gray-700 dark:text-gray-100 mx-1">
        <div
            class=" flex justify-between dark:text-gray-300 px-4 md:px-4.5 pt-4.5 pb-0.5 md:pb-2.5"
        >
            <div class=" text-lg font-medium self-center">File Utility</div>
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
                    class="lucide lucide-x size-4"
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
                <div class="space-y-1">
                    <div class="text-gray-400">Filepath</div>
                    <div
                        class="w-xl flex gap-1 px-3 py-2 bg-gray-950 rounded-lg"
                    >
                        <div class="w-auto overflow-x-scroll text-nowrap">
                            {fileUtilPath}
                        </div>
                        <button
                            class="size-5 flex items-center justify-center cursor-pointer hover:text-gray-500 focus:text-gray-500 transition-colors duration-100"
                            onclick={() =>
                                window.electronAPI.clipboardWriteText(
                                    fileUtilPath,
                                )}
                            aria-label="Copy to clipboard"
                            ><svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="24px"
                                viewBox="0 -960 960 960"
                                width="24px"
                                fill="currentColor"
                                class="size-4"
                                ><path
                                    d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360ZM200-80q-33 0-56.5-23.5T120-160v-520q0-17 11.5-28.5T160-720q17 0 28.5 11.5T200-680v520h400q17 0 28.5 11.5T640-120q0 17-11.5 28.5T600-80H200Z"
                                /></svg
                            ></button
                        >
                    </div>
                </div>

                <div
                    class="w-full h-fit p-4 border border-white/10 rounded-xl space-y-4"
                >
                    <div class="text-xl font-bold!">Transcoding</div>

                    <div class="space-y-1">
                        <div class="text-sm font-bold!">Audio</div>
                        <div
                            class="w-xl p-4 bg-gray-950 rounded-lg flex items-center justify-evenly"
                        >
                            <div>
                                {fileMetadata.audio_codec?.toUpperCase() ||
                                    "N/A"}
                            </div>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="24px"
                                viewBox="0 -960 960 960"
                                width="24px"
                                fill="currentColor"
                                class="size-5 text-gray-600"
                                ><path
                                    d="M646-440H200q-17 0-28.5-11.5T160-480q0-17 11.5-28.5T200-520h446L532-634q-12-12-11.5-28t11.5-28q12-12 28.5-12.5T589-691l183 183q6 6 8.5 13t2.5 15q0 8-2.5 15t-8.5 13L589-269q-12 12-28.5 11.5T532-270q-11-12-11.5-28t11.5-28l114-114Z"
                                /></svg
                            >
                            <Select.Root
                                type="single"
                                onValueChange={(value) =>
                                    (selectedAudioCodec = value)}
                                items={audioCodecs}
                            >
                                <Select.Trigger class="flex items-center gap-2">
                                    <div>
                                        {audioCodecs.find(
                                            (codec) =>
                                                codec.value ===
                                                selectedAudioCodec,
                                        )?.label || "Select codec"}
                                    </div>
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
                                </Select.Trigger>
                                <Select.Portal>
                                    <Select.Content class="z-3334">
                                        <div
                                            class="w-32 p-2 border border-white/10 rounded-lg text-sm translate-y-2 bg-black/70 backdrop-blur-lg text-white"
                                        >
                                            {#each audioCodecs as codec}
                                                <Select.Item
                                                    value={codec.value}
                                                    label={codec.label}
                                                >
                                                    <div>{codec.label}</div>
                                                </Select.Item>
                                            {/each}
                                        </div>
                                    </Select.Content>
                                </Select.Portal>
                            </Select.Root>
                        </div>
                    </div>

                    <div class="space-y-1">
                        <div class="text-sm font-bold!">Video</div>
                        <div
                            class="w-xl p-4 bg-gray-950 rounded-lg flex items-center justify-evenly"
                        >
                            <div>
                                {fileMetadata.video_codec?.toUpperCase() ||
                                    "N/A"}
                            </div>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="24px"
                                viewBox="0 -960 960 960"
                                width="24px"
                                fill="currentColor"
                                class="size-5 text-gray-600"
                                ><path
                                    d="M646-440H200q-17 0-28.5-11.5T160-480q0-17 11.5-28.5T200-520h446L532-634q-12-12-11.5-28t11.5-28q12-12 28.5-12.5T589-691l183 183q6 6 8.5 13t2.5 15q0 8-2.5 15t-8.5 13L589-269q-12 12-28.5 11.5T532-270q-11-12-11.5-28t11.5-28l114-114Z"
                                /></svg
                            >
                            <div>Not yet Supported</div>
                        </div>
                    </div>

                    <div>
                        <div class="text-sm font-bold!">Target filepath</div>
                        <input
                            type="text"
                            placeholder="Enter target filepath"
                            bind:value={targetFilepath}
                            class="outline-hidden w-xl px-3 py-2 bg-gray-950 rounded-lg"
                        />
                    </div>

                    {#if progress}
                        <div class="w-xl space-y-2">
                            <div class="flex justify-between">
                                <div class="text-sm font-bold!">Progress</div>
                                <div class="text-sm font-bold!">
                                    {progress || 0}%
                                </div>
                            </div>
                            <div class="h-1 w-full bg-gray-950 rounded-full">
                                <div
                                    class="h-full bg-white rounded-full transition duration-100"
                                    style:width={`${progress || 0}%`}
                                ></div>
                            </div>
                        </div>
                    {:else}
                        <button
                            class="outline-hidden px-3 py-2 w-fit border border-white/10 rounded-lg cursor-pointer"
                            onclick={() => {
                                transcode_file();
                            }}>Transcode</button
                        >
                    {/if}
                </div>
            </div>
        </div>
    </div></Modal
>
