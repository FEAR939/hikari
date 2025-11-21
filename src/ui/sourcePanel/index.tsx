import { h } from "../../lib/jsx/runtime";
import { createSignal, bind } from "../../lib/jsx/reactive";
import { router } from "../../lib/router/index";
import { Timer } from "../timer";
import { NumberInput } from "../numberInput";
import { cache } from "../../services/cache";
import { kitsu, KitsuAnime, KitsuEpisode } from "../../lib/kitsu";
import { Tooltip } from "../Tooltip";
import { Toggle } from "@ui/toggle";

interface Episode {
  episode: string;
  mal_id?: number;
  kitsu_id?: number;
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

export function SourcePanel({
  anime,
  initialIndex,
}: {
  anime: KitsuAnime;
  initialIndex: number;
}) {
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

  async function sanitizeTitle(title: string) {
    return title
      .replaceAll(" ", "-")
      .replaceAll(":", "")
      .replaceAll("'", "")
      .replaceAll('"', "");
  }

  async function getLocalEpisode() {
    const local_media_path = localStorage.getItem("app_local_media_path");
    if (!local_media_path) {
      console.warn("Local media path not found");
      return;
    }

    const animeTitles = [
      await sanitizeTitle(anime.attributes.titles.en || ""),
      await sanitizeTitle(anime.attributes.titles.en_us || ""),
      await sanitizeTitle(anime.attributes.titles.en_jp || ""),
      await sanitizeTitle(anime.attributes.titles.en_cn || ""),
    ].filter((title) => title !== "");

    console.log(animeTitles);

    const animeDirContents = await window.electronAPI.getLocalMedia(
      local_media_path,
      animeTitles,
    );

    if (!animeDirContents || animeDirContents.length === 0) {
      console.warn("No episodes found");
      return;
    }

    const episodeFile = animeDirContents.filter((file: any) => {
      const match = file.name.toLowerCase().match(/e(\d+)/);
      const matchAlt = file.name.toLowerCase().match(/ep(\d+)/);
      if (anime.attributes.showType === "MOVIE") return true;
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
        ? "px-3 py-1 w-fit text-xs bg-[#333333] text-white rounded-full"
        : "px-3 py-1 w-fit text-xs bg-[#333333] text-white rounded-full";

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
        case "ac3":
          text = "AC3";
          break;
      }
    } else {
      switch (codec) {
        case "h264":
          text = "H.264";
          break;
        case "h265":
        case "hevc":
          text = "H.265";
          break;
        case "av1":
          text = "AV1";
          break;
      }
    }

    return text ? <div class={classes}>{text}</div> : null;
  }

  function getBitDepthBadge(bitdepth: string) {
    const text = bitdepth === "8" ? "8 Bit" : bitdepth === "10" ? "10 Bit" : "";
    return text ? (
      <div class="px-3 py-1 w-fit text-xs bg-[#333333] text-white rounded-full">
        {text}
      </div>
    ) : null;
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
    return text ? (
      <div class="px-3 py-1 w-fit text-xs bg-[#333333] text-white rounded-full">
        {text}
      </div>
    ) : null;
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
    return text ? (
      <div class="px-3 py-1 w-fit text-xs bg-[#333333] text-white rounded-full">
        {text}
      </div>
    ) : null;
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

  let inputTitle: HTMLDivElement;

  async function loadSource() {
    const episodePageIndex = Math.floor(currentIndex() / 16);

    console.log(episodePageIndex);

    const episodes = (
      await kitsu.getEpisodesPagination(anime.id, episodePageIndex, 16)
    ).map((episode) => {
      // For compatibility with the extensions
      return {
        ...episode,
        episode: episode.attributes.number,
      };
    });

    console.log(episodes);

    let relativeEpisodeIndex = episodes[currentIndex() - episodePageIndex * 16];
    console.log(relativeEpisodeIndex);
    inputTitle.textContent = `${relativeEpisodeIndex.attributes.titles.en || relativeEpisodeIndex.attributes.titles.en_us || relativeEpisodeIndex.attributes.titles.en_jp || relativeEpisodeIndex.attributes.titles.en_cn || "No Title available"}`;

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

    console.log("Active Extensions:", activeExtensions);

    let toLoad =
      extensions.filter(
        (extension: any) =>
          extensionsConfig.find(
            (config: any) =>
              config.id === extension.github && extension.type === "source",
          )?.enabled,
      ).length + 1;
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

      console.log(`Extension Loading Progress: ${loaded} of ${toLoad}`);

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
      let currEpisode = currentIndex();
      const localElement = (
        <div
          class="relative w-full h-28 p-4 bg-[#1d1d1d] border border-[#222222] rounded-2xl cursor-pointer space-y-2"
          onClick={() => {
            episodeSelected = true;
            router.navigate(
              `/player?streamurl=${encodeURIComponent(local.path)}&title=${encodeURIComponent(anime.attributes.titles.en_jp)}&episode=${JSON.stringify(episodes.find((episode) => episode.attributes.number === currentIndex() + 1))}&kitsu_id=${anime.id}&chapters=${JSON.stringify(local.chapters)}`,
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
          <div class="absolute right-4 top-4">
            <Tooltip content="Provided by this Device">
              <img src="./icons/icon.png" class="size-6 rounded-full" />
            </Tooltip>
          </div>
          <div class="text-neutral-500 text-xs">{local.name}</div>
          <div class="absolute left-4 bottom-4 text-neutral-500 text-xs py-1 m-0">
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

      if (currEpisode !== currentIndex()) return;

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

        let currEpisode = currentIndex();

        const skeletonExt = SkeletonLoader();
        sourceElementList.appendChild(skeletonExt as HTMLElement);

        const source = await SourceExtensionClass.getProvider({
          romaji: anime.attributes.titles.en_jp,
          english: anime.attributes.titles.en,
        });

        (skeletonExt as HTMLElement).remove();

        if (!source) {
          updateLoaded(false);
          return;
        }

        toLoad += source.hosters.length;

        updateLoaded(true);

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
              class="relative w-full h-28 p-4 bg-[#1d1d1d] border border-[#222222] rounded-2xl cursor-pointer space-y-2"
              onClick={() => {
                episodeSelected = true;
                router.navigate(
                  `/player?streamurl=${encodeURIComponent(stream.mp4)}&headers=${encodeURIComponent(JSON.stringify(stream.headers || {}))}&title=${encodeURIComponent(anime.attributes.titles.en_jp)}&episode=${JSON.stringify(episodes.find((episode) => episode.attributes.number === currentIndex() + 1))}&kitsu_id=${anime.id}`,
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
              <div class="absolute right-4 top-4">
                <Tooltip content={`Provided by ${source_extension.name}`}>
                  <img
                    src={`${source_extension.path}\\icon.png`}
                    class="size-6 rounded-full"
                  />
                </Tooltip>
              </div>

              <div class="text-neutral-500 text-xs">{stream.name}</div>
              <div class="absolute left-4 bottom-4 text-neutral-500 text-xs py-1 m-0">
                {stream.size}
              </div>
              <div class="absolute right-4 bottom-4 flex space-x-2">
                {getQualityBadgeFromString(stream.quality)}
              </div>
            </div>
          ) as HTMLDivElement;

          if (currEpisode !== currentIndex()) return;

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
  subscribeAutoSelect(() => {
    localStorage.setItem("autoSelect", String(autoSelect()));
  });

  let panel: HTMLDivElement;
  const [settingsState, setSettingsState, subscribeSettingsState] =
    createSignal(false);

  const container = (
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center transition-all duration-150 ease-in-out opacity-0">
      <div
        class="relative max-w-full w-[70rem] aspect-video p-6 space-y-4 overflow-y-scroll bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl transition-all duration-150 ease-in-out scale-75"
        ref={(el: HTMLDivElement) => (panel = el)}
      >
        {/* Close Button */}
        <div
          class="absolute z-10 top-4 right-4 size-8 flex items-center justify-center text-neutral-200 cursor-pointer"
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
          class="absolute top-0 left-0 right-0 min-w-full w-fit h-48 object-cover brightness-50 mask-b-from-50% bg-[#080808]"
          src={
            anime.attributes.coverImage?.original ||
            anime.attributes.posterImage?.original
          }
        />

        {/* Anime Name */}
        <div class="relative text-2xl font-semibold text-white">
          {anime.attributes.titles.en ||
            anime.attributes.titles.en_us ||
            anime.attributes.titles.en_jp ||
            anime.attributes.titles.en_cn}
        </div>

        {/* Input Row */}
        <div class="relative flex items-end gap-2 h-fit w-full mt-24">
          <div class="w-full space-y-1">
            <div class="text-base text-white">Episode</div>
            {(() => {
              episodePickerInput = NumberInput();
              episodePickerInput.input.min = "1";
              episodePickerInput.input.max = String(
                anime.attributes.episodeCount,
              );
              episodePickerInput.input.value = String(currentIndex() + 1);

              episodePickerInput.input.addEventListener("input", () => {
                const value = parseInt(episodePickerInput.input.value);
                if (value > anime.attributes.episodeCount!) {
                  episodePickerInput.input.value = String(
                    anime.attributes.episodeCount!,
                  );
                }
                if (value < 1) {
                  episodePickerInput.input.value = "1";
                }
                if (
                  isNaN(value) ||
                  value < 1 ||
                  value > anime.attributes.episodeCount!
                )
                  return;

                setCurrentIndex(value - 1);
              });

              inputTitle = episodePickerInput.titlefield;

              router.route("/anime/episodes/sourcePanel", (query: any) => {
                episodePickerInput.input.value = query.episode;
                episodePickerInput.input.dispatchEvent(new Event("input"));
              });

              return episodePickerInput;
            })()}
          </div>

          {/* Settings */}
          <div class="relative size-8 ml-auto">
            <div
              class="size-8 bg-[#1d1d1d] hover:bg-[#333333] border border-[#222222] flex items-center justify-center rounded-full transition-colors duration-150 cursor-pointer"
              onClick={() => setSettingsState(!settingsState())}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="size-4"
              >
                <path
                  d="M12.0005 15C13.6573 15 15.0005 13.6569 15.0005 12C15.0005 10.3431 13.6573 9 12.0005 9C10.3436 9 9.00049 10.3431 9.00049 12C9.00049 13.6569 10.3436 15 12.0005 15Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M9.28957 19.3711L9.87402 20.6856C10.0478 21.0768 10.3313 21.4093 10.6902 21.6426C11.0492 21.8759 11.4681 22.0001 11.8962 22C12.3244 22.0001 12.7433 21.8759 13.1022 21.6426C13.4612 21.4093 13.7447 21.0768 13.9185 20.6856L14.5029 19.3711C14.711 18.9047 15.0609 18.5159 15.5029 18.26C15.9477 18.0034 16.4622 17.8941 16.9729 17.9478L18.4029 18.1C18.8286 18.145 19.2582 18.0656 19.6396 17.8713C20.021 17.6771 20.3379 17.3763 20.5518 17.0056C20.766 16.635 20.868 16.2103 20.8455 15.7829C20.823 15.3555 20.677 14.9438 20.4251 14.5978L19.5785 13.4344C19.277 13.0171 19.1159 12.5148 19.1185 12C19.1184 11.4866 19.281 10.9864 19.5829 10.5711L20.4296 9.40778C20.6814 9.06175 20.8275 8.65007 20.85 8.22267C20.8725 7.79528 20.7704 7.37054 20.5562 7C20.3423 6.62923 20.0255 6.32849 19.644 6.13423C19.2626 5.93997 18.833 5.86053 18.4074 5.90556L16.9774 6.05778C16.4667 6.11141 15.9521 6.00212 15.5074 5.74556C15.0645 5.48825 14.7144 5.09736 14.5074 4.62889L13.9185 3.31444C13.7447 2.92317 13.4612 2.59072 13.1022 2.3574C12.7433 2.12408 12.3244 1.99993 11.8962 2C11.4681 1.99993 11.0492 2.12408 10.6902 2.3574C10.3313 2.59072 10.0478 2.92317 9.87402 3.31444L9.28957 4.62889C9.0825 5.09736 8.73245 5.48825 8.28957 5.74556C7.84479 6.00212 7.33024 6.11141 6.81957 6.05778L5.38513 5.90556C4.95946 5.86053 4.52987 5.93997 4.14844 6.13423C3.76702 6.32849 3.45014 6.62923 3.23624 7C3.02206 7.37054 2.92002 7.79528 2.94251 8.22267C2.96499 8.65007 3.11103 9.06175 3.36291 9.40778L4.20957 10.5711C4.51151 10.9864 4.67411 11.4866 4.67402 12C4.67411 12.5134 4.51151 13.0137 4.20957 13.4289L3.36291 14.5922C3.11103 14.9382 2.96499 15.3499 2.94251 15.7773C2.92002 16.2047 3.02206 16.6295 3.23624 17C3.45036 17.3706 3.76727 17.6712 4.14864 17.8654C4.53001 18.0596 4.95949 18.1392 5.38513 18.0944L6.81513 17.9422C7.3258 17.8886 7.84034 17.9979 8.28513 18.2544C8.72966 18.511 9.08134 18.902 9.28957 19.3711Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div
              class="absolute z-30 top-10 right-0 h-fit w-64 p-4 bg-[#1d1d1d] border border-[#222222] rounded-2xl space-y-2 hidden"
              ref={(el: HTMLElement) => {
                subscribeSettingsState(() => {
                  settingsState()
                    ? el.classList.remove("hidden")
                    : el.classList.add("hidden");
                });
              }}
            >
              <div class="h-fit w-full flex items-center justify-between">
                <span class="text-sm">Create local directory</span>
                <div
                  class="py-0.5 px-2 bg-neutral-200 hover:bg-neutral-400 text-sm text-black rounded cursor-pointer transition-colors duration-150"
                  onClick={async () => {
                    const local_media_path = localStorage.getItem(
                      "app_local_media_path",
                    );
                    if (!local_media_path) {
                      console.warn("Local media path not found");
                      return;
                    }
                    const animeTitles = [
                      await sanitizeTitle(anime.attributes.titles.en || ""),
                      await sanitizeTitle(anime.attributes.titles.en_us || ""),
                      await sanitizeTitle(anime.attributes.titles.en_jp || ""),
                      await sanitizeTitle(anime.attributes.titles.en_cn || ""),
                    ].filter((title) => title !== "");

                    window.electronAPI?.createLocalMediaDir(
                      `${local_media_path}${animeTitles[0]}`,
                    );
                  }}
                >
                  Create
                </div>
              </div>
              <div class="h-fit w-full flex items-center justify-between">
                <span class="text-sm">Auto Source Selection</span>
                <Toggle
                  initial={autoSelect()}
                  callback={(state: boolean) => {
                    setAutoSelect(state);
                  }}
                ></Toggle>
              </div>
            </div>
          </div>
        </div>

        {/* Insert Space for Timer */}
        <div
          class="w-full h-fit space-y-2"
          ref={(el) => (insertSpace = el as HTMLDivElement)}
        />

        {/* Source List */}
        <div
          class="w-full h-fit grid grid-cols-2 gap-4"
          ref={(el) => {
            sourceElementList = el as HTMLDivElement;
            loadSource();
          }}
        />
      </div>
    </div>
  ) as HTMLDivElement;

  container.getPanel = () => panel;

  return container;
}
