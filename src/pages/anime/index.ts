import { router } from "../../lib/router/index";
import { getAnime } from "../../lib/anilist/index";
import { getAnimeAnizip } from "../../lib/anizip/index";
import { authService } from "../../services/auth";
import { SourcePanel } from "../../ui/sourcePanel/index";

import Episode from "../../ui/episode/index";

export default async function Anime(query) {
  const page = document.createElement("div");
  page.className =
    "relative h-full w-full px-4 md:px-12 pb-4 space-y-4 overflow-y-scroll";

  document.root.appendChild(page);

  const pageback = document.createElement("div");
  pageback.className =
    "absolute z-10 top-2 left-4 size-8 flex items-center justify-center cursor-pointer";
  pageback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left-to-line-icon lucide-arrow-left-to-line"><path d="M3 19V5"/><path d="m13 6-6 6 6 6"/><path d="M7 12h14"/></svg>`;

  page.appendChild(pageback);

  pageback.addEventListener("click", () => {
    router.removeRoute("/anime/updateEpisodeProgress");
    router.navigate("/");
  });

  const [anime, anime_anizip] = await Promise.all([
    getAnime(query.id),
    getAnimeAnizip(query.id),
  ]);

  let episodeProgress = null;

  if (authService.getUser()) {
    episodeProgress = await getEpisodeProgress(
      anime.id,
      1,
      Object.values(anime_anizip.episodes).filter(
        (episode) => episode.episode && !isNaN(parseInt(episode.episode)),
      ).length,
    );
  }

  const heroSection = document.createElement("div");
  heroSection.className = "h-fit w-full";

  const heroSectionBannerWrapper = document.createElement("div");
  heroSectionBannerWrapper.className =
    "absolute -z-1 top-0 left-0 right-0 w-full h-48 md:h-96 object-cover";

  const heroSectionBanner = document.createElement("img");
  heroSectionBanner.className =
    "w-full h-full object-cover object-center overflow-hidden";
  heroSectionBanner.src = anime.bannerImage || anime.trailer.thumbnail;

  heroSectionBannerWrapper.appendChild(heroSectionBanner);

  heroSection.appendChild(heroSectionBannerWrapper);

  const heroSectionBannerOverlay = document.createElement("div");
  heroSectionBannerOverlay.className =
    "absolute inset-0 bg-gradient-to-t from-black to-transparent";

  heroSectionBannerWrapper.appendChild(heroSectionBannerOverlay);

  heroSection.appendChild(heroSectionBannerWrapper);

  const heroSectionContent = document.createElement("div");
  heroSectionContent.className = "h-fit w-full space-y-4 mt-32 md:mt-64 flex";

  const heroSectionPrimary = document.createElement("div");
  heroSectionPrimary.className =
    "w-24 md:w-56 h-fit shrink-0 space-y-3 md:space-y-6";

  const heroSectionImage = document.createElement("img");
  heroSectionImage.src = anime.coverImage.large;
  heroSectionImage.className = "w-full aspect-[5/7] object-cover rounded-xl";

  heroSectionPrimary.appendChild(heroSectionImage);

  const watchButton = document.createElement("div");
  watchButton.className =
    "w-full py-1 md:py-3 rounded-md md:rounded-xl bg-[#FFBF00] text-xs md:text-base font-semibold text-black flex items-center justify-center space-x-2 cursor-pointer";
  watchButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play-icon lucide-play size-2 md:size-4"><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>
    <div class="h-fit">${episodeProgress ? "Continue" : "Watch Now"}</div>
  `;

  heroSectionPrimary.appendChild(watchButton);

  watchButton.addEventListener("click", () => {
    if (
      Object.values(anime_anizip.episodes).filter(
        (episode) => episode.episode && !isNaN(parseInt(episode.episode)),
      ).length === 0
    )
      return;

    const episodes = Object.values(anime_anizip.episodes)
      .filter((episode) => episode.episode && !isNaN(parseInt(episode.episode)))
      .map((episode) => {
        episode.mal_id = anime.idMal || 0;
        return episode;
      });

    if (!authService.getUser() || !episodeProgress) {
      const sourcePanel = SourcePanel(anime, episodes, 0);
      page.appendChild(sourcePanel);
      return;
    }

    const lastProgress = episodeProgress.reduce((acc, episode) => {
      if (episode.episode > acc) return episode.episode;
      return acc;
    }, 0);

    const sourcePanel = SourcePanel(anime, episodes, lastProgress - 1);
    page.appendChild(sourcePanel);
  });

  heroSectionContent.appendChild(heroSectionPrimary);

  const heroSectionSecondary = document.createElement("div");
  heroSectionSecondary.className =
    "flex-1 h-fit md:mt-18 p-4 space-y-2 md:space-y-4 overflow-hidden";

  const heroSectionTitle = document.createElement("h1");
  heroSectionTitle.className =
    "w-full text-xl md:text-4xl font-bold flex items-center space-x-4 truncate";
  heroSectionTitle.textContent = anime.title.romaji;

  const heroSectionChips = document.createElement("div");
  heroSectionChips.className =
    "w-full flex items-center space-x-2 md:space-x-4 overflow-hidden";

  const chips = [
    {
      text: `${anime.episodes} Episodes`,
    },
  ];

  chips.map((chip) => {
    const chipElement = document.createElement("span");
    chipElement.textContent = chip.text;
    chipElement.className =
      "px-2 md:px-4 py-1 md:py-2 text-sm font-semibold rounded-md bg-[#FFBF00] text-black";
    heroSectionChips.appendChild(chipElement);
  });

  const heroSectionDescription = document.createElement("div");
  heroSectionDescription.className =
    "w-full text-sm text-neutral-600 line-clamp-3";
  heroSectionDescription.innerHTML = anime.description
    .substring(0, anime.description.indexOf("(Source:"))
    .replaceAll(/<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g, "");

  heroSectionSecondary.appendChild(heroSectionTitle);
  heroSectionSecondary.appendChild(heroSectionChips);
  heroSectionSecondary.appendChild(heroSectionDescription);

  heroSectionContent.appendChild(heroSectionSecondary);

  heroSection.appendChild(heroSectionContent);

  const heroSectionTags = document.createElement("div");
  heroSectionTags.className =
    "w-full flex items-center space-x-2 md:space-x-4 overflow-hidden";

  anime.genres.map((genre) => {
    const tagElement = document.createElement("span");
    tagElement.textContent = genre;
    tagElement.className =
      "px-2 md:px-4 py-1 md:py-2 text-sm rounded-md bg-[#0d0d0d] text-white";
    heroSectionTags.appendChild(tagElement);
  });

  heroSection.appendChild(heroSectionTags);

  page.appendChild(heroSection);

  if (
    anime.relations.nodes.filter((relation, index) => {
      if (
        relation.type !== "ANIME" ||
        (anime.relations.edges[index].relationType !== "PREQUEL" &&
          anime.relations.edges[index].relationType !== "SEQUEL")
      )
        return false;

      return true;
    }).length > 0
  ) {
    const relationsSection = document.createElement("div");
    relationsSection.className = "w-full h-fit space-y-4";

    const relationsTitle = document.createElement("h2");
    relationsTitle.className = "text-2xl font-bold";
    relationsTitle.textContent = "Relations";

    relationsSection.appendChild(relationsTitle);

    const relationsList = document.createElement("div");
    relationsList.className = "grid grid-cols-2 md:grid-cols-3 gap-4";

    relationsSection.appendChild(relationsList);

    anime.relations.nodes.map((relation, index) => {
      if (
        relation.type !== "ANIME" ||
        (anime.relations.edges[index].relationType !== "PREQUEL" &&
          anime.relations.edges[index].relationType !== "SEQUEL")
      )
        return;
      const relationCard = document.createElement("div");
      relationCard.className =
        "h-24 md:h-36 w-full bg-[#0d0d0d] flex overflow-hidden rounded-xl cursor-pointer";

      const relationCardImage = document.createElement("img");
      relationCardImage.src = relation.coverImage.large;
      relationCardImage.className =
        "h-full aspect-[1/1.35] object-cover object-center";

      const relationCardContent = document.createElement("div");
      relationCardContent.className = "w-3/4 h-full p-4 space-y-2 md:space-y-4";

      const relationType = document.createElement("h3");
      relationType.className =
        "text-base text-indigo-400 font-semibold text-gray-400";
      relationType.textContent =
        anime.relations.edges[index].relationType
          .toString()
          .toLowerCase()
          .charAt(0)
          .toUpperCase() +
        anime.relations.edges[index].relationType
          .toString()
          .toLowerCase()
          .slice(1);

      const relationCardTitle = document.createElement("h3");
      relationCardTitle.className =
        "text-base text-white font-semibold truncate";
      relationCardTitle.textContent = relation.title.romaji;

      relationCardContent.appendChild(relationType);
      relationCardContent.appendChild(relationCardTitle);

      relationCard.appendChild(relationCardImage);
      relationCard.appendChild(relationCardContent);

      relationCard.addEventListener("click", () => {
        router.navigate(`/anime?id=${relation.id}`);
      });

      relationsList.appendChild(relationCard);
    });

    page.appendChild(relationsSection);
  }

  const tabSection = document.createElement("div");
  tabSection.className = "w-full h-fit space-y-4";

  const tabSelector = document.createElement("div");
  tabSelector.className =
    "p-1 bg-[#0d0d0d] rounded-xl flex justify-center w-fit";

  const tabContent = document.createElement("div");
  tabContent.className = "w-full h-fit";

  tabSection.appendChild(tabSelector);
  tabSection.appendChild(tabContent);

  const tabs = [
    {
      label: "Episodes",
      handler: episodeHandler,
      default: true,
    },
    {
      label: "Threads",
      handler: () => {},
    },
  ];
  const tabOptionNodes: HTMLDivElement[] = [];

  tabs.map((tab) => {
    const tabOption = document.createElement("div");
    tabOption.className =
      "px-4 py-2 rounded-md text-neutral-600 font-semibold cursor-pointer";
    tabOption.textContent = tab.label;

    tabSelector.appendChild(tabOption);
    tabOptionNodes.push(tabOption);

    tabOption.addEventListener("click", () => {
      tabOptionNodes.forEach((node) => {
        node.classList.remove("bg-white", "text-black");
      });
      tabOption.classList.add("bg-white", "text-black");

      tabContent.innerHTML = "";
      tab.handler();
    });

    if (tab.default) {
      tabOption.click();
    }
  });

  page.appendChild(tabSection);

  function episodeHandler() {
    const episodeList = document.createElement("div");
    episodeList.className =
      "h-fit w-full grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4";

    tabContent.appendChild(episodeList);

    let episodesPage = 0;
    let episodesPerPage = 12;

    const pageControls = document.createElement("div");
    pageControls.className = "flex items-center space-x-2 w-fit mt-4 ml-auto";

    const pageControlsPrev = document.createElement("div");
    pageControlsPrev.className = "text-[#c1c1c1] cursor-pointer";
    pageControlsPrev.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left-icon lucide-chevron-left size-4"><path d="m15 18-6-6 6-6"/></svg>`;

    const pageControlCurr = document.createElement("div");
    pageControlCurr.className =
      "bg-[#0d0d0d] text-white px-4 py-2 rounded-lg cursor-pointer";
    pageControlCurr.textContent = (episodesPage + 1).toString();

    const pageControlsNext = document.createElement("div");
    pageControlsNext.className = "text-[#c1c1c1] cursor-pointer";
    pageControlsNext.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right-icon lucide-chevron-right size-4"><path d="m9 18 6-6-6-6"/></svg>`;

    pageControls.append(pageControlsPrev, pageControlCurr, pageControlsNext);

    pageControlsPrev.addEventListener("click", () => {
      if (episodesPage == 0) return;

      episodesPage--;
      pageControlCurr.textContent = (episodesPage + 1).toString();
      renderPage();
    });

    pageControlsNext.addEventListener("click", () => {
      if (episodesPage >= anime_anizip.episodeCount / episodesPerPage - 1)
        return;

      episodesPage++;
      pageControlCurr.textContent = (episodesPage + 1).toString();
      renderPage();
    });

    tabContent.appendChild(pageControls);

    renderPage();

    async function renderPage() {
      episodeList.innerHTML = "";
      const episodes = new Map(); // Changed from array to Map
      let eps = Object.values(anime_anizip.episodes).filter(
        (episode) => episode.episode,
      );
      if (eps.length === 0 && anime.format === "MOVIE") {
        const epObj = {
          episode: "1",
          runtime: 0,
          image: "",
          overview: "",
          title: {
            en: "",
          },
          airdate: "",
        };

        eps = [epObj];
      }

      for (let index = 0; index < eps.length; index++) {
        const episode = eps[index];
        if (
          isNaN(parseInt(episode.episode)) ||
          episodesPage * episodesPerPage > index ||
          index >= (episodesPage + 1) * episodesPerPage
        )
          continue;

        episode.mal_id = anime.idMal || 0;
        episode.anilist_id = anime.id || 0;
        const episodeCard = Episode(episode, index);
        episodeList.appendChild(episodeCard);
        episodeCard.addEventListener("click", () => {
          const sourcepanel = SourcePanel(
            anime,
            Object.values(anime_anizip.episodes).filter(
              (episode) => episode.episode,
            ),
            index,
          );
          page.appendChild(sourcepanel);
        });
        episodes.set(episode.episode, episodeCard); // Store by episode number
      }

      router.route("/anime/updateEpisodeProgress", (query) => {
        if (parseInt(query.anilist_id) !== anime.id) return;
        const episodeCard = episodes.get(query.episode);
        if (episodeCard) episodeCard.updateProgress(query.leftoff);
      });

      if (!authService.getUser() || !episodeProgress) return;

      const episodeProgressPart = episodeProgress.filter(
        (episode) =>
          episode.episode >= episodesPage * episodesPerPage &&
          episode.episode < (episodesPage + 1) * (episodesPerPage - 1),
      );

      episodeProgressPart.forEach((episodeProg) => {
        const episodeCard = episodes.get(episodeProg.episode.toString());
        if (episodeCard) episodeCard.updateProgress(episodeProg.leftoff);
      });
    }
  }
}

async function getEpisodeProgress(
  anilist_id: string,
  episode_start: number,
  episode_end: number,
) {
  const formData = new FormData();
  formData.append("anilist_id", anilist_id);
  formData.append("episode_filter", `${episode_start}-${episode_end}`);

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
    console.error("Failed to fetch episode progress");
    return;
  }

  const data = await response.json();

  return data;
}
