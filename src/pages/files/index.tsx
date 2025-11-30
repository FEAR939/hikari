import { h } from "../../lib/jsx/runtime";
import { createSignal, bind } from "../../lib/jsx/reactive";
import { router } from "../../lib/router";
import FilePanel from "@ui/filePanel";

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

export default async function Files(query) {
  const basePath = localStorage.getItem("app_local_media_path");
  const [baseDir, setBaseDir, subscribeBaseDir] = createSignal<string[]>([]);
  const [dirEntries, setDirEntries, subscribeDirEntries] = createSignal<
    DirEntry[]
  >([]);
  const [sortState, setSortState, subscribeSortState] = createSignal<SortState>(
    {
      column: null,
      direction: "none",
    },
  );
  const [episodeCount, setEpisodeCount, subscribeEpisodeCount] =
    createSignal<number>(0);
  const [dirSize, setDirSize, subscribeDirSize] = createSignal<number>(0);

  const getSortIndicator = (column: SortColumn, state: SortState) => {
    // if (column !== state.column) return "↕";
    // if (state.direction === "none") return "↕";
    // return state.direction === "asc" ? "↑" : "↓";

    return (
      <div class="h-fit w-fit overflow-hidden">
        <div class="relative h-2.5 w-4 text-neutral-500 hover:text-neutral-300 overflow-hidden">
          {(state.direction === "asc" ||
            state.direction === "none" ||
            state.column !== column) && (
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
              class="lucide lucide-chevron-up-icon lucide-chevron-up size-3 absolute top-0"
            >
              <path d="m18 15-6-6-6 6" />
            </svg>
          )}
        </div>
        <div class="relative h-2.5 w-4 text-neutral-500 hover:text-neutral-300 overflow-hidden">
          {(state.direction === "desc" ||
            state.direction === "none" ||
            state.column !== column) && (
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
              class="lucide lucide-chevron-down-icon lucide-chevron-down size-3 absolute bottom-0"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          )}
        </div>
      </div>
    );
  };

  const handleSort = (column: SortColumn) => {
    const current = sortState();

    if (current.column !== column) {
      setSortState({ column, direction: "asc" });
    } else {
      const nextDirection: SortDirection =
        current.direction === "none"
          ? "asc"
          : current.direction === "asc"
            ? "desc"
            : "none";

      setSortState({
        column: nextDirection === "none" ? null : column,
        direction: nextDirection,
      });
    }
  };

  const sortEntries = (entries: DirEntry[], state: SortState): DirEntry[] => {
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
          comparison = Number(a.episodeCount) - Number(b.episodeCount);
          break;
        case "size":
          comparison = Number(a.size) - Number(b.size);
          break;
      }
      return state.direction === "asc" ? comparison : -comparison;
    });
  };

  const page = (
    <div class="h-full w-full p-4 pt-12 space-y-4 overflow-y-scroll">
      <div class="h-48 w-full flex bg-[#1d1d1d] rounded-2xl border border-[#222222]">
        <div class="h-full w-full flex flex-col items-center justify-center">
          {bind([baseDir, setBaseDir, subscribeBaseDir], (value) => (
            <div>{value.length}</div>
          ))}
          <div class="text-neutral-700">Anime</div>
        </div>
        <div class="h-full w-full flex flex-col items-center justify-center">
          {bind(
            [episodeCount, setEpisodeCount, subscribeEpisodeCount],
            (value) => (
              <div>{value}</div>
            ),
          )}
          <div class="text-neutral-700">Episodes</div>
        </div>
        <div class="h-full w-full flex flex-col items-center justify-center">
          {bind([dirSize, setDirSize, subscribeDirSize], (value) => (
            <div>{formatBytes(value)}</div>
          ))}
          <div class="text-neutral-700">Size</div>
        </div>
      </div>
      {bind([dirEntries, setDirEntries, subscribeDirEntries], (entries) =>
        bind([sortState, setSortState, subscribeSortState], (state) => {
          const sortedEntries = sortEntries(entries, state);
          return (
            <div class="rounded-md border [&_*]:border-[#222222] border-[#222222] overflow-hidden">
              <table class="w-full text-sm">
                <thead class="border-b">
                  <th
                    class="h-10 px-2 text-left align-middle text-neutral-500 cursor-pointer hover:bg-[#1d1d1d] select-none"
                    onClick={() => handleSort("title")}
                  >
                    <div class="flex items-center">
                      <span>Title</span>
                      <span class="ml-1 text-xs">
                        {getSortIndicator("title", state)}
                      </span>
                    </div>
                  </th>
                  <th
                    class="h-10 px-2 text-left align-middle text-neutral-500 cursor-pointer hover:bg-[#1d1d1d] select-none"
                    onClick={() => handleSort("episodes")}
                  >
                    <div class="flex items-center">
                      <span>Episodes</span>
                      <span class="ml-1 text-xs">
                        {getSortIndicator("episodes", state)}
                      </span>
                    </div>
                  </th>
                  <th
                    class="h-10 px-2 text-left align-middle text-neutral-500 cursor-pointer hover:bg-[#1d1d1d] select-none"
                    onClick={() => handleSort("size")}
                  >
                    <div class="flex items-center">
                      <span>Size</span>
                      <span class="ml-1 text-xs">
                        {getSortIndicator("size", state)}
                      </span>
                    </div>
                  </th>
                </thead>
                <tbody class="[&_tr:last-child]:border-0">
                  {sortedEntries.length > 0 ? (
                    sortedEntries.map((entry) => (
                      <tr
                        class="text-sm h-10 border-b hover:bg-[#1d1d1d] cursor-pointer"
                        onClick={async () => {
                          const filePanel = await FilePanel(
                            `${basePath}${entry.name}`,
                          );
                          page.appendChild(filePanel);
                          filePanel.offsetWidth;
                          filePanel.classList.remove("opacity-0");
                          filePanel.getPanel().offsetWidth;
                          filePanel.getPanel().classList.remove("scale-75");
                        }}
                        role="row"
                      >
                        <td class="p-2 align-middle" role="cell">
                          <div>{entry.name}</div>
                        </td>
                        <td class="p-2 align-middle" role="cell">
                          <div>{entry.episodeCount}</div>
                        </td>
                        <td class="p-2 align-middle" role="cell">
                          <div>{formatBytes(entry.size)}</div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <div class="w-full py-8 flex flex-col items-center justify-center space-y-1">
                      <div class="text-3xl">😕</div>
                      <div class="text-lg">No Anime found</div>
                      <div class="text-neutral-500 text-xs">
                        Try adding anime using the utility in the Sourcepanel,
                        they will be listed here afterwards.
                      </div>
                    </div>
                  )}
                </tbody>
              </table>
            </div>
          );
        }),
      )}
    </div>
  ) as HTMLElement;

  router.container!.appendChild(page);

  const baseDirResult =
    (await window.electronAPI?.getDir(basePath || "")) || [];
  setBaseDir(baseDirResult);

  const dirSizeResult =
    (await window.electronAPI?.getDirSize(basePath || "")) || 0;
  setDirSize(dirSizeResult);

  const entries: DirEntry[] = await Promise.all(
    baseDirResult.map(async (dir): Promise<DirEntry> => {
      const path = `${basePath}${dir}`;

      const [files, sizeResult] = await Promise.all([
        window.electronAPI?.getDir(path),
        window.electronAPI?.getDirSize(path),
      ]);

      const episodeCount =
        files?.filter(
          (file: string) => file.endsWith(".mp4") || file.endsWith(".mkv"),
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
        episodeCount,
        size,
      };
    }),
  );

  setDirEntries(entries);

  const totalEpisodes = entries.reduce(
    (acc, entry) => acc + entry.episodeCount,
    0,
  );
  setEpisodeCount(totalEpisodes);
}

function formatBytes(bytes: number, decimals: number = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
