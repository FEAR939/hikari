import { h } from "../../lib/jsx/runtime";
import { router } from "../../lib/router/index";
import { getAnimeAnizip } from "../../lib/anizip/index";
import { authService } from "../../services/auth";
import { SourcePanel } from "../../ui/sourcePanel/index";
import { Card, CardType } from "../../ui/card";
import { API } from "../../app";
import Episode from "../../ui/episode/index";
import { PageControls } from "../../ui/pageControls";
import { fetchSections } from "../../lib/anilist";

interface AnimeQuery {
  id: string;
}

export default async function Anime(query: AnimeQuery) {
  const section = [
    {
      type: "anime",
      params: {
        id: query.id,
      },
    },
  ];

  const [anime, anime_anizip] = await Promise.all([
    (async () => {
      const result = await fetchSections(section);
      return result[0].data;
    })(),
    getAnimeAnizip(query.id),
  ]);

  console.log(anime);

  let episodeProgress = null;
  if (authService.getUser()) {
    episodeProgress = await getEpisodeProgress(
      anime.id,
      1,
      Object.values(anime_anizip.episodes).filter(
        (episode: any) => episode.episode && !isNaN(parseInt(episode.episode)),
      ).length,
    );
  }

  const chips = [
    { text: `${anime.episodes} Episodes` },
    { text: `${anime.status}` },
  ];

  const relations = anime.relations.nodes.filter(
    (relation: any, index: number) => {
      if (
        relation.type !== "ANIME" ||
        (anime.relations.edges[index].relationType !== "PREQUEL" &&
          anime.relations.edges[index].relationType !== "SEQUEL")
      )
        return false;
      return true;
    },
  );

  let tabContent: HTMLDivElement;
  const tabOptionNodes: HTMLDivElement[] = [];

  const page = (
    <div class="relative h-full w-full px-4 md:px-12 pb-4 space-y-4 overflow-y-scroll">
      {/* Back Button */}
      <div
        class="absolute z-10 top-2 left-4 size-8 flex items-center justify-center cursor-pointer"
        onClick={() => {
          router.removeRoute("/anime/updateEpisodeProgress");
          router.navigate("/");
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

      {/* Hero Section */}
      <div class="h-fit w-full">
        {/* Banner */}
        <div class="absolute -z-1 top-0 left-0 right-0 w-full h-48 md:h-96 object-cover">
          <img
            class="w-full h-full object-cover object-center overflow-hidden"
            src={anime.bannerImage || anime.trailer.thumbnail}
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        </div>

        {/* Content */}
        <div class="h-fit w-full space-y-4 mt-32 md:mt-64 flex flex-wrap">
          {/* Cover Image */}
          <div class="w-24 md:w-56 h-fit shrink-0 space-y-3 md:space-y-6">
            <img
              src={anime.coverImage.large}
              class="w-full aspect-[5/7] object-cover rounded-md"
            />
          </div>

          {/* Info */}
          <div class="flex-1 h-fit md:mt-18 p-4 space-y-2 md:space-y-4 overflow-hidden">
            <h1 class="w-full text-xl md:text-4xl font-bold flex items-center space-x-4 truncate">
              {anime.title.english || anime.title.romaji}
            </h1>

            {/* Chips */}
            <div class="w-full flex items-center space-x-2 md:space-x-4 overflow-hidden">
              {chips.map((chip) => (
                <span class="px-2 md:px-4 py-1 md:py-2 text-sm rounded-md bg-neutral-900 text-white">
                  {chip.text}
                </span>
              ))}
            </div>

            {/* Description */}
            <div
              class="w-full text-sm text-neutral-600 line-clamp-3"
              dangerouslySetInnerHTML={{
                __html: anime.description
                  .substring(0, anime.description.indexOf("(Source:"))
                  .replaceAll(/<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g, ""),
              }}
            />
          </div>

          {/* Button Row */}
          <div class="w-full h-12 flex items-center space-x-2 md:space-x-4 overflow-hidden shrink-0 grow-0">
            <div
              class="w-24 md:w-56 h-full py-1 md:py-3 rounded-md bg-neutral-900 text-xs md:text-base text-white flex items-center justify-center space-x-2 cursor-pointer"
              onClick={() => {
                const episodes = Object.values(anime_anizip.episodes).filter(
                  (episode: any) =>
                    episode.episode && !isNaN(parseInt(episode.episode)),
                );

                if (episodes.length === 0) return;

                const episodesWithMal = episodes.map((episode: any) => {
                  episode.mal_id = anime.idMal || 0;
                  return episode;
                });

                if (!authService.getUser() || !episodeProgress) {
                  const sourcePanel = SourcePanel(anime, episodesWithMal, 0);
                  (page as HTMLDivElement).appendChild(sourcePanel);
                  return;
                }

                const lastProgress = episodeProgress.reduce(
                  (acc: number, episode: any) => {
                    if (episode.episode > acc) return episode.episode;
                    return acc;
                  },
                  0,
                );
                const sourcePanel = SourcePanel(
                  anime,
                  episodesWithMal,
                  lastProgress - 1,
                );
                (page as HTMLDivElement).appendChild(sourcePanel);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="#000000"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-play size-2 md:size-4"
              >
                <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
              </svg>
              <div class="h-fit">
                {episodeProgress ? "Continue" : "Watch Now"}
              </div>
            </div>

            <div class="size-12 bg-neutral-900 rounded-md flex items-center justify-center cursor-not-allowed">
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
                class="lucide lucide-bookmark size-6"
              >
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div class="w-full mt-4 flex items-center space-x-2 md:space-x-4 overflow-hidden">
          {anime.genres.map((genre: string) => (
            <span class="px-2 md:px-4 py-1 md:py-2 text-sm rounded-md bg-neutral-900 text-white">
              {genre}
            </span>
          ))}
        </div>
      </div>

      {/* Relations Section */}
      {relations.length > 0 && (
        <div class="w-full h-fit space-y-4 mt-12">
          <h2 class="text-2xl font-bold">Relations</h2>
          <div class="flex overflow-y-scroll gap-4">
            {relations.map((relation: any, index: number) => {
              relation.relationType = anime.relations.edges[index].relationType;
              const card = Card(relation, {
                type: CardType.RELATION,
                label: true,
              });
              card.addEventListener("click", () => {
                router.navigate(`/anime?id=${relation.id}`);
              });
              return card;
            })}
          </div>
        </div>
      )}

      {/* Tab Section */}
      <div class="w-full h-fit space-y-4 mt-12">
        <div class="flex justify-center w-fit">
          {[
            {
              label: "Episodes",
              handler: episodeHandler,
              default: true,
            },
            {
              label: "Threads",
              handler: () => {},
            },
          ].map((tab) => {
            const tabOption = (
              <div
                class="px-4 py-2 rounded-md text-neutral-500 text-sm cursor-pointer"
                onClick={() => {
                  tabOptionNodes.forEach((node) => {
                    node.classList.remove("bg-neutral-900", "text-white");
                  });
                  (tabOption as HTMLDivElement).classList.add(
                    "bg-neutral-900",
                    "text-white",
                  );
                  tabContent.innerHTML = "";
                  tab.handler();
                }}
              >
                {tab.label}
              </div>
            ) as HTMLDivElement;

            tabOptionNodes.push(tabOption);

            if (tab.default) {
              setTimeout(() => (tabOption as HTMLDivElement).click(), 0);
            }

            return tabOption;
          })}
        </div>
        <div
          class="w-full h-fit"
          ref={(el) => (tabContent = el as HTMLDivElement)}
        />
      </div>
    </div>
  ) as HTMLDivElement;

  router.container.appendChild(page);

  function episodeHandler() {
    const episodesPerPage = 15;
    let episodesPage = 0;

    const episodeList = (
      <div class="h-fit w-full grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4" />
    ) as HTMLDivElement;

    function handlePageChange(page: number) {
      episodesPage = page - 1;
      renderPage();
    }

    const pageControls = PageControls(
      Math.ceil(anime_anizip.episodeCount / episodesPerPage),
      episodesPage + 1,
      handlePageChange,
    );
    pageControls.classList.add("ml-auto");

    tabContent.appendChild(episodeList);
    tabContent.appendChild(pageControls);

    renderPage();

    async function renderPage() {
      episodeList.innerHTML = "";
      const episodes = new Map();

      let eps = Object.values(anime_anizip.episodes).filter(
        (episode: any) => episode.episode,
      );

      if (eps.length === 0 && anime.format === "MOVIE") {
        const epObj = {
          episode: "1",
          runtime: 0,
          image: "",
          overview: "",
          title: { en: "" },
          airdate: "",
        };
        eps = [epObj];
      }

      for (let index = 0; index < eps.length; index++) {
        const episode = eps[index] as any;
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
              (episode: any) => episode.episodeNumber,
            ),
            index,
          );
          page.appendChild(sourcepanel);
        });

        episodes.set(episode.episode, episodeCard);
      }

      router.route("/anime/updateEpisodeProgress", (query: any) => {
        if (parseInt(query.anilist_id) !== anime.id) return;
        const episodeCard = episodes.get(query.episode);
        if (episodeCard) episodeCard.updateProgress(query.leftoff);
      });

      if (!authService.getUser() || !episodeProgress) return;

      const episodeProgressPart = episodeProgress.filter(
        (episode: any) =>
          episode.episode > episodesPage * episodesPerPage &&
          episode.episode <= (episodesPage + 1) * episodesPerPage,
      );

      episodeProgressPart.forEach((episodeProg: any) => {
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

  const response = await fetch(`${API.baseurl}/get-leftoff-at`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    body: formData,
  });

  if (!response.ok) {
    console.error("Failed to fetch episode progress");
    return;
  }

  const data = await response.json();
  return data;
}
