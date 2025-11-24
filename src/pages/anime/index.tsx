import { h } from "../../lib/jsx/runtime";
import { createSignal, bind } from "../../lib/jsx/reactive";
import { router } from "../../lib/router/index";
import { authService } from "../../services/auth";
import { SourcePanel } from "../../ui/sourcePanel/index";
import { Card, CardType } from "../../ui/card";
import { API } from "../../app";
import { EpisodeView } from "../../ui/episodeView";
import ThreadView from "@ui/threadView";
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
    { text: `${kitsuAnime.anime.attributes.showType}` },
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
      label: "Thread",
      handler: () => <ThreadView></ThreadView>,
    },
  ];

  const minRepeats = Math.max(
    3,
    Math.ceil((window.innerWidth * 3) / (kitsuAnime.genres.length * 100)),
  );

  const page = (
    <div class="relative h-full w-full">
      {/* Banner */}
      <div class="absolute -z-1 left-0 right-0 top-0 w-full aspect-[2.5/1] overflow-hidden">
        <img
          class="min-w-full w-fit min-h-full h-fit object-cover"
          src={
            kitsuAnime.anime.attributes?.coverImage?.original ||
            kitsuAnime.anime.attributes?.posterImage?.original
          }
        />
        <div class="absolute inset-0 bg-linear-to-t from-[#171717] to-black/75"></div>
      </div>

      <div class="h-full w-full md:px-12 overflow-y-scroll">
        <div class="max-w-[100rem] w-full h-fit pb-8 mx-auto">
          {/* Hero Section */}
          <div class="h-fit w-full mt-32 md:mt-64 flex">
            {/* Cover Image */}
            <div class="w-24 md:w-56 h-fit shrink-0 space-y-3 md:space-y-6">
              <div class="w-full aspect-3/4 overflow-hidden rounded-2xl grid place-items-center">
                <img
                  src={kitsuAnime.anime.attributes?.posterImage?.original}
                  class="min-w-full w-fit min-h-full h-fit object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div class="relative flex-1 p-4 pt-8 space-y-2 md:space-y-4 overflow-hidden">
              <h1 class="w-full text-xl md:text-4xl font-bold flex items-center space-x-4 leading-none truncate">
                {kitsuAnime.anime.attributes?.titles?.en ||
                  kitsuAnime.anime.attributes?.titles?.en_us ||
                  kitsuAnime.anime.attributes?.titles?.en_jp ||
                  kitsuAnime.anime.attributes?.titles?.en_cn}
              </h1>

              {/* Chips */}
              <div class="w-full flex items-center space-x-1 md:space-x-2 overflow-hidden">
                {chips.map((chip) => (
                  <span class="px-4 py-2 text-sm rounded-full bg-[#1d1d1d] text-white uppercase">
                    {chip.text}
                  </span>
                ))}
              </div>

              {/* Description */}
              <div class="max-w-[60rem] w-full text-sm text-neutral-400 line-clamp-4">
                {kitsuAnime.anime.attributes.description}
              </div>

              {/* Button Row */}
              <div class="absolute bottom-8 w-full h-9 flex items-center space-x-1 md:space-x-2 overflow-hidden shrink-0 grow-0">
                <div
                  class="pl-2 md:pl-3 pr-2 md:pr-3.5 py-1 md:py-2 rounded-full bg-neutral-200 hover:bg-neutral-300 text-sm font-medium text-black flex items-center justify-center space-x-2 cursor-pointer"
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
                    class="lucide lucide-play size-3"
                  >
                    <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
                  </svg>
                  <div class="h-fit">
                    {episodeProgress ? "Continue" : "Watch Now"}
                  </div>
                </div>

                {/* Bookmark */}
                <div
                  class="size-9 bg-[#1d1d1d] hover:bg-[#333333] rounded-full flex items-center justify-center cursor-pointer"
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
                      width="100%"
                      height="100%"
                      viewBox="0 0 24 24"
                      fill={value ? "currentColor" : "none"}
                      xmlns="http://www.w3.org/2000/svg"
                      class="size-4"
                    >
                      <path
                        d="M5 7.8C5 6.11984 5 5.27976 5.32698 4.63803C5.6146 4.07354 6.07354 3.6146 6.63803 3.32698C7.27976 3 8.11984 3 9.8 3H14.2C15.8802 3 16.7202 3 17.362 3.32698C17.9265 3.6146 18.3854 4.07354 18.673 4.63803C19 5.27976 19 6.11984 19 7.8V21L12 17L5 21V7.8Z"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  ))}
                </div>

                {/* Favourite */}
                <div class="size-9 bg-[#1d1d1d] hover:bg-[#333333] rounded-full flex items-center justify-center cursor-pointer">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    class="size-4"
                  >
                    <path
                      d="M16.1111 3C19.6333 3 22 6.3525 22 9.48C22 15.8138 12.1778 21 12 21C11.8222 21 2 15.8138 2 9.48C2 6.3525 4.36667 3 7.88889 3C9.91111 3 11.2333 4.02375 12 4.92375C12.7667 4.02375 14.0889 3 16.1111 3Z"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div class="w-full inline-flex flex-nowrap mt-8 mask-l-from-98% mask-r-from-98% mask-x-[#080808]">
            {Array.from({ length: minRepeats }).map(() => (
              <div class="flex items-center [&_span]:mx-1 animate-infinite-scroll">
                {kitsuAnime.genres.map((genre) => (
                  <span class="px-2 md:px-4 py-1 md:py-2 text-sm rounded-full bg-[#1d1d1d] text-white text-nowrap">
                    {genre.attributes.title}
                  </span>
                ))}
              </div>
            ))}
          </div>

          {/* Tab Section */}
          <div class="w-full h-fit space-y-8 pt-8 mt-8">
            <div class="flex w-full gap-4 border-b border-white/10">
              {tabs.map((tab, index) =>
                bind([currTab, setCurrTab, subscribeCurrTab], (value) => (
                  <div
                    class={`px-2 py-2 text-md cursor-pointer ${value === index ? "border-b-2 border-white text-white" : "text-neutral-500"}`}
                    onClick={() => {
                      setCurrTab(index);

                      tab.handler();
                    }}
                  >
                    {tab.label}
                  </div>
                )),
              )}
            </div>
            {bind([currTab, setCurrTab, subscribeCurrTab], (value) => (
              <div class="w-full h-fit">{tabs[currTab()].handler()}</div>
            ))}
          </div>

          {/* Relations Section */}
          {relations.length > 0 && (
            <div class="w-full h-fit space-y-4 pt-8 mt-8 border-t border-white/10">
              <h2 class="text-2xl font-bold">Related</h2>
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
        </div>
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
    sourcePanel.offsetWidth;
    sourcePanel.classList.remove("opacity-0");
    sourcePanel.getPanel().offsetWidth;
    sourcePanel.getPanel().classList.remove("scale-75");
  });

  router.container!.appendChild(page);
}
