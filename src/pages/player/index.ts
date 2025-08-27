import { getBundle } from "../../lib/animetoast";
import { getEpisodeLink } from "../../lib/animetoast";
import { getAnimeChapters } from "../../lib/aniskip";
import { extract_voe_url } from "../../lib/voe/index";

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
    "absolute z-10 top-2 left-4 size-8 flex items-center justify-center";
  pageback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left-short size-8" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"/>
  </svg>`;

  player.appendChild(pageback);

  pageback.addEventListener("click", () => {
    player.remove();
  });

  const isMobileDevice = /Mobi/i.test(window.navigator.userAgent);

  const video = document.createElement("video");
  video.className = "h-full w-full";

  player.appendChild(video);

  const controls = document.createElement("div");
  controls.className =
    "absolute bottom-0 left-0 right-0 h-24 bg-black bg-opacity-50 p-4 space-y-1";

  player.appendChild(controls);

  let timeout: NodeJS.Timeout | null = null;
  let canPlay = false;

  video.addEventListener("canplay", () => {
    canPlay = true;
    video.play();
    controls.classList.add("hidden");
    pageback.classList.add("hidden");
  });

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
  title.className = "text-white text-sm font-bold";
  title.textContent = "Episode title";

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

  video.addEventListener("loadedmetadata", async () => {
    const chapters = await getAnimeChapters(
      parseInt(query.mal_id),
      parseInt(query.episodeNumber),
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

  seekbar.appendChild(seekbarbufferProgress);
  seekbar.appendChild(seekbarProgress);
  seekbar.appendChild(seekbarChapters);

  controls.appendChild(seekbar);

  const buttonRow = document.createElement("div");
  buttonRow.className = "flex items-center space-x-2";

  const playbutton = document.createElement("div");
  playbutton.className = "size-6";
  playbutton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause size-6" viewBox="0 0 16 16">
    <path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5"/>
  </svg>`;

  buttonRow.appendChild(playbutton);

  function handlePlayState() {
    if (video.paused) {
      video.play();
      playbutton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause size-6" viewBox="0 0 16 16">
        <path d="M6 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5m4 0a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5"/>
      </svg>`;
    } else {
      video.pause();
      playbutton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play size-6" viewBox="0 0 16 16">
        <path d="M10.804 8 5 4.633v6.734zm.792-.696a.802.802 0 0 1 0 1.392l-6.363 3.692C4.713 12.69 4 12.345 4 11.692V4.308c0-.653.713-.998 1.233-.696z"/>
      </svg>`;
    }
  }

  playbutton.addEventListener("click", handlePlayState);

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
  fullscreenbutton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-fullscreen size-5" viewBox="0 0 16 16">
    <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5M.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5m15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5"/>
  </svg>`;

  buttonRow.appendChild(fullscreenbutton);

  let fullscreenstate = false;

  fullscreenbutton.addEventListener("click", () => {
    console.log("fullscreenbutton clicked");
    if (!fullscreenstate) {
      window.electronAPI?.enterFullscreen();
      fullscreenstate = true;
      return;
    }

    window.electronAPI?.exitFullscreen();
    fullscreenstate = false;
  });

  controls.appendChild(buttonRow);

  let link = "";

  if (query.isBundle === "true") {
    const bundle = await getBundle(query.url);

    if (!bundle) return console.warn("No bundle found");

    const episode = bundle.find(
      (sourceEpisode) =>
        sourceEpisode.label.replace("Ep. ", "") == query.bundleEpisodeNumber,
    );

    if (!episode) return console.warn("No episode found");

    link = (await getEpisodeLink(episode.url)) || "";
  } else {
    link = (await getEpisodeLink(query.url)) || "";
  }

  if (!link) return console.warn("No link found");

  console.log("INFO: stream url -> ", link);

  const stream_link = await extract_voe_url(link);

  video.src = stream_link?.mp4;
}
