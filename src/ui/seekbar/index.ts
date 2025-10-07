export function Seekbar(video) {
  const seekbar = document.createElement("div");
  seekbar.className =
    "group absolute bottom-13 left-4 right-4 flex items-center h-0.75 hover:h-1.5 bg-neutral-800 rounded cursor-pointer transition-all duration-300";

  seekbar.addEventListener("click", (event) => {
    const rect = seekbar.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const duration = video.duration;
    const seekTime = (offsetX / rect.width) * duration;
    video.currentTime = seekTime;
  });

  let isDraggingSeekbar = false;

  seekbar.addEventListener("mousedown", (event) => {
    isDraggingSeekbar = true;
    const rect = seekbar.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const seekTime = (offsetX / rect.width) * video.duration;
    video.currentTime = seekTime;
  });

  document.addEventListener("mousemove", (event) => {
    const rect = seekbar.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const seekTime = (offsetX / rect.width) * video.duration;

    if (isDraggingSeekbar) {
      video.currentTime = seekTime;
    }

    seekbarHover.style.left = `${offsetX - seekbarHover.clientWidth / 2}px`;
    seekbarHover.textContent = `${Math.floor(seekTime / 60)}:${Math.floor(
      seekTime % 60,
    )
      .toString()
      .padStart(2, "0")}`;
  });

  document.addEventListener("mouseup", () => {
    isDraggingSeekbar = false;
  });

  const seekbarbufferProgress = document.createElement("div");
  seekbarbufferProgress.className = "absolute h-full bg-neutral-600 rounded";

  video.addEventListener("progress", () => {
    if (video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const duration = video.duration;
      const bufferProgress = (bufferedEnd / duration) * 100;
      seekbarbufferProgress.style.width = `${bufferProgress}%`;
    }
  });

  const seekbarProgress = document.createElement("div");
  seekbarProgress.className = "absolute h-full bg-[#DC143C] rounded";

  const seekbarHandle = document.createElement("div");
  seekbarHandle.className =
    "absolute h-2.25 w-2.25 group-hover:w-3 group-hover:h-3 bg-[#DC143C] rounded-full transition-[height,width] duration-300";

  video.addEventListener("timeupdate", () => {
    const currentTime = video.currentTime;
    const duration = video.duration;

    const progress = (currentTime / duration) * 100;
    seekbarProgress.style.width = `${progress}%`;
    seekbarHandle.style.left = `${progress}%`;
    seekbarHandle.style.transform = `translateX(-50%)`;
  });

  const seekbarHover = document.createElement("div");
  seekbarHover.className =
    "absolute bottom-4 px-4 py-1 bg-neutral-800/50 backdrop-blur-md text-sm text-neutral-300 rounded-full hidden group-hover:block";

  // const seekbarChapters = document.createElement("div");
  // seekbarChapters.className = "absolute z-5 flex h-full w-full space-x-0.5";

  seekbar.appendChild(seekbarbufferProgress);
  seekbar.appendChild(seekbarProgress);
  seekbar.appendChild(seekbarHover);

  seekbar.appendChild(seekbarHandle);

  // seekbar.appendChild(seekbarChapters);

  return seekbar;
}
