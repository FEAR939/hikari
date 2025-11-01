import { h } from "../../lib/jsx/runtime";
import { router } from "../../lib/router";

export default async function Files(query) {
  const basePath = localStorage.getItem("app_local_media_path");
  const baseDir = await window.electronAPI?.getDir(basePath);
  const episodeCount = (
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
  ).reduce((acc, curr) => acc + curr, 0);

  const dirSize = formatBytes(await window.electronAPI?.getDirSize(basePath));

  const page = (
    <div class="h-full w-full p-4 pt-12 space-y-4 overflow-y-scroll">
      <div class="h-48 w-full flex bg-neutral-950 rounded-lg">
        <div class="h-full w-full flex flex-col items-center justify-center">
          <div>{baseDir.length}</div>
          <div class="text-neutral-700">Anime</div>
        </div>
        <div class="h-full w-full flex flex-col items-center justify-center">
          <div>{episodeCount}</div>
          <div class="text-neutral-700">Episodes</div>
        </div>
        <div class="h-full w-full flex flex-col items-center justify-center">
          <div>{dirSize}</div>
          <div class="text-neutral-700">Size</div>
        </div>
      </div>
      <div>
        {baseDir.map((dir) => (
          <div class="text-sm px-3 py-1.5 hover:bg-neutral-900 rounded-md">
            {dir}
          </div>
        ))}
      </div>
    </div>
  ) as HTMLElement;

  router.container!.appendChild(page);
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
