import { getProvider, getEpisode } from "../../lib/animetoast";
import { getMetadata } from "../../lib/voe";
import { router } from "../../lib/router/index";

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

  const episodePickerInput = document.createElement("input");
  episodePickerInput.className =
    "w-full px-4 py-2 bg-[#080808] outline-1 outline-[#1a1a1a] rounded-md";
  episodePickerInput.type = "number";
  episodePickerInput.min = "1";
  episodePickerInput.max = episodes.length;
  episodePickerInput.value = (index + 1).toString();

  episodePicker.appendChild(episodePickerInput);

  episodePickerInput.addEventListener("input", () => {
    const value = parseInt(episodePickerInput.value);

    if (isNaN(value) || value < 1 || value > episodes.length) return;

    index = value - 1;

    loadSource();
  });

  console.log(episodes, index);

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

  function loadSource() {
    sourceElementList.innerHTML = "";

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

      if (!source) return skeletonElement.remove();

      source.hosters.map(async (source_hoster) => {
        const extensionIndex = extensions.stream.findIndex(
          (extension_hoster) => extension_hoster.name === source_hoster.label,
        );

        if (extensionIndex === -1) return;

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

        if (!stream) return;

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
          console.log(
            `/player?streamurl=${encodeURIComponent(stream.mp4)}&title=${encodeURIComponent(anime.title.romaji)}&episode=${JSON.stringify(episodes[index])}&anilist_id=${anime.id}`,
          );

          router.navigate(
            `/player?streamurl=${encodeURIComponent(stream.mp4)}&title=${encodeURIComponent(anime.title.romaji)}&episode=${JSON.stringify(episodes[index])}&anilist_id=${anime.id}`,
          );
        });
      });
    });
  }

  return container;
}
