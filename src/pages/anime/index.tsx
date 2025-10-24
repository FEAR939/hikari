import { h } from "../../lib/jsx/runtime";
import { createSignal, bind } from "../../lib/jsx/reactive";
import { router } from "../../lib/router/index";
import { authService } from "../../services/auth";
import { SourcePanel } from "../../ui/sourcePanel/index";
import { Card, CardType } from "../../ui/card";
import { API } from "../../app";
import { EpisodeView } from "../../ui/episodeView";
import { kitsu } from "../../lib/kitsu";

interface AnimeQuery {
  id: string;
}

export default async function Anime(query: AnimeQuery) {
  const [kitsuAnime] = await Promise.all([kitsu.getAnimeById(query.id)]);

  console.log(kitsuAnime);

  let episodeProgress = null;
  const [bookmark, setBookmark, subscribeBookmark] = createSignal(false);
  if (authService.getUser()) {
    const [progress, bookmarked] = await Promise.all([
      await API.getAnimeProgress(
        kitsuAnime.anime.id,
        1,
        kitsuAnime.anime.attributes.episodeCount!,
      ),
      await API.getBookmarks(parseInt(kitsuAnime.anime.id)),
    ]);

    episodeProgress = progress;
    setBookmark(bookmarked[0]?.subscribed || false);
  }

  const chips = [
    { text: `${kitsuAnime.anime.attributes.episodeCount} Episodes` },
    { text: `${kitsuAnime.anime.attributes.status}` },
  ];

  const relations = kitsuAnime.relations
    .filter(
      (relation: any, index: number) =>
        relation.role === "sequel" || relation.role === "prequel",
    )
    .map((relation) => {
      relation.anime.relationType = relation.role;
      return relation.anime;
    });

  const [currTab, setCurrTab, subscribeCurrTab] = createSignal(0);
  const [sourcePanelIndex, setSourcePanelIndex, subscribeSourcePanelIndex] =
    createSignal<number>(-1);
  function sourcepanel_callback(index: number) {
    console.log(index);
    setSourcePanelIndex(index);
  }
  const tabs = [
    {
      label: "Episodes",
      handler: () => (
        <EpisodeView
          anime={kitsuAnime.anime}
          sourcepanel_callback={sourcepanel_callback}
        ></EpisodeView>
      ),
      default: true,
    },
    {
      label: "Threads",
      handler: () => {},
    },
  ];

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
            src={
              kitsuAnime.anime.attributes?.coverImage?.original ||
              kitsuAnime.anime.attributes?.posterImage?.original
            }
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        </div>

        {/* Content */}
        <div class="h-fit w-full space-y-4 mt-32 md:mt-64 flex flex-wrap">
          {/* Cover Image */}
          <div class="w-24 md:w-56 h-fit shrink-0 space-y-3 md:space-y-6">
            <img
              src={kitsuAnime.anime.attributes?.posterImage?.original}
              class="w-full aspect-[5/7] object-cover rounded-md"
            />
          </div>

          {/* Info */}
          <div class="flex-1 h-fit md:mt-18 p-4 space-y-2 md:space-y-4 overflow-hidden">
            <h1 class="w-full text-xl md:text-4xl font-bold flex items-center space-x-4 truncate">
              {kitsuAnime.anime.attributes?.titles?.en ||
                kitsuAnime.anime.attributes?.titles?.en_us ||
                kitsuAnime.anime.attributes?.titles?.en_jp ||
                kitsuAnime.anime.attributes?.titles?.en_cn}
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
            <div class="w-full text-sm text-neutral-600 line-clamp-3">
              {kitsuAnime.anime.attributes.description}
            </div>
          </div>

          {/* Button Row */}
          <div class="w-full h-10 flex items-center space-x-2 md:space-x-4 overflow-hidden shrink-0 grow-0">
            <div
              class="w-24 md:w-56 h-full py-1 md:py-2 rounded-md bg-neutral-900 text-xs md:text-base text-white flex items-center justify-center space-x-2 cursor-pointer"
              onClick={() => {
                if (!authService.getUser() || !episodeProgress) {
                  const sourcePanel = SourcePanel({
                    anime: kitsuAnime.anime,
                    initialIndex: 0,
                  });
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
                const sourcePanel = SourcePanel({
                  anime: kitsuAnime.anime,
                  initialIndex: lastProgress - 1,
                });
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

            <div
              class="size-10 bg-neutral-900 rounded-md flex items-center justify-center cursor-pointer"
              onClick={async () => {
                const result = await API.setBookmark(
                  parseInt(kitsuAnime.anime.id),
                  !bookmark(),
                  false,
                  false,
                );
                if (!result) return;
                setBookmark(!bookmark());
              }}
            >
              {bind([bookmark, setBookmark, subscribeBookmark], (value) => (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill={value ? "currentColor" : "none"}
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-bookmark size-6"
                >
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
              ))}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div class="w-full mt-4 flex items-center space-x-2 md:space-x-4 overflow-hidden">
          {kitsuAnime.genres.map((genre) => (
            <span class="px-2 md:px-4 py-1 md:py-2 text-sm rounded-md bg-neutral-900 text-white shrink-0">
              {genre.attributes.title}
            </span>
          ))}
        </div>
      </div>

      {/* Relations Section */}
      {relations.length > 0 && (
        <div class="w-full h-fit space-y-4 mt-12">
          <h2 class="text-2xl font-bold">Relations</h2>
          <div class="flex overflow-y-scroll gap-4">
            {relations.map((relation) => {
              return (
                <Card
                  item={relation}
                  options={{
                    type: CardType.RELATION,
                    label: true,
                  }}
                ></Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Section */}
      <div class="w-full h-fit space-y-4 mt-12">
        <div class="flex justify-center w-fit">
          {tabs.map((tab, index) => {
            bind([currTab, setCurrTab, subscribeCurrTab], (value) => (
              <div
                class={`px-4 py-2 rounded-md text-sm cursor-pointer ${value === index ? "bg-neutral-900 text-white" : "text-neutral-500"}`}
                onClick={() => {
                  setCurrTab(index);

                  tab.handler();
                }}
              >
                {tab.label}
              </div>
            ));
          })}
        </div>
        {bind([currTab, setCurrTab, subscribeCurrTab], (value) => (
          <div class="w-full h-fit">{tabs[currTab()].handler()}</div>
        ))}
      </div>
    </div>
  ) as HTMLDivElement;

  subscribeSourcePanelIndex(() => {
    const value = sourcePanelIndex();
    if (value === -1) return;

    console.log(value);

    const sourcePanel = SourcePanel({
      anime: kitsuAnime.anime,
      initialIndex: value - 1,
    });
    page.appendChild(sourcePanel);
  });

  router.container!.appendChild(page);
}
