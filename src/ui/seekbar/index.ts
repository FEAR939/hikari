export function Seekbar(video) {
  const seekbar = document.createElement("div");
  seekbar.className =
    "relative flex items-center h-0.75 w-full bg-neutral-800 rounded cursor-pointer";

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
    if (isDraggingSeekbar) {
      const rect = seekbar.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const seekTime = (offsetX / rect.width) * video.duration;
      video.currentTime = seekTime;
    }
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
  seekbarHandle.className = "absolute h-2.25 w-2.25 bg-[#DC143C] rounded-full";

  video.addEventListener("timeupdate", () => {
    const currentTime = video.currentTime;
    const duration = video.duration;

    const progress = (currentTime / duration) * 100;
    seekbarProgress.style.width = `${progress}%`;
    seekbarHandle.style.left = `${progress}%`;
    seekbarHandle.style.transform = `translateX(-50%)`;
  });

  // const seekbarChapters = document.createElement("div");
  // seekbarChapters.className = "absolute z-5 flex h-full w-full space-x-0.5";

  seekbar.appendChild(seekbarbufferProgress);
  seekbar.appendChild(seekbarProgress);

  seekbar.appendChild(seekbarHandle);

  // seekbar.appendChild(seekbarChapters);

  return seekbar;
}
