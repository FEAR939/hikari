import { router } from "../../lib/router/index";
import { getSkipTimes } from "../../lib/aniskip";
import { authService } from "../../services/auth";
import { getLeftoff, setLeftoff } from "../../lib/api";
import { Seekbar } from "../../ui/seekbar";
import { Volume } from "../../ui/volume";

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

  const loading_indicator = document.createElement("div");
  loading_indicator.className = "absolute inset-0 size-16 m-auto animate-spin";
  loading_indicator.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-circle-icon lucide-loader-circle size-16"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;

  player.appendChild(loading_indicator);

  const controls = document.createElement("div");
  controls.className =
    "absolute bottom-0 left-0 right-0 h-26 bg-gradient bg-gradient-to-t from-black to-transparent px-4 py-2 space-y-2 flex flex-col justify-around";

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
  title.className = "h-6 max-w-1/2 text-white text-base truncate";
  title.textContent =
    JSON.parse(query.episode ?? "{}").title?.en || "No Episode Title found";

  const time = document.createElement("div");
  time.className = "h-6 text-white text-base";
  time.textContent = "00:00 | 00:00";

  video.addEventListener("timeupdate", () => {
    const currentTime = video.currentTime;
    const duration = video.duration;

    time.textContent = `${new Date(video.currentTime * 1000).toISOString().substring(14, 19)} | ${new Date(video.duration * 1000).toISOString().substring(14, 19)}`;
  });

  titleAndTime.appendChild(title);
  titleAndTime.appendChild(time);

  controls.appendChild(titleAndTime);

  const seekbar = Seekbar(video);
  controls.appendChild(seekbar);

  const buttonRow = document.createElement("div");
  buttonRow.className = "bottom-0 h-12 p-2 flex items-center space-x-4";

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

  const volume = Volume(video);
  buttonRow.appendChild(volume);

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
  autoPlayToggle.className =
    "relative h-4 min-w-8 w-8 rounded-full bg-neutral-800 cursor-pointer";

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
        "absolute bottom-4 right-4 h-48 w-[calc(12rem*(16/9))] aspect-video bg-[#0c0c0c] rounded-lg overflow-hidden transition-all duration-300";
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
    loading_indicator.remove();
    video.play();
    controls.classList.add("hidden");
    pageback.classList.add("hidden");

    const malId = JSON.parse(query.episode).mal_id;
    const episodeNumber = JSON.parse(query.episode).episode;
    const showName = JSON.parse(query.episode).title;

    const aniskip = await getSkipTimes(malId, episodeNumber);

    console.log(aniskip);

    if (!aniskip.found) return;

    const chapters = aniskip.results.map((segment) => {
      let timestampStart = segment.interval.start_time;
      let timestampEnd = segment.interval.end_time;
      let segmentType = segment.skip_type;
      let segmentId = segment.skip_id;

      return {
        id: segmentId,
        title: segmentType,
        start: timestampStart,
        end: timestampEnd,
      };
    });

    seekbar.updateChapters(chapters);
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
    const leftoff = await getLeftoff({
      anilist_id: query.anilist_id,
      ident: JSON.parse(query.episode).episode,
    });

    if (!leftoff) return;

    video.currentTime = leftoff;
  }

  async function handleBeforeClose() {
    router.navigate(
      `/anime/updateEpisodeProgress?anilist_id=${query.anilist_id}&episode=${JSON.parse(query.episode).episode}&leftoff=${Math.floor(video.currentTime)}`,
    );

    if (!authService.getUser()) {
      video.removeAttribute("src");
      video.load();
      return;
    }

    setLeftoff({
      anilist_id: query.anilist_id,
      episode: JSON.parse(query.episode).episode,
      leftoff: Math.floor(video.currentTime),
    });

    video.removeAttribute("src");
    video.load();
    return;
  }
}
