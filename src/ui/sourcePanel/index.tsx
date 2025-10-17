import { h } from "../../lib/jsx/runtime";
import { createSignal, bind } from "../../lib/jsx/reactive";
import { router } from "../../lib/router/index";
import { Timer } from "../timer";
import { NumberInput } from "../numberInput";
import { cache } from "../../services/cache";

interface Episode {
  episode: string;
  mal_id?: number;
  anilist_id?: number;
  [key: string]: any;
}

interface Anime {
  id: string;
  title: {
    romaji: string;
    english?: string;
  };
  bannerImage?: string;
  trailer?: {
    thumbnail: string;
  };
  format?: string;
  [key: string]: any;
}

export function SourcePanel(
  anime: Anime,
  episodes: Episode[],
  initialIndex: number,
) {
  const [currentIndex, setCurrentIndex, subscribeIndex] =
    createSignal(initialIndex);
  const [autoSelect, setAutoSelect, subscribeAutoSelect] = createSignal(
    localStorage.getItem("autoSelect") !== "false",
  );

  let sourceElementList: HTMLDivElement;
  let insertSpace: HTMLDivElement;
  let episodePickerInput: ReturnType<typeof NumberInput>;

  // Helper functions
  function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  async function getLocalEpisode() {
    const local_media_path = localStorage.getItem("app_local_media_path");
    if (!local_media_path) {
      console.warn("Local media path not found");
      return;
    }

    const animeTitle = anime.title.romaji
      .replaceAll(" ", "-")
      .replaceAll(":", "")
      .replaceAll("'", "")
      .replaceAll('"', "");

    const animeDirContents = await window.electronAPI.getLocalMedia(
      `${local_media_path}${animeTitle}`,
    );

    if (!animeDirContents || animeDirContents.length === 0) {
      console.warn("No episodes found");
      return;
    }

    const episodeFile = animeDirContents.filter((file: any) => {
      const match = file.name.toLowerCase().match(/e(\d+)/);
      const matchAlt = file.name.toLowerCase().match(/ep(\d+)/);
      if (anime.format === "MOVIE") return true;
      if (match && parseInt(match[1]) === currentIndex() + 1) return true;
      if (matchAlt && parseInt(matchAlt[1]) === currentIndex() + 1) return true;
      return false;
    });

    if (episodeFile.length === 0) {
      console.warn("No episode found");
      return;
    }

    const metadata = await window.electronAPI.getLocalMediaMetadata(
      episodeFile[0].path,
    );

    return {
      ...episodeFile[0],
      ...metadata,
    };
  }

  function getCodecBadge(codec: string, type: "audio" | "video") {
    const classes =
      type === "audio"
        ? "px-2 py-1 text-xs text-white bg-red-400 rounded"
        : "px-2 py-1 text-xs text-white bg-blue-400 rounded";

    let text = "";
    if (type === "audio") {
      switch (codec) {
        case "aac":
          text = "AAC";
          break;
        case "flac":
          text = "FLAC";
          break;
        case "opus":
          text = "Opus";
          break;
      }
    } else {
      switch (codec) {
        case "h264":
          text = "AVC";
          break;
        case "h265":
          text = "HEVC";
          break;
        case "av1":
          text = "AV1";
          break;
      }
    }

    return <div class={classes}>{text}</div>;
  }

  function getBitDepthBadge(bitdepth: string) {
    const text = bitdepth === "8" ? "8 Bit" : bitdepth === "10" ? "10 Bit" : "";
    return (
      <div class="px-2 py-1 text-xs text-white bg-blue-500 rounded">{text}</div>
    );
  }

  function getQualityBadge(height: number) {
    let text = "";
    switch (height) {
      case 2160:
        text = "UHD";
        break;
      case 1080:
        text = "FHD";
        break;
      case 720:
        text = "HD";
        break;
    }
    return (
      <div class="px-2 py-1 text-xs text-white bg-lime-300 rounded">{text}</div>
    );
  }

  function getQualityBadgeFromString(quality: string) {
    let text = "";
    switch (quality) {
      case "2160p":
        text = "UHD";
        break;
      case "1080p":
        text = "FHD";
        break;
      case "720p":
        text = "HD";
        break;
    }
    return (
      <div class="absolute right-4 bottom-4 px-2 py-1 text-xs text-white bg-lime-300 rounded">
        {text}
      </div>
    );
  }

  function SkeletonLoader() {
    return (
      <div class="relative w-full h-28 p-4 outline-1 outline-[#1a1a1a] rounded-md cursor-pointer space-y-2 animate-pulse">
        <div class="mt-2 w-1/3 h-4 bg-[#1a1a1a] rounded-md" />
        <div class="w-2/3 h-4 bg-[#1a1a1a] rounded-md" />
        <div class="mt-2 w-1/4 h-4 bg-[#1a1a1a] rounded-md" />
      </div>
    );
  }

  async function loadSource() {
    sourceElementList.innerHTML = "";

    const extensions = await window.electronAPI.loadExtensions();
    let extensionsConfig = JSON.parse(
      localStorage.getItem("extensions.config") || "[]",
    );

    if (!extensionsConfig || extensions.length > extensionsConfig.length) {
      for (const extension of extensions) {
        if (
          extensionsConfig.findIndex(
            (config: any) => config.id === extension.github,
          ) !== -1
        )
          continue;
        extensionsConfig.push({
          id: extension.github,
          enabled: true,
        });
      }
      localStorage.setItem(
        "extensions.config",
        JSON.stringify(extensionsConfig),
      );
    }

    const activeExtensions = extensions.filter(
      (extension: any) =>
        extensionsConfig.find((config: any) => config.id === extension.github)
          ?.enabled,
    );

    let toLoad = activeExtensions.length + 1;
    let loaded = 0;
    let sources: Array<{ name: string; node: HTMLElement }> = [];
    let episodeSelected = false;
    let timerInterrupted = false;

    function updateLoaded(success: boolean) {
      if (success) {
        loaded += 1;
      } else {
        toLoad -= 1;
      }

      if (
        loaded === toLoad &&
        autoSelect() &&
        !episodeSelected &&
        !timerInterrupted
      ) {
        const timer = Timer("Episode auto selection", 3, () => {
          timerInterrupted = true;
        });
        insertSpace.appendChild(timer);
        timer.start();

        setTimeout(() => {
          if (!autoSelect() || episodeSelected || timerInterrupted) {
            return console.warn("Auto selection disabled");
          }

          const local = sources.find((source) => source.name === "local");
          if (local) {
            local.node.dispatchEvent(new Event("click"));
            return;
          }

          const filteredSources = sources.filter(
            (source) => source.name !== "local",
          );
          if (!filteredSources.length) {
            console.warn("No sources for auto selection");
            return;
          }
          filteredSources[0].node.dispatchEvent(new Event("click"));
        }, 3000);
      }
    }

    // Load local source
    const skeletonLocal = SkeletonLoader();
    sourceElementList.appendChild(skeletonLocal as HTMLElement);

    const local = await getLocalEpisode();
    (skeletonLocal as HTMLElement).remove();

    if (!local) {
      updateLoaded(false);
    } else {
      const localElement = (
        <div
          class="relative w-full h-28 p-4 bg-neutral-950 outline-1 outline-[#1a1a1a] rounded-md cursor-pointer space-y-2"
          onClick={() => {
            episodeSelected = true;
            router.navigate(
              `/player?streamurl=${encodeURIComponent(local.path)}&title=${encodeURIComponent(anime.title.romaji)}&episode=${JSON.stringify(episodes[currentIndex()])}&anilist_id=${anime.id}`,
            );
          }}
        >
          <div class="flex items-center space-x-2 text-white font-bold">
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
              class="lucide lucide-hard-drive size-5"
            >
              <line x1="22" x2="2" y1="12" y2="12" />
              <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
              <line x1="6" x2="6.01" y1="16" y2="16" />
              <line x1="10" x2="10.01" y1="16" y2="16" />
            </svg>
            <span>This Device</span>
          </div>
          <img
            src="./icons/icon.png"
            class="absolute right-4 top-4 w-4 h-4"
            title="Provided by this Device"
          />
          <div class="text-[#a2a2a2] text-xs">{local.name}</div>
          <div class="absolute left-4 bottom-4 text-[#f0f0f0] text-xs py-1 m-0">
            {formatBytes(local.size)}
          </div>
          <div class="absolute right-4 bottom-4 flex space-x-2">
            {getCodecBadge(local.audio_codec, "audio")}
            {getCodecBadge(local.video_codec, "video")}
            {getBitDepthBadge(local.bitdepth)}
            {getQualityBadge(local.height)}
          </div>
        </div>
      ) as HTMLDivElement;

      sourceElementList.appendChild(localElement);
      sources.push({ name: "local", node: localElement });
      updateLoaded(true);
    }

    // Load extension sources
    activeExtensions
      .filter((extension: any) => extension.type === "source")
      .forEach(async (source_extension: any) => {
        const imported_extension = await import(
          `${source_extension.path}/${source_extension.main}`
        );
        const SourceExtensionClass = new imported_extension.Extension(cache);

        const skeletonExt = SkeletonLoader();
        sourceElementList.appendChild(skeletonExt as HTMLElement);

        const source = await SourceExtensionClass.getProvider({
          romaji: anime.title.romaji,
          english: anime.title.english,
        });

        (skeletonExt as HTMLElement).remove();

        if (!source) {
          updateLoaded(false);
          return;
        }

        source.hosters.forEach(async (source_hoster: any) => {
          const extensionIndex = activeExtensions.findIndex(
            (extension_hoster: any) =>
              extension_hoster.type === "stream" &&
              extension_hoster.name === source_hoster.label,
          );

          if (extensionIndex === -1) {
            updateLoaded(false);
            return;
          }

          const skeletonHoster = SkeletonLoader();
          sourceElementList.appendChild(skeletonHoster as HTMLElement);

          const imported_stream_extension = await import(
            `${activeExtensions[extensionIndex].path}/${activeExtensions[extensionIndex].main}`
          );
          const StreamExtensionClass = new imported_stream_extension.Extension(
            cache,
          );

          const source_episode = await SourceExtensionClass.getEpisode(
            source_hoster,
            episodes[currentIndex()],
          );

          if (!source_episode) {
            (skeletonHoster as HTMLElement).remove();
            return;
          }

          const stream = await StreamExtensionClass.getMetadata(source_episode);
          (skeletonHoster as HTMLElement).remove();

          if (!stream) {
            updateLoaded(false);
            return;
          }

          const hosterElement = (
            <div
              class="relative w-full h-28 p-4 bg-neutral-950 outline-1 outline-[#1a1a1a] rounded-md cursor-pointer space-y-2"
              onClick={() => {
                episodeSelected = true;
                router.navigate(
                  `/player?streamurl=${encodeURIComponent(stream.mp4)}&title=${encodeURIComponent(anime.title.romaji)}&episode=${JSON.stringify(episodes[currentIndex()])}&anilist_id=${anime.id}`,
                );
              }}
            >
              <div class="flex items-center space-x-2 text-white font-bold">
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
                  class="lucide lucide-airplay size-5"
                >
                  <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
                  <path d="m12 15 5 6H7Z" />
                </svg>
                <span>{source_hoster.label}</span>
              </div>
              <img
                src={`${source_extension.path}\\icon.png`}
                class="absolute right-4 top-4 w-4 h-4"
                title={`Provided by ${source_extension.name}`}
              />
              <div class="text-[#a2a2a2] text-xs">{stream.name}</div>
              <div class="absolute left-4 bottom-4 text-[#f0f0f0] text-xs py-1 m-0">
                {stream.size}
              </div>
              {getQualityBadgeFromString(stream.quality)}
            </div>
          ) as HTMLDivElement;

          sourceElementList.appendChild(hosterElement);
          sources.push({ name: source_hoster.label, node: hosterElement });
          updateLoaded(true);
        });
      });
  }

  // Subscribe to index changes to reload sources
  subscribeIndex(() => {
    loadSource();
  });

  // Subscribe to autoSelect changes
  subscribeAutoSelect((value) => {
    localStorage.setItem("autoSelect", String(value));
  });

  const container = (
    <div class="fixed inset-0 p-4 flex items-center justify-center backdrop-brightness-50 backdrop-blur-md">
      <div class="relative w-full max-w-4xl h-2/3 p-4 pt-8 space-y-4 overflow-y-scroll bg-[#080808] rounded-xl">
        {/* Close Button */}
        <div
          class="absolute z-10 top-2 right-4 size-8 flex items-center justify-center cursor-pointer"
          onClick={() => {
            router.removeRoute("/anime/episodes/sourcePanel");
            (container as HTMLElement).remove();
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
            class="lucide lucide-x"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </div>

        {/* Banner */}
        <img
          class="absolute top-0 left-0 right-0 w-full h-32 object-cover brightness-50 mask-b-from-50% bg-[#080808]"
          src={anime.bannerImage || anime.trailer?.thumbnail}
        />

        {/* Anime Name */}
        <div class="relative text-2xl font-semibold text-white">
          {anime.title.romaji}
        </div>

        {/* Episode Picker */}
        <div class="relative h-fit w-full space-y-2">
          <div class="text-base text-white">Episode</div>
          {(() => {
            episodePickerInput = NumberInput();
            episodePickerInput.field.min = "1";
            episodePickerInput.field.max = String(episodes.length);
            episodePickerInput.field.value = String(currentIndex() + 1);

            episodePickerInput.field.addEventListener("input", () => {
              const value = parseInt(episodePickerInput.field.value);

              if (value > episodes.length) {
                episodePickerInput.field.value = String(episodes.length);
              }
              if (value < 1) {
                episodePickerInput.field.value = "1";
              }
              if (isNaN(value) || value < 1 || value > episodes.length) return;

              setCurrentIndex(value - 1);
            });

            router.route("/anime/episodes/sourcePanel", (query: any) => {
              episodePickerInput.field.value = query.episode;
              episodePickerInput.field.dispatchEvent(new Event("input"));
            });

            return episodePickerInput;
          })()}
        </div>

        {/* Button Row */}
        <div class="flex space-x-2">
          <div
            class="size-8 grid place-items-center outline-1 outline-[#1a1a1a] rounded-md cursor-pointer"
            onClick={async () => {
              const local_media_path = localStorage.getItem(
                "app_local_media_path",
              );
              if (!local_media_path) {
                console.warn("Local media path not found");
                return;
              }
              const animeTitle = anime.title.romaji
                .replaceAll(" ", "-")
                .replaceAll(":", "")
                .replaceAll("'", "")
                .replaceAll('"', "");
              window.electronAPI.createLocalMediaDir(
                `${local_media_path}${animeTitle}`,
              );
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
              class="lucide lucide-folder-cog size-5"
            >
              <path d="M10.3 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.98a2 2 0 0 1 1.69.9l.66 1.2A2 2 0 0 0 12 6h8a2 2 0 0 1 2 2v3.3" />
              <path d="m14.305 19.53.923-.382" />
              <path d="m15.228 16.852-.923-.383" />
              <path d="m16.852 15.228-.383-.923" />
              <path d="m16.852 20.772-.383.924" />
              <path d="m19.148 15.228.383-.923" />
              <path d="m19.53 21.696-.382-.924" />
              <path d="m20.772 16.852.924-.383" />
              <path d="m20.772 19.148.924.383" />
              <circle cx="18" cy="18" r="3" />
            </svg>
          </div>

          {/* Auto Select Toggle */}
          {bind([autoSelect, setAutoSelect, subscribeAutoSelect], (isAuto) => (
            <div
              class={
                isAuto
                  ? "px-2 py-1 bg-white text-black rounded-md cursor-pointer"
                  : "px-2 py-1 bg-black text-white outline-1 outline-[#1a1a1a] rounded-md cursor-pointer"
              }
              onClick={() => setAutoSelect(!isAuto)}
            >
              AUTO
            </div>
          ))}
        </div>

        {/* Insert Space for Timer */}
        <div
          class="w-full h-fit space-y-2"
          ref={(el) => (insertSpace = el as HTMLDivElement)}
        />

        {/* Source List */}
        <div
          class="w-full h-fit space-y-2"
          ref={(el) => {
            sourceElementList = el as HTMLDivElement;
            loadSource();
          }}
        />
      </div>
    </div>
  ) as HTMLDivElement;

  return container;
}
