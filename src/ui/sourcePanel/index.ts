import { getProvider, getEpisode } from "../../lib/animetoast";
import { getMetadata } from "../../lib/voe";
import { router } from "../../lib/router/index";

export function SourcePanel(anime, episode) {
  const container = document.createElement("div");
  container.className =
    "fixed inset-0 p-4 flex items-center justify-center backdrop-brightness-50 backdrop-blur-md";

  const panel = document.createElement("div");
  panel.className =
    "relative w-full max-w-4xl h-2/3 p-4 pt-12 overflow-y-scroll bg-[#080808] rounded-xl";

  container.appendChild(panel);

  const containerClose = document.createElement("div");
  containerClose.className =
    "absolute z-10 top-2 left-4 size-8 flex items-center justify-center";
  containerClose.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left-short size-8" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"/>
  </svg>`;

  panel.appendChild(containerClose);

  containerClose.addEventListener("click", () => {
    container.remove();
  });

  const extensions = {
    source: [
      {
        name: "AnimeToast",
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

  extensions.source.map(async (source_extension) => {
    const sourceElement = document.createElement("div");
    sourceElement.className = "relative h-32 w-full p-4 space-y-2";

    const sourceName = document.createElement("div");
    sourceName.className = "text-white font-bold";
    sourceName.textContent = source_extension.name;

    sourceElement.appendChild(sourceName);

    const sourceLoad = document.createElement("div");
    sourceLoad.className = "absolute top-4 right-4";
    sourceLoad.innerHTML = `<svg aria-hidden="true" class="w-4 h-4 text-[#f0f0f0] animate-spin dark:text-[#0d0d0d] fill-[#a0a0a0]" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>`;

    sourceElement.appendChild(sourceLoad);

    sourceElementList.appendChild(sourceElement);

    const source = await getProvider({
      romaji: anime.title.romaji,
      english: anime.title.english,
    });

    console.log(source);

    sourceLoad.remove();

    if (!source) return;

    source.hosters.map(async (source_hoster) => {
      const extensionIndex = extensions.stream.findIndex(
        (extension_hoster) => extension_hoster.name === source_hoster.label,
      );

      if (extensionIndex === -1) return;

      const extension = extensions.stream[extensionIndex];

      console.log(source_hoster);

      const source_episode = await getEpisode(source_hoster, episode);
      console.log(source_episode);
      if (!source_episode) return;

      const hosterElement = document.createElement("div");
      hosterElement.className =
        "relative w-full h-28 p-4 outline-1 outline-[#1a1a1a] rounded-md cursor-pointer space-y-2";

      const hosterTitle = document.createElement("div");
      hosterTitle.className =
        "flex items-center space-x-2 text-white font-bold";
      hosterTitle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cast size-4" viewBox="0 0 16 16">
        <path d="m7.646 9.354-3.792 3.792a.5.5 0 0 0 .353.854h7.586a.5.5 0 0 0 .354-.854L8.354 9.354a.5.5 0 0 0-.708 0"/>
        <path d="M11.414 11H14.5a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.5-.5h-13a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5h3.086l-1 1H1.5A1.5 1.5 0 0 1 0 10.5v-7A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v7a1.5 1.5 0 0 1-1.5 1.5h-2.086z"/>
      </svg>
      <span>${source_hoster.label}</span>`;

      hosterElement.appendChild(hosterTitle);

      sourceElement.appendChild(hosterElement);

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
        router.navigate(
          `/player?streamurl=${encodeURIComponent(stream.mp4)}&title=${encodeURIComponent(anime.title.romaji)}&episode=${JSON.stringify(episode)}&anilist_id=${anime.id}`,
        );
      });
    });
  });

  return container;
}
