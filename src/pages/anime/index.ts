import { getAnime } from "../../lib/anilist/index";
import { getAnimeAnizip } from "../../lib/anizip/index";
import { getProviderEpisodes } from "../../lib/animetoast/index";

import Episode from "../../ui/episode/index";

export default async function Anime(query) {
  const page = document.createElement("div");
  page.className = "h-full w-full px-12 pb-4 space-y-4";

  document.root.appendChild(page);

  const [anime, anime_anizip] = await Promise.all([
    getAnime(query.id),
    getAnimeAnizip(query.id),
  ]);

  getProviderEpisodes(anime.title.romaji);

  const heroSection = document.createElement("div");
  heroSection.className = "h-fit w-full";

  const heroSectionBannerWrapper = document.createElement("div");
  heroSectionBannerWrapper.className =
    "absolute -z-1 top-0 left-0 right-0 w-full h-96 object-cover";

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
  heroSectionContent.className = "h-fit w-full space-y-4 mt-64 flex";

  const heroSectionPrimary = document.createElement("div");
  heroSectionPrimary.className = "w-56 h-fit shrink-0 space-y-6";

  const heroSectionImage = document.createElement("img");
  heroSectionImage.src = anime.coverImage.large;
  heroSectionImage.className =
    "w-full aspect-[1/1.35] object-center rounded-xl";

  heroSectionPrimary.appendChild(heroSectionImage);

  const userListToggle = document.createElement("div");
  userListToggle.className =
    "w-full py-2 rounded-xl bg-[#0c0c0c] text-white flex items-center justify-center";
  userListToggle.textContent = "Add to List";

  heroSectionPrimary.appendChild(userListToggle);

  heroSectionContent.appendChild(heroSectionPrimary);

  const heroSectionSecondary = document.createElement("div");
  heroSectionSecondary.className = "w-full h-fit mt-18 p-4 space-y-4";

  const heroSectionTitle = document.createElement("h1");
  heroSectionTitle.className = "text-4xl font-bold";
  heroSectionTitle.textContent = anime.title.romaji;

  const heroSectionDescription = document.createElement("div");
  heroSectionDescription.className = "text-sm text-neutral-600";
  heroSectionDescription.innerHTML = anime.description;

  heroSectionSecondary.appendChild(heroSectionTitle);
  heroSectionSecondary.appendChild(heroSectionDescription);

  heroSectionContent.appendChild(heroSectionSecondary);

  heroSection.appendChild(heroSectionContent);

  page.appendChild(heroSection);

  const relationsSection = document.createElement("div");
  relationsSection.className = "w-full h-fit space-y-4";

  const relationsTitle = document.createElement("h2");
  relationsTitle.className = "text-2xl font-bold";
  relationsTitle.textContent = "Relations";

  relationsSection.appendChild(relationsTitle);

  const relationsList = document.createElement("div");
  relationsList.className = "grid grid-cols-3 gap-4";

  relationsSection.appendChild(relationsList);

  anime.relations.nodes.map((relation, index) => {
    if (relation.type !== "ANIME") return;
    const relationCard = document.createElement("div");
    relationCard.className =
      "h-48 w-full bg-[#0c0c0c] flex overflow-hidden rounded-xl cursor-pointer";

    const relationCardImage = document.createElement("img");
    relationCardImage.src = relation.coverImage.large;
    relationCardImage.className =
      "h-full aspect-[1/1.35] object-cover object-center";

    const relationCardContent = document.createElement("div");
    relationCardContent.className = "w-3/4 h-full p-4 space-y-4";

    const relationType = document.createElement("h3");
    relationType.className = "text-xl text-gray-400";
    relationType.textContent = anime.relations.edges[index].relationType;

    const relationCardTitle = document.createElement("h3");
    relationCardTitle.className = "text-xl font-bold";
    relationCardTitle.textContent = relation.title.romaji;

    relationCardContent.appendChild(relationType);
    relationCardContent.appendChild(relationCardTitle);

    relationCard.appendChild(relationCardImage);
    relationCard.appendChild(relationCardContent);

    relationCard.addEventListener("click", () => {
      document.router.navigate(`/anime?id=${relation.id}`);
    });

    relationsList.appendChild(relationCard);
  });

  page.appendChild(relationsSection);

  const tabSection = document.createElement("div");
  tabSection.className = "w-full h-fit space-y-4";

  const tabSelector = document.createElement("div");
  tabSelector.className =
    "p-1 bg-[#0c0c0c] rounded-xl flex justify-center w-fit";

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
  const tabOptionNodes = [];

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
    episodeList.className = "h-fit w-full grid grid-cols-2 gap-4";

    tabContent.appendChild(episodeList);

    Object.values(anime_anizip.episodes)
      .filter((episode) => episode.episodeNumber)
      .map((episode, index) => {
        const episodeCard = Episode(episode, index);

        episodeList.appendChild(episodeCard);
      });
  }
}
