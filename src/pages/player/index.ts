import { router } from "../../lib/router/index";
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
  anilist_id: string;
  isBundle: string;
  bundleEpisodeNumber: string;
  episode: string;
}

export default async function Player(query: PlayerQuery) {
  let player = document.getElementById("player");

  if (!player) {
    player = document.createElement("div");
    player.id = "player";
    player.miniPlayerActive = false;
    player.className =
      "absolute top-0 h-full w-full bg-[#0c0c0c] transition-all duration-300";

    document.body.appendChild(player);
  }

  player.innerHTML = "";
  player.focus();

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
  video.className = "h-full w-full bg-[#000000]";
  video.preload = "auto";

  player.appendChild(video);

  const controls = document.createElement("div");
  controls.className =
    "absolute bottom-0 left-0 right-0 h-36 bg-gradient bg-gradient-to-t from-black to-transparent p-4 space-y-2";

  player.appendChild(controls);

  let timeout: NodeJS.Timeout | null = null;
  let canPlay = false;

  function handleMove() {
    controls.classList.remove("hidden");
    pageback.classList.remove("hidden");
    player.style.cursor = "default";
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      if (!canPlay || video.paused) return;
      controls.classList.add("hidden");
      pageback.classList.add("hidden");
      player.style.cursor = "none";
    }, 3000);
  }

  player.addEventListener("mousemove", handleMove);

  const titleAndTime = document.createElement("div");
  titleAndTime.className = "h-fit flex items-center justify-between space-x-2";

  const title = document.createElement("div");
  title.className = "h-12 text-white text-base truncate";
  title.textContent =
    JSON.parse(query.episode ?? "{}").title?.en || "No Episode Title found";

  const time = document.createElement("div");
  time.className = "h-12 text-white text-sm";
  time.textContent = "00:00 | 00:00";

  titleAndTime.appendChild(title);
  titleAndTime.appendChild(time);

  controls.appendChild(titleAndTime);

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

    time.textContent = `${new Date(video.currentTime * 1000).toISOString().substring(14, 19)} | ${new Date(video.duration * 1000).toISOString().substring(14, 19)}`;

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

  controls.appendChild(seekbar);

  const buttonRow = document.createElement("div");
  buttonRow.className = "h-12 p-2 flex items-center space-x-4";

  const playbutton = document.createElement("div");
  playbutton.className =
    "flex items-center justify-center size-5 cursor-pointer";
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

  const skipBack = document.createElement("div");
  skipBack.className = "flex items-center justify-center size-5 cursor-pointer";
  skipBack.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-skip-back-icon lucide-skip-back"><path d="M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z"/><path d="M3 20V4"/></svg>`;

  buttonRow.appendChild(skipBack);

  skipBack.addEventListener("click", () => {
    video.currentTime -= 10;
  });

  const skipForward = document.createElement("div");
  skipForward.className =
    "flex items-center justify-center size-5 cursor-pointer";
  skipForward.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-skip-forward-icon lucide-skip-forward"><path d="M21 4v16"/><path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z"/></svg>`;

  buttonRow.appendChild(skipForward);

  skipForward.addEventListener("click", () => {
    video.currentTime += 10;
  });

  const volumeIcons = {
    high: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume2-icon lucide-volume-2"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg>`,
    mid: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume1-icon lucide-volume-1"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/></svg>`,
    low: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-icon lucide-volume"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/></svg>`,
    off: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-off-icon lucide-volume-off"><path d="M16 9a5 5 0 0 1 .95 2.293"/><path d="M19.364 5.636a9 9 0 0 1 1.889 9.96"/><path d="m2 2 20 20"/><path d="m7 7-.587.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298V11"/><path d="M9.828 4.172A.686.686 0 0 1 11 4.657v.686"/></svg>`,
  };

  const volumeArea = document.createElement("div");
  volumeArea.className = "group flex items-center space-x-2 px-1";

  const volumebutton = document.createElement("div");
  volumebutton.className =
    "flex items-center justify-center size-5 cursor-pointer";

  const volumeSlider = document.createElement("div");
  volumeSlider.className =
    "relative flex items-center h-0.75 w-0 group-hover:w-16 bg-neutral-700 rounded-full cursor-pointer transition-all duration-300";

  const volumeProgress = document.createElement("div");
  volumeProgress.className = "h-full bg-white rounded-full";

  const volumeHandle = document.createElement("div");
  volumeHandle.className =
    "absolute w-2.25 h-2.25 bg-white rounded-full hidden group-hover:block";

  volumeSlider.appendChild(volumeProgress);
  volumeSlider.appendChild(volumeHandle);
  volumeArea.appendChild(volumebutton);
  volumeArea.appendChild(volumeSlider);
  buttonRow.appendChild(volumeArea);

  function updateVolumeUI(volume: number) {
    volume = Math.max(0, Math.min(1, volume));
    volumeProgress.style.width = `${volume * 100}%`;
    volumeHandle.style.left = `${volume * 100}%`;
    volumeHandle.style.transform = `translateX(-50%)`;

    if (volume === 0.0) {
      volumebutton.innerHTML = volumeIcons.off;
    } else if (volume < 0.25) {
      volumebutton.innerHTML = volumeIcons.low;
    } else if (volume < 0.75) {
      volumebutton.innerHTML = volumeIcons.mid;
    } else {
      volumebutton.innerHTML = volumeIcons.high;
    }
  }

  volumeSlider.addEventListener("click", (event) => {
    const rect = volumeSlider.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const volume = offsetX / rect.width;
    video.volume = volume;
  });

  let isDraggingVolume = false;

  volumeSlider.addEventListener("mousedown", (event) => {
    isDraggingVolume = true;
    const rect = volumeSlider.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const volume = offsetX / rect.width;
    updateVolumeUI(volume);
  });

  document.addEventListener("mousemove", (event) => {
    if (isDraggingVolume) {
      const rect = volumeSlider.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const volume = offsetX / rect.width;
      updateVolumeUI(volume);
    }
  });

  document.addEventListener("mouseup", () => {
    localStorage.setItem("player_volume", (video.volume * 100).toString());
    isDraggingVolume = false;
  });

  video.addEventListener("volumechange", () => {
    const volume = parseFloat(video.volume.toFixed(2));
    console.log(volume);
    updateVolumeUI(volume);
  });

  if (localStorage.getItem("player_volume") === null) {
    localStorage.setItem("player_volume", "100");
  }

  const savedVolume =
    parseInt(localStorage.getItem("player_volume") || "100") / 100;
  video.volume = savedVolume;

  updateVolumeUI(savedVolume);

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

  const autoPlayToggle = document.createElement("div");
  autoPlayToggle.className = "relative h-4 w-10 rounded-full bg-neutral-800";

  const autoPlayNob = document.createElement("div");
  autoPlayNob.className =
    "absolute h-4 w-4 rounded-full flex items-center justify-center bg-neutral-600 transition-all duration-150";

  autoPlayToggle.appendChild(autoPlayNob);

  if (localStorage.getItem("autoPlay") === null) {
    localStorage.setItem("autoPlay", "true");
  }

  let autoPlayState = localStorage.getItem("autoPlay") === "true";

  function toggleAutoPlay() {
    if (autoPlayState) {
      autoPlayNob.style.transform = "translateX(100%)";
      autoPlayNob.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play-icon lucide-play size-2"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>
      `;
    } else {
      autoPlayNob.style.transform = "translateX(0)";
      autoPlayNob.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause-icon lucide-pause size-2"><rect x="14" y="3" width="5" height="18" rx="1"/><rect x="5" y="3" width="5" height="18" rx="1"/></svg>
      `;
    }
  }

  toggleAutoPlay();

  autoPlayToggle.addEventListener("click", () => {
    autoPlayState = !autoPlayState;
    toggleAutoPlay();
  });

  buttonRow.appendChild(autoPlayToggle);

  const miniPlayerbutton = document.createElement("div");
  miniPlayerbutton.className =
    "flex items-center justify-center size-5 cursor-pointer";
  miniPlayerbutton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-picture-in-picture-icon lucide-picture-in-picture"><path d="M2 10h6V4"/><path d="m2 4 6 6"/><path d="M21 10V7a2 2 0 0 0-2-2h-7"/><path d="M3 14v2a2 2 0 0 0 2 2h3"/><rect x="12" y="14" width="10" height="7" rx="1"/></svg>`;

  buttonRow.appendChild(miniPlayerbutton);

  miniPlayerbutton.addEventListener("click", () => {
    if (!player.miniPlayerActive) {
      miniPlayerbutton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-picture-in-picture2-icon lucide-picture-in-picture-2"><path d="M21 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h4"/><rect width="10" height="7" x="12" y="13" rx="2"/></svg>`;
      player.className =
        "absolute bottom-4 right-4 h-48 aspect-video bg-[#0c0c0c] rounded-lg overflow-hidden transition-all duration-300";
      player.miniPlayerActive = true;
    } else {
      miniPlayerbutton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-picture-in-picture-icon lucide-picture-in-picture"><path d="M2 10h6V4"/><path d="m2 4 6 6"/><path d="M21 10V7a2 2 0 0 0-2-2h-7"/><path d="M3 14v2a2 2 0 0 0 2 2h3"/><rect x="12" y="14" width="10" height="7" rx="1"/></svg>`;
      player.className =
        "absolute bottom-0 right-0 h-full w-full bg-[#0c0c0c] transition-all duration-300";

      player.miniPlayerActive = false;
    }
  });

  const fullscreenbutton = document.createElement("div");
  fullscreenbutton.className =
    "flex items-center justify-center size-5 cursor-pointer";
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

    // const chapters = await getAnimeChapters(
    //   parseInt(JSON.parse(query.episode).mal_id),
    //   parseInt(JSON.parse(query.episode).episode),
    //   video.duration,
    // );

    // if (chapters.length == 0) {
    //   const chapterElement = document.createElement("div");
    //   chapterElement.className = "h-full bg-black/25";
    //   chapterElement.style.width = `100%`;

    //   seekbarChapters.appendChild(chapterElement);
    //   return;
    // }

    // chapters.forEach((chapter) => {
    //   const chapterElement = document.createElement("div");
    //   chapterElement.className = "h-full bg-black/25";
    //   chapterElement.style.width = `${((chapter.end / 1000 - chapter.start / 1000) / video.duration) * 100}%`;

    //   seekbarChapters.appendChild(chapterElement);
    // });
  });

  if (!query.streamurl) {
    console.error("Missing streamurl");
    return;
  }

  video.src = query.streamurl;

  video.addEventListener("ended", () => {
    if (!autoPlayState) return;
    handleBeforeClose();
    player.remove();
    router.navigate(
      `/anime/episodes/sourcePanel?episode=${parseInt(JSON.parse(query.episode).episode) + 1}`,
    );
  });

  window.addEventListener("keyup", (event) => {
    event.preventDefault();
    switch (event.key) {
      case " ":
        video.paused ? video.play() : video.pause();
        break;
      case "f":
        fullscreenbutton.dispatchEvent(new Event("click"));
        break;
      case "ArrowLeft":
        video.currentTime -= 10;
        break;
      case "ArrowRight":
        video.currentTime += 10;
        break;
      case "ArrowUp":
        video.volume = Math.min(video.volume + 0.1, 1);
        break;
      case "ArrowDown":
        video.volume = Math.max(video.volume - 0.1, 0);
        break;
    }
  });

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
    router.navigate(
      `/anime/updateEpisodeProgress?anilist_id=${query.anilist_id}&episode=${JSON.parse(query.episode).episode}&leftoff=${Math.floor(video.currentTime)}`,
    );

    if (!authService.getUser()) return (video.src = "");

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

    video.src = "";
  }
}
