<script lang="ts">
    import { Select } from "bits-ui";
    import Modal from "../common/Modal.svelte";
    let { show = $bindable(false), files = $bindable([]) } = $props();

    let editModes = [{ name: "transcoding", label: "Transcoding" }];
    let currentEditMode = $state(editModes[0]);
    let currentFileIndex = $state(0);
    let fileMetadata = $state({});
    let selectedAudioCodec = $state<null | string>(null);
    let selectedFiles = $state<Set<number>>(new Set());

    const audioCodecs = [{ value: "aac", label: "AAC" }];

    let outputstrat = $state<null | string>(null);
    let outputStrategies = $state([]);
    let targetFilepath = $state("");
    let replaceFrom = $state("");
    let replaceTo = $state("");
    let progress = $state<null | number>(null);
    let currentProcessingIndex = $state<number>(-1);

    window.electronAPI.ontranscodeprogress((p) => {
        if (p.done) {
            progress = null;
        } else {
            progress = Math.floor(p.percent);
        }
    });

    let commonPrefix = $derived.by(() => {
        if (files.length === 0) return "";
        if (files.length === 1) {
            const lastSlash = files[0].lastIndexOf("/");
            return lastSlash >= 0 ? files[0].substring(0, lastSlash + 1) : "";
        }
        let prefix = files[0];
        for (let i = 1; i < files.length; i++) {
            while (!files[i].startsWith(prefix)) {
                prefix = prefix.substring(0, prefix.length - 1);
            }
        }
        const lastSlash = prefix.lastIndexOf("/");
        return lastSlash >= 0 ? prefix.substring(0, lastSlash + 1) : prefix;
    });

    function getShortName(filepath: string): string {
        return filepath.substring(commonPrefix.length);
    }

    function getExtension(filepath: string): string {
        const dot = filepath.lastIndexOf(".");
        return dot >= 0 ? filepath.substring(dot + 1).toUpperCase() : "";
    }

    function getOutputPreview(filepath: string): string {
        if (!outputstrat) return filepath;
        if (outputstrat === "static") return targetFilepath;
        if (outputstrat === "replace" && replaceFrom) {
            return filepath.replaceAll(replaceFrom, replaceTo);
        }
        return filepath;
    }

    let selectedFilesList = $derived(
        files.filter((_, i) => selectedFiles.has(i)),
    );

    let allSelected = $derived(
        files.length > 0 && selectedFiles.size === files.length,
    );

    function toggleSelectAll() {
        if (allSelected) {
            selectedFiles = new Set();
        } else {
            selectedFiles = new Set(files.map((_, i) => i));
        }
    }

    function toggleFile(index: number) {
        const next = new Set(selectedFiles);
        if (next.has(index)) {
            next.delete(index);
        } else {
            next.add(index);
        }
        selectedFiles = next;
    }

    async function load_file_metadata(filepath: string) {
        const metadata =
            await window.electronAPI.getLocalMediaMetadata(filepath);
        fileMetadata = metadata;
    }

    async function transcode_file() {
        const filesToProcess = selectedFilesList;
        if (
            filesToProcess.length === 0 ||
            !selectedAudioCodec ||
            outputstrat === null ||
            (outputstrat === "static" && targetFilepath === "") ||
            (outputstrat === "replace" &&
                replaceFrom === "" &&
                replaceTo === "")
        ) {
            return;
        }

        for (let i = 0; i < filesToProcess.length; i++) {
            currentProcessingIndex = i;
            const file = filesToProcess[i];
            let savePath = "";

            switch (outputstrat) {
                case "static":
                    savePath = targetFilepath;
                    break;
                case "replace":
                    savePath = file.replaceAll(replaceFrom, replaceTo);
                    break;
            }

            await window.electronAPI.convertVideoCodec(
                file,
                selectedAudioCodec,
                savePath,
            );
        }
        currentProcessingIndex = -1;
    }

    $effect(() => {
        if (files[currentFileIndex] && show) {
            load_file_metadata(files[currentFileIndex]);
            targetFilepath = files[currentFileIndex];
            selectedAudioCodec = null;
            replaceFrom = "";
            replaceTo = "";
            outputstrat = null;
        }
    });

    $effect(() => {
        if (!show) {
            outputStrategies = [];
            selectedFiles = new Set();
            return;
        }
        if (files.length > 1) {
            outputStrategies = [{ value: "replace", label: "Replace" }];
        } else if (files.length === 1) {
            outputStrategies = [
                { value: "static", label: "Static" },
                { value: "replace", label: "Replace" },
            ];
        }
        if (selectedFiles.size === 0 && files.length > 0) {
            selectedFiles = new Set(files.map((_, i) => i));
        }
    });
</script>

