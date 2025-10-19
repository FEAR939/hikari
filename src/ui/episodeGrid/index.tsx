import { h } from "../../lib/jsx/runtime";
import { createSignal, bind } from "../../lib/jsx/reactive";
import { router } from "../../lib/router";
import { Episode } from "../episode";
import { PageControls } from "../pageControls";
import { SourcePanel } from "../sourcePanel";

const [visibleEpisodes, setVisibleEpisodes, subscribeVisibleEpisodes] =
  createSignal([]);

export function EpisodeView({
  anime,
  episodes,
  sourcepanel_callback,
}: {
  anime: any;
  episodes: any;
  sourcepanel_callback: any;
}) {
  console.log(episodes);
  episodeHandler(anime, episodes, 0);

  return (
    <div>
      {bind(
        [visibleEpisodes, setVisibleEpisodes, subscribeVisibleEpisodes],
        (value) => (
          <div class="h-fit w-full grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
            {value.map((episode: any, index) => (
              <Episode
                episode={episode}
                index={index}
                sourcepanel_callback={sourcepanel_callback}
              />
            ))}
          </div>
        ),
      )}
      <PageControls
        totalPages={Math.ceil(episodes.length / 15)}
        currentPage={1}
        callback={(page) => episodeHandler(anime, episodes, page - 1)}
      />
    </div>
  );
}

function episodeHandler(anime, episodes, page: number) {
  const episodesPerPage = 15;

  const episodesPart = [];

  for (let index = 0; index < episodes.length; index++) {
    const episode = episodes[index] as any;
    if (
      isNaN(parseInt(episode.episode)) ||
      page * episodesPerPage > index ||
      index >= (page + 1) * episodesPerPage
    )
      continue;

    episode.mal_id = anime.idMal || 0;
    episode.anilist_id = anime.id || 0;

    // const episodeCard = Episode(episode, index);
    // episodeList.appendChild(episodeCard);

    // episodeCard.addEventListener("click", () => {
    //   const sourcepanel = SourcePanel(
    //     anime,
    //     Object.values(anime_anizip.episodes).filter(
    //       (episode: any) => episode.episodeNumber,
    //     ),
    //     index,
    //   );
    //   page.appendChild(sourcepanel);
    // });

    // episodes.set(episode.episode, episodeCard);

    episodesPart.push(episode);
  }

  if (episodes.length === 0 && anime.format === "MOVIE") {
    const epObj = {
      episode: "1",
      runtime: 0,
      image: "",
      overview: "",
      title: { en: "" },
      airdate: "",
    };
    episodesPart.push(epObj);
  }

  setVisibleEpisodes(episodesPart);

  router.route("/anime/updateEpisodeProgress", (query: any) => {
    if (parseInt(query.anilist_id) !== anime.id) return;
    episodes.find((episode) => episode.episode === query.episode).leftoff =
      query.leftoff;
    const episodeTarget = visibleEpisodes().find(
      (episode) => episode.episode === query.episode,
    );
    if (!episodeTarget) return;

    episodeTarget.leftoff = query.leftoff;
    setVisibleEpisodes(visibleEpisodes());
  });
}
