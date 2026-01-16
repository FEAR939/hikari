<script lang="ts">
    import { onMount } from "svelte";
    import { fileSelectedPath, settings, showFile } from "$lib/stores";
    import FileModal from "$lib/components/modals/FileModal.svelte";

    type SortDirection = "none" | "asc" | "desc";
    type SortColumn = "title" | "episodes" | "size" | null;

    interface DirEntry {
        name: string;
        episodeCount: number;
        size: number;
    }

    interface SortState {
        column: SortColumn;
        direction: SortDirection;
    }

    let baseDir = $state<string[]>([]);
    let dirEntries = $state<DirEntry[]>([]);
    let sortState = $state<SortState>({
        column: null,
        direction: "none",
    });
    let episodeCount = $state<number>(0);
    let dirSize = $state<number>(0);

    let basePath = $state<string | null>(null);

    function formatBytes(bytes: number, decimals: number = 2): string {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (
            parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
        );
    }

    function handleSort(column: SortColumn) {
        if (sortState.column !== column) {
            sortState = { column, direction: "asc" };
        } else {
            const nextDirection: SortDirection =
                sortState.direction === "none"
                    ? "asc"
                    : sortState.direction === "asc"
                      ? "desc"
                      : "none";
            sortState = {
                column: nextDirection === "none" ? null : column,
                direction: nextDirection,
            };
        }
    }

    function sortEntries(entries: DirEntry[], state: SortState): DirEntry[] {
        if (state.direction === "none" || !state.column) return entries;
        return [...entries].sort((a, b) => {
            let comparison = 0;
            switch (state.column) {
                case "title":
                    const nameA = String(a.name || "");
                    const nameB = String(b.name || "");
                    comparison = nameA.localeCompare(nameB);
                    break;
                case "episodes":
                    comparison =
                        Number(a.episodeCount) - Number(b.episodeCount);
                    break;
                case "size":
                    comparison = Number(a.size) - Number(b.size);
                    break;
            }
            return state.direction === "asc" ? comparison : -comparison;
        });
    }

    const sortedEntries = $derived(sortEntries(dirEntries, sortState));

    onMount(async () => {
        basePath = $settings.media_storage_path;

        const baseDirResult =
            (await window.electronAPI?.getDir(basePath || "")) || [];
        baseDir = baseDirResult;

        const dirSizeResult =
            (await window.electronAPI?.getDirSize(basePath || "")) || 0;
        dirSize = dirSizeResult;

        const entries: DirEntry[] = await Promise.all(
            baseDirResult.map(async (dir: string): Promise<DirEntry> => {
                const path = `${basePath}${dir}`;
                const [files, sizeResult] = await Promise.all([
                    window.electronAPI?.getDir(path),
                    window.electronAPI?.getDirSize(path),
                ]);
                const epCount =
                    files?.filter(
                        (file: string) =>
                            file.endsWith(".mp4") || file.endsWith(".mkv"),
                    ).length || 0;
                let size: number;
                if (typeof sizeResult === "string") {
                    size = parseInt(sizeResult, 10) || 0;
                } else if (typeof sizeResult === "number") {
                    size = sizeResult;
                } else {
                    size = 0;
                }
                return {
                    name: dir,
                    episodeCount: epCount,
                    size,
                };
            }),
        );

        dirEntries = entries;

        const totalEpisodes = entries.reduce(
            (acc, entry) => acc + entry.episodeCount,
            0,
        );
        episodeCount = totalEpisodes;
    });
</script>

<FileModal bind:show={$showFile} />