<Modal bind:show class="z-1000">
    <div class="text-gray-700 dark:text-gray-100 mx-1">
        <!-- Header (same as original) -->
        <div
            class="flex justify-between dark:text-gray-300 px-4 md:px-4.5 pt-4.5 pb-0.5 md:pb-2.5"
        >
            <div class="text-lg font-medium self-center">File Utility</div>
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

        <!-- Main content (same dimensions as original) -->
        <div
            class="flex-1 px-3.5 md:pl-0 md:pr-4.5 md:min-h-[42rem] h-[42rem] max-h-[42rem] overflow-hidden"
        >
            <div class="pl-4.5 h-full w-full flex flex-col gap-2">
                <!-- Top row: Files | Mode | Preview -->
                <div class="flex gap-2 flex-1 min-h-0">
                    <!-- LEFT: File List -->
                    <div
                        class="w-1/4 flex flex-col border border-white/10 rounded-lg overflow-hidden"
                    >
                        <div
                            class="flex items-center justify-between px-3 py-2 border-b border-white/10"
                        >
                            <span
                                class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                            >
                                Files ({selectedFiles.size}/{files.length})
                            </span>
                            <button
                                class="text-xs px-1.5 py-0.5 rounded hover:bg-white/10 transition text-gray-400 hover:text-gray-200 cursor-pointer"
                                onclick={toggleSelectAll}
                            >
                                {allSelected ? "None" : "All"}
                            </button>
                        </div>
                        {#if commonPrefix}
                            <div
                                class="w-full flex items-center gap-2 px-3 py-1.5 text-gray-500 font-mono truncate border-b border-white/5"
                                title={commonPrefix}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="24px"
                                    viewBox="0 -960 960 960"
                                    width="24px"
                                    fill="currentColor"
                                    class="size-3.5"
                                    ><path
                                        d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h207q16 0 30.5 6t25.5 17l57 57h320q33 0 56.5 23.5T880-640v400q0 33-23.5 56.5T800-160H160Z"
                                    /></svg
                                >
                                <span class="w-full text-xs truncate"
                                    >{commonPrefix}</span
                                >
                            </div>
                        {/if}
                        <div class="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                            {#each files as file, index}
                                <button
                                    class="w-full flex items-start gap-2 px-2 py-1.5 rounded-md text-left transition cursor-pointer
                                        {currentFileIndex === index
                                        ? 'bg-white/5 ring-1 ring-white/10'
                                        : 'hover:bg-white/5'}
                                        {selectedFiles.has(index)
                                        ? ''
                                        : 'opacity-50'}"
                                    onclick={() => {
                                        currentFileIndex = index;
                                        load_file_metadata(file);
                                    }}
                                >
                                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                                    <div
                                        class="mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center transition
                                            {selectedFiles.has(index)
                                            ? 'bg-gray-200 border-white'
                                            : 'border-white/30 bg-transparent'}"
                                        role="checkbox"
                                        aria-checked={selectedFiles.has(index)}
                                        tabindex="0"
                                        onclick={(e) => {
                                            e.stopPropagation();
                                            toggleFile(index);
                                        }}
                                        onkeydown={(e) => {
                                            if (
                                                e.key === " " ||
                                                e.key === "Enter"
                                            ) {
                                                e.stopPropagation();
                                                toggleFile(index);
                                            }
                                        }}
                                    >
                                        {#if selectedFiles.has(index)}
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="12"
                                                height="12"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="black"
                                                stroke-width="3"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                            >
                                                <polyline
                                                    points="20 6 9 17 4 12"
                                                />
                                            </svg>
                                        {/if}
                                    </div>
                                    <div class="min-w-0 flex-1">
                                        <div
                                            class="text-sm truncate"
                                            title={getShortName(file)}
                                        >
                                            {getShortName(file)}
                                        </div>
                                        <div
                                            class="text-[10px] text-gray-500 mt-0.5"
                                        >
                                            {getExtension(file)}
                                        </div>
                                    </div>
                                </button>
                            {/each}
                        </div>
                    </div>

                    <!-- CENTER: Mode Panel -->
                    <div
                        class="w-1/2 flex flex-col border border-white/10 rounded-lg overflow-hidden min-w-0"
                    >
                        <div
                            class="flex items-center gap-1 px-3 py-2 border-b border-white/10"
                        >
                            {#each editModes as mode}
                                <button
                                    class="px-3 py-1 text-sm rounded-md transition cursor-pointer
                                        {currentEditMode.name === mode.name
                                        ? 'bg-white/10 text-white font-medium'
                                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}"
                                    onclick={() => (currentEditMode = mode)}
                                >
                                    {mode.label}
                                </button>
                            {/each}
                        </div>

                        <div class="flex-1 overflow-y-auto p-4 space-y-4">
                            {#if currentEditMode.name === "transcoding"}
                                <div class="space-y-2">
                                    <div
                                        class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                                    >
                                        Audio
                                    </div>
                                    <div
                                        class="flex items-center gap-3 p-3.5 bg-gray-950 rounded-lg"
                                    >
                                        <div
                                            class="px-2.5 py-1 bg-white/5 rounded text-sm font-mono"
                                        >
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
                                        >
                                            <path
                                                d="M646-440H200q-17 0-28.5-11.5T160-480q0-17 11.5-28.5T200-520h446L532-634q-12-12-11.5-28t11.5-28q12-12 28.5-12.5T589-691l183 183q6 6 8.5 13t2.5 15q0 8-2.5 15t-8.5 13L589-269q-12 12-28.5 11.5T532-270q-11-12-11.5-28t11.5-28l114-114Z"
                                            />
                                        </svg>
                                        <Select.Root
                                            type="single"
                                            onValueChange={(value) =>
                                                (selectedAudioCodec = value)}
                                            items={audioCodecs}
                                        >
                                            <Select.Trigger
                                                class="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded transition cursor-pointer"
                                            >
                                                <span class="text-sm">
                                                    {audioCodecs.find(
                                                        (c) =>
                                                            c.value ===
                                                            selectedAudioCodec,
                                                    )?.label || "Select codec"}
                                                </span>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    height="24px"
                                                    viewBox="0 -960 960 960"
                                                    width="24px"
                                                    fill="currentColor"
                                                    class="size-5"
                                                >
                                                    <path
                                                        d="M459-381 314-526q-3-3-4.5-6.5T308-540q0-8 5.5-14t14.5-6h304q9 0 14.5 6t5.5 14q0 2-6 14L501-381q-5 5-10 7t-11 2q-6 0-11-2t-10-7Z"
                                                    />
                                                </svg>
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
                                                                <div
                                                                    class="px-2 py-1 rounded hover:bg-white/10 cursor-pointer"
                                                                >
                                                                    {codec.label}
                                                                </div>
                                                            </Select.Item>
                                                        {/each}
                                                    </div>
                                                </Select.Content>
                                            </Select.Portal>
                                        </Select.Root>
                                    </div>
                                </div>

                                <div class="space-y-2">
                                    <div
                                        class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                                    >
                                        Video
                                    </div>
                                    <div
                                        class="flex items-center gap-3 p-3.5 bg-gray-950 rounded-lg"
                                    >
                                        <div
                                            class="px-2.5 py-1 bg-white/5 rounded text-sm font-mono"
                                        >
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
                                        >
                                            <path
                                                d="M646-440H200q-17 0-28.5-11.5T160-480q0-17 11.5-28.5T200-520h446L532-634q-12-12-11.5-28t11.5-28q12-12 28.5-12.5T589-691l183 183q6 6 8.5 13t2.5 15q0 8-2.5 15t-8.5 13L589-269q-12 12-28.5 11.5T532-270q-11-12-11.5-28t11.5-28l114-114Z"
                                            />
                                        </svg>
                                        <div
                                            class="text-sm text-gray-500 italic"
                                        >
                                            Not yet Supported
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>

                    <!-- RIGHT: Output Preview -->
                    <div
                        class="w-1/4 flex flex-col border border-white/10 rounded-lg overflow-hidden"
                    >
                        <div class="px-3 py-2 border-b border-white/10">
                            <span
                                class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                                >Preview</span
                            >
                        </div>
                        <div class="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                            {#if outputstrat && selectedFilesList.length > 0}
                                {#each selectedFilesList as file}
                                    <div
                                        class="px-2.5 py-2 rounded-md bg-white/[0.03]"
                                    >
                                        <div
                                            class="text-[10px] text-gray-500 truncate mb-0.5 line-through"
                                            title={file}
                                        >
                                            {getShortName(file)}
                                        </div>
                                        <div class="flex items-center gap-1">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="10"
                                                height="10"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="2"
                                                class="text-green-500 shrink-0"
                                            >
                                                <path d="m9 18 6-6-6-6" />
                                            </svg>
                                            <div
                                                class="text-xs text-green-400/80 truncate font-mono"
                                                title={getOutputPreview(file)}
                                            >
                                                {getShortName(
                                                    getOutputPreview(file),
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                {/each}
                            {:else}
                                <div
                                    class="flex items-center justify-center h-full text-sm text-gray-500"
                                >
                                    <div class="text-center space-y-1 px-4">
                                        <div class="text-gray-600 text-xs">
                                            Select an output strategy to see
                                            preview
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>

                <!-- BOTTOM: Output Strategy + Actions -->
                <div
                    class="shrink-0 border border-white/10 rounded-lg p-3 space-y-3"
                >
                    <div class="flex items-center gap-3">
                        <span
                            class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                            >Output</span
                        >
                        <Select.Root
                            type="single"
                            onValueChange={(value) => (outputstrat = value)}
                        >
                            <Select.Trigger
                                class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-950 hover:bg-white/10 rounded-lg transition cursor-pointer text-sm"
                            >
                                <span>
                                    {#if outputstrat}
                                        {outputStrategies.find(
                                            (s) => s.value === outputstrat,
                                        )?.label}
                                    {:else}
                                        Select Strategy
                                    {/if}
                                </span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="24px"
                                    viewBox="0 -960 960 960"
                                    width="24px"
                                    fill="currentColor"
                                    class="size-5"
                                >
                                    <path
                                        d="M459-381 314-526q-3-3-4.5-6.5T308-540q0-8 5.5-14t14.5-6h304q9 0 14.5 6t5.5 14q0 2-6 14L501-381q-5 5-10 7t-11 2q-6 0-11-2t-10-7Z"
                                    />
                                </svg>
                            </Select.Trigger>
                            <Select.Portal>
                                <Select.Content class="z-3334">
                                    <div
                                        class="w-32 p-2 border border-white/10 rounded-lg text-sm translate-y-2 bg-black/70 backdrop-blur-lg text-white"
                                    >
                                        {#each outputStrategies as strategy}
                                            <Select.Item
                                                value={strategy.value}
                                                label={strategy.label}
                                            >
                                                <div
                                                    class="px-2 py-1 rounded hover:bg-white/10 cursor-pointer"
                                                >
                                                    {strategy.label}
                                                </div>
                                            </Select.Item>
                                        {/each}
                                    </div>
                                </Select.Content>
                            </Select.Portal>
                        </Select.Root>
                    </div>

                    {#if outputstrat === "static"}
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-400 shrink-0"
                                >Path:</span
                            >
                            <input
                                type="text"
                                placeholder="Enter target filepath"
                                bind:value={targetFilepath}
                                class="flex-1 outline-none px-3 py-1.5 bg-gray-950 rounded-lg text-sm"
                            />
                        </div>
                    {:else if outputstrat === "replace"}
                        <div class="flex items-center gap-3">
                            <input
                                type="text"
                                placeholder="From"
                                bind:value={replaceFrom}
                                class="w-48 outline-none px-3 py-1.5 bg-gray-950 rounded-lg text-sm"
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="24px"
                                viewBox="0 -960 960 960"
                                width="24px"
                                fill="currentColor"
                                class="size-5 text-gray-600 shrink-0"
                            >
                                <path
                                    d="M367-320H120q-17 0-28.5-11.5T80-360q0-17 11.5-28.5T120-400h247l-75-75q-11-11-11-27.5t11-28.5q12-12 28.5-12t28.5 12l143 143q6 6 8.5 13t2.5 15q0 8-2.5 15t-8.5 13L348-188q-12 12-28 11.5T292-189q-11-12-11.5-28t11.5-28l75-75Zm226-240 75 75q11 11 11 27.5T668-429q-12 12-28.5 12T611-429L468-572q-6-6-8.5-13t-2.5-15q0-8 2.5-15t8.5-13l144-144q12-12 28-11.5t28 12.5q11 12 11.5 28T668-715l-75 75h247q17 0 28.5 11.5T880-600q0 17-11.5 28.5T840-560H593Z"
                                />
                            </svg>
                            <input
                                type="text"
                                placeholder="To"
                                bind:value={replaceTo}
                                class="w-48 outline-none px-3 py-1.5 bg-gray-950 rounded-lg text-sm"
                            />
                        </div>
                    {/if}

                    <!-- Action row -->
                    <div class="flex items-center justify-between pt-1">
                        {#if progress !== null}
                            <div class="flex-1 space-y-1">
                                <div class="flex justify-between text-xs">
                                    <span class="text-gray-400">
                                        File {currentProcessingIndex +
                                            1}/{selectedFilesList.length}
                                    </span>
                                    <span class="font-medium">{progress}%</span>
                                </div>
                                <div
                                    class="h-1 w-full bg-gray-950 rounded-full overflow-hidden"
                                >
                                    <div
                                        class="h-full bg-white rounded-full transition duration-100"
                                        style:width={`${progress}%`}
                                    ></div>
                                </div>
                            </div>
                        {:else}
                            <div class="text-xs text-gray-500">
                                {#if selectedFilesList.length === 0}
                                    No files selected
                                {:else if !outputstrat}
                                    Select an output strategy
                                {:else if !selectedAudioCodec}
                                    Select a codec
                                {:else}
                                    Ready to transcode
                                {/if}
                            </div>
                            <button
                                class="outline-none px-3 py-2 w-fit border border-white/10 rounded-lg cursor-pointer hover:bg-white/5 transition text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                disabled={selectedFilesList.length === 0 ||
                                    !selectedAudioCodec ||
                                    !outputstrat}
                                onclick={transcode_file}
                            >
                                Transcode ({selectedFilesList.length})
                            </button>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </div>
</Modal>
