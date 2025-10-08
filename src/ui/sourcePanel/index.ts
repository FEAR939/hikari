import { getProvider, getEpisode } from "../../lib/animetoast";
import { getMetadata } from "../../lib/voe";
import { router } from "../../lib/router/index";
import { Timer } from "../../ui/timer";
import { NumberInput } from "../numberInput";

export function SourcePanel(anime, episodes, index) {
  const container = document.createElement("div");
  container.className =
    "fixed inset-0 p-4 flex items-center justify-center backdrop-brightness-50 backdrop-blur-md";

  const panel = document.createElement("div");
  panel.className =
    "relative w-full max-w-4xl h-2/3 p-4 pt-8 space-y-4 overflow-y-scroll bg-[#080808] rounded-xl";

  container.appendChild(panel);

  const containerClose = document.createElement("div");
  containerClose.className =
    "absolute z-10 top-2 right-4 size-8 flex items-center justify-center cursor-pointer";
  containerClose.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

  panel.appendChild(containerClose);

  containerClose.addEventListener("click", () => {
    router.removeRoute("/anime/episodes/sourcePanel");
    container.remove();
  });

  const animeBanner = document.createElement("img");
  animeBanner.className =
    "absolute top-0 left-0 right-0 w-full h-32 object-cover brightness-50 mask-b-from-50% bg-[#080808]";
  animeBanner.src = anime.bannerImage || anime.trailer.thumbnail;

  panel.appendChild(animeBanner);

  const animeName = document.createElement("div");
  animeName.className = "relative text-2xl font-semibold text-white";
  animeName.textContent = anime.title.romaji;

  panel.appendChild(animeName);

  const episodePicker = document.createElement("div");
  episodePicker.className = "relative h-fit w-full space-y-2";

  panel.appendChild(episodePicker);

  const episodePickerLabel = document.createElement("div");
  episodePickerLabel.className = "text-base text-white";
  episodePickerLabel.textContent = "Episode";

  episodePicker.appendChild(episodePickerLabel);

  const episodePickerInput = NumberInput();
  episodePickerInput.field.min = "1";
  episodePickerInput.field.max = episodes.length;
  episodePickerInput.field.value = (index + 1).toString();

  episodePicker.appendChild(episodePickerInput);

  episodePickerInput.field.addEventListener("input", () => {
    const value = parseInt(episodePickerInput.field.value);

    // check if number is below or equal to max
    if (value > episodes.length) {
      episodePickerInput.field.value = episodes.length.toString();
    }

    // check if number is above or equal to min
    if (value < 1) {
      episodePickerInput.field.value = "1";
    }

    if (isNaN(value) || value < 1 || value > episodes.length) return;

    index = value - 1;

    loadSource();
  });

  router.route("/anime/episodes/sourcePanel", (query) => {
    episodePickerInput.field.value = query.episode;
    episodePickerInput.dispatchEvent(new Event("input"));
  });

  console.log(episodes, index);

  const buttonRow = document.createElement("div");
  buttonRow.className = "flex space-x-2";

  panel.appendChild(buttonRow);

  const localSetup = document.createElement("div");
  localSetup.className =
    "size-8 grid place-items-center outline-1 outline-[#1a1a1a] rounded-md cursor-pointer";
  localSetup.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-cog-icon lucide-folder-cog size-5"><path d="M10.3 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.98a2 2 0 0 1 1.69.9l.66 1.2A2 2 0 0 0 12 6h8a2 2 0 0 1 2 2v3.3"/><path d="m14.305 19.53.923-.382"/><path d="m15.228 16.852-.923-.383"/><path d="m16.852 15.228-.383-.923"/><path d="m16.852 20.772-.383.924"/><path d="m19.148 15.228.383-.923"/><path d="m19.53 21.696-.382-.924"/><path d="m20.772 16.852.924-.383"/><path d="m20.772 19.148.924.383"/><circle cx="18" cy="18" r="3"/></svg>`;

  buttonRow.appendChild(localSetup);

  localSetup.addEventListener("click", async () => {
    const dirHandle = await window.showDirectoryPicker();

    if (!dirHandle) return;

    const animeTitle = anime.title.romaji
      .replaceAll(" ", "-")
      .replaceAll(":", "")
      .replaceAll("'", "")
      .replaceAll('"', "");

    dirHandle.getDirectoryHandle(animeTitle, { create: true });
  });

  if (localStorage.getItem("autoSelect") === null) {
    localStorage.setItem("autoSelect", "false");
  }

  let autoSelect = localStorage.getItem("autoSelect") === "true";

  const autoSelectToggle = document.createElement("div");
  autoSelectToggle.textContent = "AUTO";

  buttonRow.appendChild(autoSelectToggle);

  function toggleAutoSelect() {
    if (autoSelect) {
      autoSelectToggle.className = "px-2 py-1 bg-white text-black rounded-md";
    } else {
      autoSelectToggle.className =
        "px-2 py-1 bg-black text-white outline-1 outline-[#1a1a1a] rounded-md";
    }
  }

  toggleAutoSelect();

  autoSelectToggle.addEventListener("click", () => {
    autoSelect = !autoSelect;
    localStorage.setItem("autoSelect", autoSelect.toString());
    toggleAutoSelect();
  });

  const insertSpace = document.createElement("div");
  insertSpace.className = "w-full h-fit space-y-2";

  panel.appendChild(insertSpace);

  const extensions = {
    source: [
      {
        name: "AnimeToast",
        icon: "https://www.animetoast.cc/wp-content/uploads/2018/03/toastfavi-72x72.png",
      },
    ],
    stream: [
      {
        name: "Voe",
      },
    ],
  };

  const sourceElementList = document.createElement("div");
  sourceElementList.className = "w-full h-fit space-y-2";

  panel.appendChild(sourceElementList);

  loadSource();

  async function getLocalEpisode() {
    const animeDirContents = await window.electronAPI.getLocalMedia(
      `F:\\Anime\\${anime.title.romaji
        .replaceAll(" ", "-")
        .replaceAll(":", "")
        .replaceAll("'", "")
        .replaceAll('"', "")}`,
    );

    if (!animeDirContents) {
      console.warn("Anime directory not found");
      return;
    }

    if (animeDirContents.length === 0) {
      console.warn("No episodes found");
      return;
    }

    const episodeFile = animeDirContents.filter((file) => {
      const match = file.name.toLowerCase().match(/e(\d+)/);
      const matchAlt = file.name.toLowerCase().match(/ep(\d+)/);

      if (anime.format === "MOVIE") return true;

      if (
        match &&
        parseInt(match[1]) === episodePickerInput.field.valueAsNumber
      )
        return true;

      if (
        matchAlt &&
        parseInt(matchAlt[1]) === episodePickerInput.field.valueAsNumber
      )
        return true;

      return false;
    });

    if (episodeFile.length === 0) {
      console.warn("No episode found");
      return;
    }

    console.log(episodeFile);
    return episodeFile[0];
  }

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  async function loadSource() {
    sourceElementList.innerHTML = "";

    let toLoad = extensions.source.length + 1;
    console.log(`Loading ${toLoad} sources`);
    let loaded = 0;
    let sources = [];
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
        autoSelect &&
        !episodeSelected &&
        !timerInterrupted
      ) {
        const timer = Timer("Episode auto selection", 3, () => {
          timerInterrupted = true;
        });
        insertSpace.appendChild(timer);
        timer.start();

        setTimeout(() => {
          if (!autoSelect || episodeSelected || timerInterrupted)
            return console.warn("Auto selection disabled");

          const local = sources.find((source) => source.name === "local"); // preferred

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

    const skeletonElement = document.createElement("div");
    skeletonElement.className =
      "relative w-full h-28 p-4 outline-1 outline-[#1a1a1a] rounded-md cursor-pointer space-y-2 animate-pulse";
    skeletonElement.innerHTML = `
      <div class="mt-2 w-1/3 h-4 bg-[#1a1a1a] rounded-md"></div>
      <div class="w-2/3 h-4 bg-[#1a1a1a] rounded-md"></div>
      <div class="mt-2 w-1/4 h-4 bg-[#1a1a1a] rounded-md"></div>
    `;
    sourceElementList.appendChild(skeletonElement);
    let local = false;
    try {
      local = await getLocalEpisode();
    } catch (error) {
      console.error("Error fetching local episode:", error);
    }

    if (!local) {
      skeletonElement.remove();
      updateLoaded(false);
    } else {
      skeletonElement.remove();
      const hosterElement = document.createElement("div");
      hosterElement.className =
        "relative w-full h-28 p-4 outline-1 outline-[#1a1a1a] rounded-md cursor-pointer space-y-2";

      sourceElementList.appendChild(hosterElement);

      const hosterTitle = document.createElement("div");
      hosterTitle.className =
        "flex items-center space-x-2 text-white font-bold";
      hosterTitle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hard-drive-icon lucide-hard-drive"><line x1="22" x2="2" y1="12" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" x2="6.01" y1="16" y2="16"/><line x1="10" x2="10.01" y1="16" y2="16"/></svg>
    <span>Local Media</span>`;

      hosterElement.appendChild(hosterTitle);

      const extensionIcon = document.createElement("img");
      extensionIcon.src = "./icons/icon.png";
      extensionIcon.className = "absolute right-4 top-4 w-4 h-4";
      extensionIcon.title = `Provided by Local Media`;

      hosterElement.appendChild(extensionIcon);

      const hosterFileName = document.createElement("div");
      hosterFileName.className = "text-[#a2a2a2] text-xs";
      hosterFileName.textContent = local.name;

      hosterElement.appendChild(hosterFileName);

      const hosterSize = document.createElement("div");
      hosterSize.className =
        "absolute left-4 bottom-4 text-[#f0f0f0] text-xs py-1 m-0";
      hosterSize.textContent = formatBytes(local.size);

      hosterElement.appendChild(hosterSize);

      hosterElement.addEventListener("click", () => {
        episodeSelected = true;

        router.navigate(
          `/player?streamurl=${encodeURIComponent(local.path)}&title=${encodeURIComponent(anime.title.romaji)}&episode=${JSON.stringify(episodes[index])}&anilist_id=${anime.id}`,
        );
      });

      sources.push({
        name: "local",
        node: hosterElement,
      });
      updateLoaded(true);
    }

    extensions.source.map(async (source_extension) => {
      const skeletonElement = document.createElement("div");
      skeletonElement.className =
        "relative w-full h-28 p-4 outline-1 outline-[#1a1a1a] rounded-md cursor-pointer space-y-2 animate-pulse";
      skeletonElement.innerHTML = `
        <div class="mt-2 w-1/3 h-4 bg-[#1a1a1a] rounded-md"></div>
        <div class="w-2/3 h-4 bg-[#1a1a1a] rounded-md"></div>
        <div class="mt-2 w-1/4 h-4 bg-[#1a1a1a] rounded-md"></div>
      `;
      sourceElementList.appendChild(skeletonElement);

      const source = await getProvider({
        romaji: anime.title.romaji,
        english: anime.title.english,
      });

      console.log(source);

      if (!source) {
        skeletonElement.remove();
        updateLoaded(false);
        return;
      }

      source.hosters.map(async (source_hoster) => {
        const extensionIndex = extensions.stream.findIndex(
          (extension_hoster) => extension_hoster.name === source_hoster.label,
        );

        if (extensionIndex === -1) {
          return;
        }

        const extension = extensions.stream[extensionIndex];

        console.log(source_hoster);

        const source_episode = await getEpisode(source_hoster, episodes[index]);
        console.log(source_episode);
        skeletonElement.remove();
        if (!source_episode) return;

        const hosterElement = document.createElement("div");
        hosterElement.className =
          "relative w-full h-28 p-4 outline-1 outline-[#1a1a1a] rounded-md cursor-pointer space-y-2";

        sourceElementList.appendChild(hosterElement);

        const hosterTitle = document.createElement("div");
        hosterTitle.className =
          "flex items-center space-x-2 text-white font-bold";
        hosterTitle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tv-icon lucide-tv"><path d="m17 2-5 5-5-5"/><rect width="20" height="15" x="2" y="7" rx="2"/></svg>
      <span>${source_hoster.label}</span>`;

        hosterElement.appendChild(hosterTitle);

        const extensionIcon = document.createElement("img");
        extensionIcon.src = source_extension.icon;
        extensionIcon.className = "absolute right-4 top-4 w-4 h-4";
        extensionIcon.title = `Provided by ${source_extension.name}`;

        hosterElement.appendChild(extensionIcon);

        const stream = await getMetadata(source_episode);

        if (!stream) {
          updateLoaded(false);
          return;
        }

        console.log(stream);

        const hosterFileName = document.createElement("div");
        hosterFileName.className = "text-[#a2a2a2] text-xs";
        hosterFileName.textContent = stream.name;

        hosterElement.appendChild(hosterFileName);

        const hosterSize = document.createElement("div");
        hosterSize.className =
          "absolute left-4 bottom-4 text-[#f0f0f0] text-xs py-1 m-0";
        hosterSize.textContent = stream.size;

        hosterElement.appendChild(hosterSize);

        const hosterQuality = document.createElement("div");
        hosterQuality.className =
          "absolute right-4 bottom-4 px-2 py-1 text-xs text-black bg-[#FFBF00] rounded";
        hosterQuality.textContent = stream.quality;

        hosterElement.appendChild(hosterQuality);

        hosterElement.addEventListener("click", () => {
          episodeSelected = true;

          router.navigate(
            `/player?streamurl=${encodeURIComponent(stream.mp4)}&title=${encodeURIComponent(anime.title.romaji)}&episode=${JSON.stringify(episodes[index])}&anilist_id=${anime.id}`,
          );
        });

        sources.push({
          name: source_hoster.label,
          node: hosterElement,
        });

        updateLoaded(true);
      });
    });
  }

  return container;
}