<div class="h-full w-full space-y-4 overflow-y-scroll p-4 pt-16">
    <div
        class="flex h-48 w-full rounded-2xl border border-gray-900 bg-gray-950"
    >
        <div class="flex h-full w-full flex-col items-center justify-center">
            <div>{baseDir.length}</div>
            <div class="text-neutral-700">Anime</div>
        </div>
        <div class="flex h-full w-full flex-col items-center justify-center">
            <div>{episodeCount}</div>
            <div class="text-neutral-700">Episodes</div>
        </div>
        <div class="flex h-full w-full flex-col items-center justify-center">
            <div>{formatBytes(dirSize)}</div>
            <div class="text-neutral-700">Size</div>
        </div>
    </div>

    <div
        class="overflow-hidden rounded-2xl border border-gray-900 **:border-gray-900"
    >
        <table class="w-full text-sm">
            <thead class="border-b">
                <tr>
                    <th
                        class="h-10 cursor-pointer px-6 py-3 text-left align-middle text-neutral-500 select-none hover:bg-gray-950"
                        onclick={() => handleSort("title")}
                    >
                        <div class="flex items-center">
                            <span>Title</span>
                            <span class="ml-1 text-xs">
                                <div class="h-fit w-fit overflow-hidden">
                                    <div
                                        class="relative h-2.5 w-4 overflow-hidden text-neutral-500 hover:text-neutral-300"
                                    >
                                        {#if sortState.direction === "asc" || sortState.direction === "none" || sortState.column !== "title"}
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
                                                class="lucide lucide-chevron-up-icon lucide-chevron-up absolute top-0 size-3"
                                            >
                                                <path d="m18 15-6-6-6 6" />
                                            </svg>
                                        {/if}
                                    </div>
                                    <div
                                        class="relative h-2.5 w-4 overflow-hidden text-neutral-500 hover:text-neutral-300"
                                    >
                                        {#if sortState.direction === "desc" || sortState.direction === "none" || sortState.column !== "title"}
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
                                                class="lucide lucide-chevron-down-icon lucide-chevron-down absolute bottom-0 size-3"
                                            >
                                                <path d="m6 9 6 6 6-6" />
                                            </svg>
                                        {/if}
                                    </div>
                                </div>
                            </span>
                        </div>
                    </th>
                    <th
                        class="h-10 cursor-pointer px-6 py-3 text-left align-middle text-neutral-500 select-none hover:bg-[#1d1d1d]"
                        onclick={() => handleSort("episodes")}
                    >
                        <div class="flex items-center">
                            <span>Episodes</span>
                            <span class="ml-1 text-xs">
                                <div class="h-fit w-fit overflow-hidden">
                                    <div
                                        class="relative h-2.5 w-4 overflow-hidden text-neutral-500 hover:text-neutral-300"
                                    >
                                        {#if sortState.direction === "asc" || sortState.direction === "none" || sortState.column !== "episodes"}
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
                                                class="lucide lucide-chevron-up-icon lucide-chevron-up absolute top-0 size-3"
                                            >
                                                <path d="m18 15-6-6-6 6" />
                                            </svg>
                                        {/if}
                                    </div>
                                    <div
                                        class="relative h-2.5 w-4 overflow-hidden text-neutral-500 hover:text-neutral-300"
                                    >
                                        {#if sortState.direction === "desc" || sortState.direction === "none" || sortState.column !== "episodes"}
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
                                                class="lucide lucide-chevron-down-icon lucide-chevron-down absolute bottom-0 size-3"
                                            >
                                                <path d="m6 9 6 6 6-6" />
                                            </svg>
                                        {/if}
                                    </div>
                                </div>
                            </span>
                        </div>
                    </th>
                    <th
                        class="h-10 cursor-pointer px-6 py-3 text-left align-middle text-neutral-500 select-none hover:bg-[#1d1d1d]"
                        onclick={() => handleSort("size")}
                    >
                        <div class="flex items-center">
                            <span>Size</span>
                            <span class="ml-1 text-xs">
                                <div class="h-fit w-fit overflow-hidden">
                                    <div
                                        class="relative h-2.5 w-4 overflow-hidden text-neutral-500 hover:text-neutral-300"
                                    >
                                        {#if sortState.direction === "asc" || sortState.direction === "none" || sortState.column !== "size"}
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
                                                class="lucide lucide-chevron-up-icon lucide-chevron-up absolute top-0 size-3"
                                            >
                                                <path d="m18 15-6-6-6 6" />
                                            </svg>
                                        {/if}
                                    </div>
                                    <div
                                        class="relative h-2.5 w-4 overflow-hidden text-neutral-500 hover:text-neutral-300"
                                    >
                                        {#if sortState.direction === "desc" || sortState.direction === "none" || sortState.column !== "size"}
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
                                                class="lucide lucide-chevron-down-icon lucide-chevron-down absolute bottom-0 size-3"
                                            >
                                                <path d="m6 9 6 6 6-6" />
                                            </svg>
                                        {/if}
                                    </div>
                                </div>
                            </span>
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody class="[&_tr:last-child]:border-0">
                {#if sortedEntries.length > 0}
                    {#each sortedEntries as entry (entry.name)}
                        <tr
                            class="h-10 cursor-pointer border-b text-sm hover:bg-gray-950"
                            onclick={() => {
                                fileSelectedPath.set(
                                    `${basePath}${entry.name}`,
                                );
                                showFile.set(true);
                            }}
                            role="row"
                        >
                            <td class="px-6 py-3 align-middle" role="cell">
                                <div>{entry.name}</div>
                            </td>
                            <td class="px-6 py-3 align-middle" role="cell">
                                <div>{entry.episodeCount}</div>
                            </td>
                            <td class="px-6 py-3 align-middle" role="cell">
                                <div>{formatBytes(entry.size)}</div>
                            </td>
                        </tr>
                    {/each}
                {:else}
                    <tr>
                        <td colspan="3">
                            <div
                                class="flex w-full flex-col items-center justify-center space-y-1 py-8"
                            >
                                <div class="text-3xl">😕</div>
                                <div class="text-lg">No Anime found</div>
                                <div class="text-xs text-neutral-500">
                                    Try adding anime using the utility in the
                                    Sourcepanel, they will be listed here
                                    afterwards.
                                </div>
                            </div>
                        </td>
                    </tr>
                {/if}
            </tbody>
        </table>
    </div>
</div>
