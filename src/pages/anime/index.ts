import { router } from "../../lib/router/index";
import { getAnime } from "../../lib/anilist/index";
import { getAnimeAnizip } from "../../lib/anizip/index";
import { getProvider } from "../../lib/animetoast/index";

import Episode from "../../ui/episode/index";

export default async function Anime(query) {
  const page = document.createElement("div");
  page.className =
    "relative h-full w-full px-4 md:px-12 pb-4 space-y-4 overflow-y-scroll";

  document.root.appendChild(page);

  const pageback = document.createElement("div");
  pageback.className =
    "absolute z-10 top-2 left-4 size-8 flex items-center justify-center";
  pageback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left-short size-8" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"/>
  </svg>`;

  page.appendChild(pageback);

  pageback.addEventListener("click", () => {
    router.navigate("/");
  });

  const [anime, anime_anizip] = await Promise.all([
    getAnime(query.id),
    getAnimeAnizip(query.id),
  ]);

  const Provider = getProvider({
    romaji: anime.title.romaji,
    english: anime.title.english,
  });
  Provider.then((data) => console.debug(data));

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
  heroSectionImage.className =
    "w-full aspect-[1/1.35] object-center rounded-xl";

  heroSectionPrimary.appendChild(heroSectionImage);

  const userListToggle = document.createElement("div");
  userListToggle.className =
    "w-full py-2 rounded-xl bg-[#0d0d0d] text-sm md:text-base text-white flex items-center justify-center";
  userListToggle.textContent = "Add to List";

  heroSectionPrimary.appendChild(userListToggle);

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
      "px-2 md:px-4 py-1 md:py-2 text-sm rounded-md bg-[#0d0d0d] text-white";
    heroSectionChips.appendChild(chipElement);
  });

  Provider.then((data) => {
    if (data?.languages) {
      const tag = document.createElement("span");
      tag.textContent = data.languages.replace(/[()]/g, "");
      tag.className =
        "px-2 md:px-4 py-1 md:py-2 text-sm rounded-md bg-[#0d0d0d] text-white";
      heroSectionChips.appendChild(tag);
    }
  });

  const heroSectionDescription = document.createElement("div");
  heroSectionDescription.className =
    "w-full text-sm text-neutral-600 line-clamp-3";
  heroSectionDescription.innerHTML = anime.description.substring(
    0,
    anime.description.indexOf("(Source:"),
  );

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

  heroSectionSecondary.appendChild(heroSectionTitle);
  heroSectionSecondary.appendChild(heroSectionChips);
  heroSectionSecondary.appendChild(heroSectionDescription);
  heroSectionSecondary.appendChild(heroSectionTags);

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
      "h-24 md:h-48 w-full bg-[#0d0d0d] flex overflow-hidden rounded-xl cursor-pointer";

    const relationCardImage = document.createElement("img");
    relationCardImage.src = relation.coverImage.large;
    relationCardImage.className =
      "h-full aspect-[1/1.35] object-cover object-center";

    const relationCardContent = document.createElement("div");
    relationCardContent.className = "w-3/4 h-full p-4 space-y-4";

    const relationType = document.createElement("h3");
    relationType.className = "text-l md:text-xl text-gray-400";
    relationType.textContent = anime.relations.edges[index].relationType;

    const relationCardTitle = document.createElement("h3");
    relationCardTitle.className = "text-l md:text-xl font-bold";
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
      "h-fit w-full grid grid-cols-1 md:grid-cols-2 gap-4";

    tabContent.appendChild(episodeList);

    let page = 0;
    let perPage = 12;

    const pageControls = document.createElement("div");
    pageControls.className = "flex itens-center space-x-4 w-fit mt-4 ml-auto";

    const pageControlsPrev = document.createElement("div");
    pageControlsPrev.className =
      "bg-[#0d0d0d] text-white px-4 py-2 rounded-lg cursor-pointer";
    pageControlsPrev.textContent = "Prev";

    const pageControlCurr = document.createElement("div");
    pageControlCurr.className =
      "bg-[#0d0d0d] text-white px-4 py-2 rounded-lg cursor-pointer";
    pageControlCurr.textContent = (page + 1).toString();

    const pageControlsNext = document.createElement("div");
    pageControlsNext.className =
      "bg-[#0d0d0d] text-white px-4 py-2 rounded-lg cursor-pointer";
    pageControlsNext.textContent = "Next";

    pageControls.append(pageControlsPrev, pageControlCurr, pageControlsNext);

    pageControlsPrev.addEventListener("click", () => {
      if (page == 0) return;

      page--;
      pageControlCurr.textContent = (page + 1).toString();
      renderPage();
    });

    pageControlsNext.addEventListener("click", () => {
      console.log(
        Math.ceil(Object.values(anime_anizip.episodes).length / perPage) - 1,
      );
      if (page >= anime_anizip.episodeCount / perPage - 1) return;

      page++;
      pageControlCurr.textContent = (page + 1).toString();
      renderPage();
    });

    tabContent.appendChild(pageControls);

    renderPage();

    function renderPage() {
      episodeList.innerHTML = "";
      Object.values(anime_anizip.episodes)
        .filter((episode) => episode.episode)
        .map((episode, index) => {
          if (
            isNaN(parseInt(episode.episode)) ||
            page * perPage > index ||
            index >= (page + 1) * perPage
          )
            return;

          episode.mal_id = anime.idMal || 0;

          const episodeCard = Episode(episode, index);

          episodeList.appendChild(episodeCard);

          Provider.then((provider) => {
            if (!provider) return;

            const sourceProvider = provider.episodes.find(
              (source) => source.label === "Voe",
            );

            if (
              !sourceProvider?.episodes ||
              sourceProvider?.episodes.length == 0
            )
              return episodeCard.updateSource?.(false);

            let sourceEpisode = false;
            let bundleEpisodeNumber = 0;

            if (sourceProvider?.episodes[0].isBundle) {
              console.log("Episodes are bundled");
              sourceEpisode = sourceProvider.episodes.find((sourceEpisode) => {
                const match = sourceEpisode.label.match(/E?(\d+)-E?(\d+)/);

                const [bundleStart, bundleEnd] = match
                  ? [parseInt(match[1]), parseInt(match[2])]
                  : [0, 0];

                const episodeNumber = parseInt(episode.episode);

                bundleEpisodeNumber = episodeNumber - bundleStart + 1;

                return (
                  bundleStart <= episodeNumber && bundleEnd >= episodeNumber
                );
              });
            } else {
              sourceEpisode = sourceProvider.episodes.find(
                (sourceEpisode) =>
                  sourceEpisode.label.replace("Ep. ", "") == episode.episode,
              );
            }

            if (!sourceEpisode) return episodeCard.updateSource?.(false);
            episodeCard.updateSource?.({
              icon: provider.icon,
              url: sourceEpisode.url,
              isBundle: sourceEpisode.isBundle,
              bundleEpisodeNumber: bundleEpisodeNumber,
            });
          });
        });
    }
  }
}
