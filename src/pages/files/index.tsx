import { h } from "../../lib/jsx/runtime";
import { createSignal, bind } from "../../lib/jsx/reactive";
import { router } from "../../lib/router";

export default async function Files(query) {
  const basePath = localStorage.getItem("app_local_media_path");

  const [baseDir, setBaseDir, subscribeBaseDir] = createSignal<string[]>([]);
  const [episodeCount, setEpisodeCount, subscribeEpisodeCount] =
    createSignal<number>(0);
  const [dirSize, setDirSize, subscribeDirSize] = createSignal<number>(0);

  const page = (
    <div class="h-full w-full p-4 pt-12 space-y-4 overflow-y-scroll">
      <div class="h-48 w-full flex bg-neutral-950 rounded-lg">
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
      {bind([baseDir, setBaseDir, subscribeBaseDir], (value) => (
        <div class="border border-neutral-900 rounded-lg [&>*:last-of-type]:rounded-b-lg">
          <div class="px-6 py-3 grid grid-cols-3 text-sm text-neutral-500 border-b border-neutral-900">
            <div>Title</div>
            <div>Episodes</div>
            <div>Size</div>
          </div>
          {value.length > 0 ? (
            value.map((dir) => (
              <div class="text-sm px-6 py-3 grid grid-cols-3 hover:bg-neutral-800 border-b border-neutral-900">
                <div>{dir}</div>
                <EntryEpisodeCount basePath={basePath} dir={dir} />
                <EntryDirSize basePath={basePath} dir={dir} />
              </div>
            ))
          ) : (
            <div>No Anime found</div>
          )}
        </div>
      ))}
    </div>
  ) as HTMLElement;

  router.container!.appendChild(page);

  subscribeBaseDir(async () => {
    const episodeCountResult = await getEpisodeCount(basePath || "", baseDir());
    setEpisodeCount(episodeCountResult);
  });

  const baseDirResult =
    (await window.electronAPI?.getDir(basePath || "")) || [];
  setBaseDir(baseDirResult);

  const dirSizeResult =
    (await window.electronAPI?.getDirSize(basePath || "")) || 0;
  setDirSize(dirSizeResult);
}

function EntryEpisodeCount({ basePath, dir }) {
  const [count, setCount, subscribeCount] = createSignal(0);
  new Promise(async () => {
    const episodeCountResult = await getEpisodeCount(basePath || "", [dir]);
    setCount(episodeCountResult);
  });
  return bind([count, setCount, subscribeCount], (value) => <div>{value}</div>);
}

function EntryDirSize({ basePath, dir }) {
  const [size, setSize, subscribeSize] = createSignal(0);
  new Promise(async () => {
    const path = `${basePath}${dir}`;
    const dirSizeResult = await window.electronAPI?.getDirSize(path);
    setSize(dirSizeResult || 0);
  });
  return bind([size, setSize, subscribeSize], (value) => (
    <div>{formatBytes(value)}</div>
  ));
}

async function getEpisodeCount(basePath: string, baseDir: string[]) {
  return (
    await Promise.all(
      baseDir.map(async (dir) => {
        const path = `${basePath}${dir}`;

        const files = await window.electronAPI?.getDir(path);
        return (
          files?.filter(
            (file) => file.endsWith(".mp4") || file.endsWith(".mkv"),
          ).length || 0
        );
      }),
    )
  ).reduce((acc: number, curr: number) => acc + curr, 0);
}

function formatBytes(bytes: number, decimals: number = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
