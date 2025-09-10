import { getBundle } from "../../lib/animetoast";
import { getEpisodeLink } from "../../lib/animetoast";
import { getAnimeChapters } from "../../lib/aniskip";
import { authService } from "../../services/auth";

declare global {
  interface Window {
    electronAPI?: {
      enterFullscreen: () => void;
      exitFullscreen: () => void;
    };
  }
}

interface PlayerQuery {
  url: string;
  episodeNumber: string;
  mal_id: string;
  isBundle: string;
  bundleEpisodeNumber: string;
}

export default async function Player(query: PlayerQuery) {
  let player = document.querySelector("#player");

  if (!player) {
    player = document.createElement("div");
    player.className = "absolute top-0 h-full w-full bg-[#0c0c0c]";

    document.body.appendChild(player);
  }

  player.innerHTML = "";

  player.classList.add("z-10");

  const pageback = document.createElement("div");
  pageback.className =
    "absolute z-10 top-2 left-4 size-8 flex items-center justify-center cursor-pointer";
  pageback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left-to-line-icon lucide-arrow-left-to-line"><path d="M3 19V5"/><path d="m13 6-6 6 6 6"/><path d="M7 12h14"/></svg>`;

  player.appendChild(pageback);

  pageback.addEventListener("click", () => {
    handleBeforeClose();
    player.remove();
    window.electronAPI?.exitFullscreen();
  });

  const isMobileDevice = /Mobi/i.test(window.navigator.userAgent);

  const video = document.createElement("video");
  video.className = "h-full w-full";
  video.preload = "auto";

  player.appendChild(video);

  const controls = document.createElement("div");
  controls.className =
    "absolute bottom-0 left-0 right-0 h-24 bg-black bg-opacity-50 p-4 space-y-1";

  player.appendChild(controls);

  let timeout: NodeJS.Timeout | null = null;
  let canPlay = false;

  function handleMove() {
    controls.classList.remove("hidden");
    pageback.classList.remove("hidden");
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      if (!canPlay || video.paused) return;
      controls.classList.add("hidden");
      pageback.classList.add("hidden");
    }, 3000);
  }

  player.addEventListener("mousemove", handleMove);

  const titleAndTime = document.createElement("div");
  titleAndTime.className = "h-fit flex items-center justify-between space-x-2";

  const title = document.createElement("div");
  title.className = "text-white text-sm font-bold truncate";
  title.textContent = JSON.parse(query.episode).title.en;

  const time = document.createElement("div");
  time.className = "text-white text-sm font-bold";
  time.textContent = "00:00 | 00:00";

  titleAndTime.appendChild(title);
  titleAndTime.appendChild(time);

  controls.appendChild(titleAndTime);

  const seekbar = document.createElement("div");
  seekbar.className = "relative h-1.5 w-full bg-gray-500 rounded";

  seekbar.addEventListener("click", (event) => {
    const rect = seekbar.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const duration = video.duration;
    const seekTime = (offsetX / rect.width) * duration;
    video.currentTime = seekTime;
  });

  const seekbarbufferProgress = document.createElement("div");
  seekbarbufferProgress.className = "absolute h-full bg-gray-500 rounded";

  video.addEventListener("progress", () => {
    if (video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const duration = video.duration;
      const bufferProgress = (bufferedEnd / duration) * 100;
      seekbarbufferProgress.style.width = `${bufferProgress}%`;
    }
  });

  const seekbarProgress = document.createElement("div");
  seekbarProgress.className = "absolute h-full bg-white rounded";

  video.addEventListener("timeupdate", () => {
    const currentTime = video.currentTime;
    const duration = video.duration;

    time.textContent = `${new Date(video.currentTime * 1000).toISOString().substring(14, 19)} | ${new Date(video.duration * 1000).toISOString().substring(14, 19)}`;

    const progress = (currentTime / duration) * 100;
    seekbarProgress.style.width = `${progress}%`;
  });

  const seekbarChapters = document.createElement("div");
  seekbarChapters.className = "absolute z-5 flex h-full w-full space-x-0.5";

  seekbar.appendChild(seekbarbufferProgress);
  seekbar.appendChild(seekbarProgress);
  seekbar.appendChild(seekbarChapters);

  controls.appendChild(seekbar);

  const buttonRow = document.createElement("div");
  buttonRow.className = "flex items-center space-x-2";

  const playbutton = document.createElement("div");
  playbutton.className = "size-6";
  playbutton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play-icon lucide-play"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>`;

  buttonRow.appendChild(playbutton);

  function handlePlayState() {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  playbutton.addEventListener("click", handlePlayState);
  video.addEventListener("play", () => {
    playbutton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause-icon lucide-pause"><rect x="14" y="3" width="5" height="18" rx="1"/><rect x="5" y="3" width="5" height="18" rx="1"/></svg>`;
  });
  video.addEventListener("pause", () => {
    playbutton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play-icon lucide-play"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>`;
  });

  let touched = false;
  let touchtimeout: NodeJS.Timeout | null = null;
  video.addEventListener("click", () => {
    if (!isMobileDevice) return handlePlayState();
    if (touchtimeout) clearTimeout(touchtimeout);

    touchtimeout = setTimeout(() => (touched = false), 3000);

    if (!touched) return (touched = true);

    handlePlayState();
  });

  const spacer = document.createElement("div");
  spacer.className = "w-full";

  buttonRow.appendChild(spacer);

  const fullscreenbutton = document.createElement("div");
  fullscreenbutton.className = "size-5";
  fullscreenbutton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-maximize-icon lucide-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>`;

  buttonRow.appendChild(fullscreenbutton);

  let fullscreenstate = false;

  fullscreenbutton.addEventListener("click", () => {
    console.log("fullscreenbutton clicked");
    if (!fullscreenstate) {
      window.electronAPI?.enterFullscreen();
      fullscreenbutton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minimize-icon lucide-minimize"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>`;
      fullscreenstate = true;
      return;
    }

    window.electronAPI?.exitFullscreen();
    fullscreenbutton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-maximize-icon lucide-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>`;
    fullscreenstate = false;
  });

  controls.appendChild(buttonRow);

  video.addEventListener("loadedmetadata", async () => {
    canPlay = true;
    video.play();
    controls.classList.add("hidden");
    pageback.classList.add("hidden");

    const chapters = await getAnimeChapters(
      parseInt(JSON.parse(query.episode).mal_id),
      parseInt(JSON.parse(query.episode).episode),
      video.duration,
    );

    if (chapters.length == 0) {
      const chapterElement = document.createElement("div");
      chapterElement.className = "h-full bg-black/25";
      chapterElement.style.width = `100%`;

      seekbarChapters.appendChild(chapterElement);
      return;
    }

    chapters.forEach((chapter) => {
      const chapterElement = document.createElement("div");
      chapterElement.className = "h-full bg-black/25";
      chapterElement.style.width = `${((chapter.end / 1000 - chapter.start / 1000) / video.duration) * 100}%`;

      seekbarChapters.appendChild(chapterElement);
    });
  });

  video.src = query.streamurl;

  if (authService.getUser()) {
    try {
      const formData = new FormData();
      formData.append("anilist_id", query.anilist_id);
      formData.append(
        "episode_filter",
        `${JSON.parse(query.episode).episode}-${JSON.parse(query.episode).episode}`,
      );

      const response = await fetch(
        `${localStorage.getItem("app_server_adress")}/get-leftoff-at`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        console.warn("Failed to get leftoff time");
        return;
      }

      const data = await response.json();

      video.currentTime = data[0].leftoff;
    } catch (error) {
      console.warn("Error getting leftoff time:", error);
    }
  }

  async function handleBeforeClose() {
    if (!authService.getUser()) return;

    const formData = new FormData();
    formData.append("anilist_id", query.anilist_id);
    formData.append("episode", JSON.parse(query.episode).episode);
    formData.append("leftoff", Math.floor(video.currentTime));

    const response = await fetch(
      `${localStorage.getItem("app_server_adress")}/set-leftoff-at`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      console.error("Failed to update leftoff time");
    }
  }
}
