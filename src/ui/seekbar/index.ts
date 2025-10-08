export function Seekbar(video) {
  let hasChapters = false;
  let seekBarChapters = [];
  let seekBarChapterNodes = [];
  let currentHoveredChapter = -1; // Cache the currently hovered chapter
  let rafId = null; // For requestAnimationFrame

  const seekbar = document.createElement("div");
  seekbar.className =
    "group absolute bottom-13 left-4 right-4 flex space-x-1 items-center rounded cursor-pointer transition-all duration-300";
  seekbar.style.height = `${4 * 0.75}px`;

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

  // Optimized mousemove handler using requestAnimationFrame
  seekbar.addEventListener("mousemove", (event) => {
    if (rafId) return; // Skip if we already have a pending animation frame

    rafId = requestAnimationFrame(() => {
      const rect = seekbar.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const seekTime = (offsetX / rect.width) * video.duration;

      if (isDraggingSeekbar) {
        video.currentTime = seekTime;
      }

      if (seekBarChapterNodes.length > 0) {
        // Find the hovered chapter
        const chapter = seekBarChapters.findIndex(
          (node) => node.start <= seekTime && node.end >= seekTime,
        );

        // Only update if the hovered chapter changed
        if (chapter !== currentHoveredChapter) {
          // Reset previous chapter if it exists
          if (
            currentHoveredChapter >= 0 &&
            seekBarChapterNodes[currentHoveredChapter]
          ) {
            seekBarChapterNodes[currentHoveredChapter].style.height =
              `${4 * 0.75}px`;
            seekBarChapterNodes[currentHoveredChapter].style.transform =
              "translateY(0)";
          }

          // Update new chapter
          if (chapter >= 0 && seekBarChapterNodes[chapter]) {
            seekBarChapterNodes[chapter].style.height = `${4 * 1.5}px`;
          }

          currentHoveredChapter = chapter;
        }
      } else {
        seekbar.style.height = `${4 * 1.5}px`;
        seekbar.style.transform = "translateY(25%)";
      }

      // Update hover tooltip position
      seekbarHover.style.left = `${offsetX - seekbarHover.clientWidth / 2}px`;
      seekbarHover.textContent = `${Math.floor(seekTime / 60)}:${Math.floor(
        seekTime % 60,
      )
        .toString()
        .padStart(2, "0")}`;

      rafId = null; // Clear the animation frame id
    });
  });

  document.addEventListener("mouseup", () => {
    isDraggingSeekbar = false;
  });

  seekbar.addEventListener("mouseleave", () => {
    // Cancel any pending animation frame
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    seekbar.style.height = `${4 * 0.75}px`;
    seekbar.style.transform = "translateY(0)";

    // Reset the currently hovered chapter
    if (
      currentHoveredChapter >= 0 &&
      seekBarChapterNodes[currentHoveredChapter]
    ) {
      seekBarChapterNodes[currentHoveredChapter].style.height = `${4 * 0.75}px`;
      seekBarChapterNodes[currentHoveredChapter].style.transform =
        "translateY(0)";
      currentHoveredChapter = -1;
    }
  });

  const seekbarbufferProgress = document.createElement("div");
  seekbarbufferProgress.className = "absolute h-full bg-neutral-600 rounded";

  video.addEventListener("progress", () => {
    if (video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const duration = video.duration;

      if (seekbarbufferProgress) {
        const bufferProgress = (bufferedEnd / duration) * 100;
        seekbarbufferProgress.style.width = `${bufferProgress}%`;
      }

      if (seekBarChapterNodes.length > 0) {
        let remainingDuration = bufferedEnd;
        seekBarChapterNodes.forEach((chapter, index) => {
          const chapterObj = seekBarChapters[index];
          const segmentDuration = chapterObj.end - chapterObj.start;
          const segmentPercentage = Math.min(
            (remainingDuration / segmentDuration) * 100,
            100,
          );

          remainingDuration = Math.max(remainingDuration - segmentDuration, 0);

          chapter.updateBufferProgress(segmentPercentage);
        });
      }
    }
  });

  const seekbarProgress = document.createElement("div");
  seekbarProgress.className = "absolute h-full bg-[#DC143C] rounded";

  const seekbarHandle = document.createElement("div");
  seekbarHandle.className =
    "absolute z-2 h-2.25 w-2.25 group-hover:w-3 group-hover:h-3 bg-[#DC143C] rounded-full transition-[height,width] duration-300";

  video.addEventListener("timeupdate", () => {
    const currentTime = video.currentTime;
    const duration = video.duration;

    const progress = (currentTime / duration) * 100;

    if (seekbarProgress) {
      seekbarProgress.style.width = `${progress}%`;
    }

    if (seekBarChapterNodes.length > 0) {
      let remainingDuration = currentTime;
      seekBarChapterNodes.forEach((chapter, index) => {
        const chapterObj = seekBarChapters[index];
        const segmentDuration = chapterObj.end - chapterObj.start;
        const segmentPercentage = Math.min(
          (remainingDuration / segmentDuration) * 100,
          100,
        );

        remainingDuration = Math.max(remainingDuration - segmentDuration, 0);

        chapter.updateProgress(segmentPercentage);
      });
    }

    seekbarHandle.style.left = `${progress}%`;
    seekbarHandle.style.transform = `translateX(-50%)`;
  });

  const seekbarHover = document.createElement("div");
  seekbarHover.className =
    "absolute bottom-4 px-4 py-1 bg-neutral-800/50 backdrop-blur-md text-sm text-neutral-300 rounded-full hidden group-hover:block";

  seekbar.appendChild(seekbarbufferProgress);
  seekbar.appendChild(seekbarProgress);
  seekbar.appendChild(seekbarHover);
  seekbar.appendChild(seekbarHandle);

  seekbar.updateChapters = (chapters) => {
    for (let index = 0; index < chapters.length; index++) {
      const chapter = chapters[index];

      if (index === 0 && chapter.start !== 0) {
        const chapterBefore = {
          start: 0,
          end: chapter.start,
          title: "Start",
        };

        seekBarChapters.push(chapterBefore);
      }

      seekBarChapters.push(chapter);

      if (index === chapters.length - 1 && chapter.end !== video.duration) {
        const chapterAfter = {
          start: chapter.end,
          end: video.duration,
          title: "End",
        };

        seekBarChapters.push(chapterAfter);
      }
    }

    hasChapters = true;

    seekbarProgress.remove();
    seekbarbufferProgress.remove();

    seekBarChapters.forEach((chapter, index: number) => {
      const chapterElement = document.createElement("div");
      chapterElement.className = `relative top-0 bottom-0 bg-neutral-800 ${index === 0 ? "rounded-l" : ""} ${index === seekBarChapters.length - 1 ? "rounded-r" : ""} transition-all duration-200 overflow-hidden`;
      chapterElement.style.height = `${4 * 0.75}px`;
      chapterElement.style.width = `${((chapter.end - chapter.start) / video.duration) * 100}%`;
      chapterElement.title = chapter.title;

      seekbar.appendChild(chapterElement);

      const chapterBufferProgress = document.createElement("div");
      chapterBufferProgress.className = "absolute left-0 h-full bg-neutral-600";

      chapterElement.appendChild(chapterBufferProgress);

      chapterElement.updateBufferProgress = (percentage) => {
        chapterBufferProgress.style.width = `${percentage}%`;
      };

      const chapterProgress = document.createElement("div");
      chapterProgress.className = "absolute left-0 h-full bg-[#DC143C]";

      chapterElement.appendChild(chapterProgress);

      chapterElement.updateProgress = (percentage) => {
        chapterProgress.style.width = `${percentage}%`;
      };

      seekBarChapterNodes.push(chapterElement);
    });
  };

  return seekbar;
}
