import { h } from "../../lib/jsx/runtime";
import { router } from "../../lib/router/index";
import { getSkipTimes, SkipResult } from "../../lib/aniskip";
import { authService } from "../../services/auth";
import { API } from "../../app";
import { Seekbar } from "../../ui/seekbar";
import { Volume } from "../../ui/volume";
import { PlayerSettingsMenu } from "../../ui/playerSettingsMenu";

interface PlayerQuery {
  url: string;
  episodeNumber: string;
  kitsu_id: string;
  isBundle: string;
  bundleEpisodeNumber: string;
  episode: string;
  streamurl?: string;
}

export default async function Player(query: PlayerQuery) {
  let player = document.getElementById("player") as HTMLDivElement & {
    miniPlayerActive?: boolean;
  };

  if (!player) {
    player = document.createElement("div") as any;
    player.id = "player";
    player.miniPlayerActive = false;
    player.className =
      "absolute z-20 top-0 h-full w-full bg-[#0c0c0c] transition-all duration-300";
    document.body.appendChild(player);
  }

  player.innerHTML = "";
  player.focus();
  player.classList.add("z-10");

  const isMobileDevice = /Mobi/i.test(window.navigator.userAgent);
  const video = document.createElement("video");
  video.className = "h-full w-full bg-[#000000]";
  video.preload = "auto";

  let timeout: NodeJS.Timeout | null = null;
  let canPlay = false;
  let touched = false;
  let touchtimeout: NodeJS.Timeout | null = null;
  let autoPlayState = localStorage.getItem("autoPlay") !== "false";
  let settingsMenuState = false;
  let fullscreenstate = false;

  const episodeData = JSON.parse(query.episode ?? "{}");

  // Event Handlers
  const handleBeforeClose = async () => {
    router.navigate(
      `/anime/updateEpisodeProgress?kitsu_id=${query.kitsu_id}&episode=${episodeData.attributes.number}&leftoff=${Math.floor(video.currentTime)}`,
    );

    if (!authService.getUser()) {
      video.removeAttribute("src");
      video.load();
      return;
    }

    API.setLeftoff({
      kitsu_id: parseInt(query.kitsu_id),
      episode: episodeData.attributes.number,
      leftoff: Math.floor(video.currentTime),
    });

    video.pause();
    video.currentTime = 0;
    video.removeAttribute("src");
    video.load();
  };

  const handlePlayState = () => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleMove = () => {
    controls.classList.remove("hidden");
    pageback.classList.remove("hidden");
    player!.style.cursor = "default";

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (!canPlay || video.paused) return;
      controls.classList.add("hidden");
      pageback.classList.add("hidden");
      player!.style.cursor = "none";
    }, 3000);
  };

  const toggleAutoPlay = () => {
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
  };

  // Components
  const pageback = (
    <div
      class="absolute z-10 top-2 left-4 size-8 flex items-center justify-center cursor-pointer"
      onClick={() => {
        handleBeforeClose();
        player.remove();
        window.electronAPI?.exitFullscreen();
      }}
    >
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
        class="lucide lucide-arrow-left-to-line"
      >
        <path d="M3 19V5" />
        <path d="m13 6-6 6 6 6" />
        <path d="M7 12h14" />
      </svg>
    </div>
  ) as HTMLDivElement;

  const loading_indicator = (
    <div class="absolute inset-0 size-16 m-auto animate-spin">
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
        class="lucide lucide-loader-circle size-16"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    </div>
  ) as HTMLDivElement;

  const time = (
    <div class="h-6 text-white text-base">00:00 | 00:00</div>
  ) as HTMLDivElement;

  const titleAndTime = (
    <div class="h-fit flex items-center justify-between space-x-2">
      <div class="h-6 max-w-1/2 text-white text-base truncate">
        {episodeData.attributes.titles.en ||
          episodeData.attributes.titles.en_us ||
          episodeData.attributes.titles.en_jp ||
          episodeData.attributes.titles.en_cn ||
          episodeData.attributes.titles.ja_jp ||
          "No Episode Title found"}
      </div>
      {time}
    </div>
  ) as HTMLDivElement;

  const seekbar = Seekbar(video);

  const playbutton = (
    <div class="flex items-center justify-center size-5 cursor-pointer">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-play"
      >
        <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
      </svg>
    </div>
  ) as HTMLDivElement;

  const skipBack = (
    <div
      class="flex items-center justify-center size-5 cursor-pointer"
      onClick={() => (video.currentTime -= 10)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-skip-back"
      >
        <path d="M17.971 4.285A2 2 0 0 1 21 6v12a2 2 0 0 1-3.029 1.715l-9.997-5.998a2 2 0 0 1-.003-3.432z" />
        <path d="M3 20V4" />
      </svg>
    </div>
  ) as HTMLDivElement;

  const skipForward = (
    <div
      class="flex items-center justify-center size-5 cursor-pointer"
      onClick={() => (video.currentTime += 10)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-skip-forward"
      >
        <path d="M21 4v16" />
        <path d="M6.029 4.285A2 2 0 0 0 3 6v12a2 2 0 0 0 3.029 1.715l9.997-5.998a2 2 0 0 0 .003-3.432z" />
      </svg>
    </div>
  ) as HTMLDivElement;

  const volume = Volume(video);

  const autoPlayNob = (
    <div class="absolute h-4 w-4 rounded-full flex items-center justify-center bg-neutral-600 transition-all duration-150" />
  ) as HTMLDivElement;

  const autoPlayToggle = (
    <div
      class="relative h-4 min-w-8 w-8 rounded-full bg-neutral-800 cursor-pointer"
      onClick={() => {
        autoPlayState = !autoPlayState;
        localStorage.setItem("autoPlay", String(autoPlayState));
        toggleAutoPlay();
      }}
    >
      {autoPlayNob}
    </div>
  ) as HTMLDivElement;

  const settingsButton = (
    <div class="flex items-center justify-center size-5 cursor-pointer">
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
        class="lucide lucide-settings"
      >
        <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </div>
  ) as HTMLDivElement;

  const settingsMenu = PlayerSettingsMenu();

  const miniPlayerbutton = (
    <div class="flex items-center justify-center size-5 cursor-pointer">
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
        class="lucide lucide-picture-in-picture"
      >
        <path d="M2 10h6V4" />
        <path d="m2 4 6 6" />
        <path d="M21 10V7a2 2 0 0 0-2-2h-7" />
        <path d="M3 14v2a2 2 0 0 0 2 2h3" />
        <rect x="12" y="14" width="10" height="7" rx="1" />
      </svg>
    </div>
  ) as HTMLDivElement;

  const fullscreenbutton = (
    <div class="flex items-center justify-center size-5 cursor-pointer">
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
        class="lucide lucide-maximize"
      >
        <path d="M8 3H5a2 2 0 0 0-2 2v3" />
        <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
        <path d="M3 16v3a2 2 0 0 0 2 2h3" />
        <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
      </svg>
    </div>
  ) as HTMLDivElement;

  const buttonRow = (
    <div class="bottom-0 h-12 p-2 flex items-center space-x-4">
      {playbutton}
      {skipBack}
      {skipForward}
      {volume}
      <div class="w-full" />
      {autoPlayToggle}
      {settingsButton}
      {miniPlayerbutton}
      {fullscreenbutton}
    </div>
  ) as HTMLDivElement;

  const controls = (
    <div class="absolute bottom-0 left-0 right-0 h-26 bg-gradient bg-gradient-to-t from-black to-transparent px-4 py-2 space-y-2 flex flex-col justify-around">
      {titleAndTime}
      {seekbar}
      {buttonRow}
    </div>
  ) as HTMLDivElement;

  // Assemble player
  player.appendChild(pageback);
  player.appendChild(video);
  player.appendChild(loading_indicator);
  player.appendChild(controls);
  player.appendChild(settingsMenu);

  // Event Listeners
  player.addEventListener("mousemove", handleMove);

  playbutton.addEventListener("click", handlePlayState);

  video.addEventListener("play", () => {
    playbutton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause"><rect x="14" y="3" width="5" height="18" rx="1"/><rect x="5" y="3" width="5" height="18" rx="1"/></svg>`;
  });

  video.addEventListener("pause", () => {
    playbutton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>`;
  });

  video.addEventListener("timeupdate", () => {
    const currentTime = video.currentTime || 0;
    const duration = video.duration || 0;
    time.textContent = `${new Date(currentTime * 1000).toISOString().substring(14, 19)} | ${new Date(duration * 1000).toISOString().substring(14, 19)}`;
  });

  video.addEventListener("click", () => {
    if (!isMobileDevice) return handlePlayState();

    if (touchtimeout) clearTimeout(touchtimeout);
    touchtimeout = setTimeout(() => (touched = false), 3000);

    if (!touched) return (touched = true);
    handlePlayState();
  });

  settingsButton.addEventListener("click", () => {
    settingsMenuState = !settingsMenuState;
    settingsMenu.setVisibility(settingsMenuState);
  });

  miniPlayerbutton.addEventListener("click", () => {
    if (!player.miniPlayerActive) {
      miniPlayerbutton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-picture-in-picture-2"><path d="M21 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h4"/><rect width="10" height="7" x="12" y="13" rx="2"/></svg>`;
      player.className =
        "absolute z-20 bottom-4 right-4 h-48 w-[calc(12rem*(16/9))] aspect-video bg-[#0c0c0c] rounded-lg overflow-hidden transition-all duration-300";
      player.miniPlayerActive = true;
    } else {
      miniPlayerbutton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-picture-in-picture"><path d="M2 10h6V4"/><path d="m2 4 6 6"/><path d="M21 10V7a2 2 0 0 0-2-2h-7"/><path d="M3 14v2a2 2 0 0 0 2 2h3"/><rect x="12" y="14" width="10" height="7" rx="1"/></svg>`;
      player.className =
        "absolute z-20 bottom-0 right-0 h-full w-full bg-[#0c0c0c] transition-all duration-300";
      player.miniPlayerActive = false;
    }
  });

  fullscreenbutton.addEventListener("click", () => {
    if (!fullscreenstate) {
      window.electronAPI?.enterFullscreen();
      fullscreenbutton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minimize"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>`;
      fullscreenstate = true;
      return;
    }
    window.electronAPI?.exitFullscreen();
    fullscreenbutton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>`;
    fullscreenstate = false;
  });

  video.addEventListener("loadedmetadata", async () => {
    canPlay = true;
    loading_indicator.remove();
    video.play();
    controls.classList.add("hidden");
    pageback.classList.add("hidden");

    const malId = episodeData.mal_id;
    const episodeNumber = episodeData.episode;
    const aniskip = await getSkipTimes(malId, episodeNumber);

    if (!aniskip.found) return;

    const chapters = aniskip.results.map((segment: SkipResult) => ({
      id: segment.skip_id,
      title: segment.skip_type,
      start: segment.interval.start_time,
      end: segment.interval.end_time,
    }));

    seekbar.updateChapters(chapters);
  });

  video.addEventListener("ended", () => {
    if (!autoPlayState) return;
    handleBeforeClose();
    player.remove();
    router.navigate(
      `/anime/episodes/sourcePanel?episode=${parseInt(episodeData.episode) + 1}`,
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

  // Initialize
  if (localStorage.getItem("autoPlay") === null) {
    localStorage.setItem("autoPlay", "true");
  }
  toggleAutoPlay();

  if (!query.streamurl) {
    console.error("Missing streamurl");
    return;
  }

  video.src = query.streamurl;

  // Load saved progress
  if (authService.getUser()) {
    const leftoffEntry = await API.getLeftoff({
      kitsu_id: parseInt(query.kitsu_id),
      ident: episodeData.episode,
    });
    if (leftoffEntry.length > 0) {
      video.currentTime = leftoffEntry[0].leftoff;
    }
  }
}
