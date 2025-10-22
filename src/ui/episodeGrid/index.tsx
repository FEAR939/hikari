import { h } from "../../lib/jsx/runtime";
import { createSignal, bind } from "../../lib/jsx/reactive";
import { router } from "../../lib/router";
import { Episode } from "../episode";
import { PageControls } from "../pageControls";
import { SourcePanel } from "../sourcePanel";
import { KitsuAnime, KitsuEpisode } from "../../lib/kitsu";

const [visibleEpisodes, setVisibleEpisodes, subscribeVisibleEpisodes] =
  createSignal<KitsuEpisode[]>([]);

export function EpisodeView({
  anime,
  episodes,
  sourcepanel_callback,
}: {
  anime: KitsuAnime;
  episodes: KitsuEpisode[];
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
            {value.map((episode: KitsuEpisode, index) => (
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

function episodeHandler(
  anime: KitsuAnime,
  episodes: KitsuEpisode[],
  page: number,
) {
  const episodesPerPage = 15;

  const episodesPart: KitsuEpisode[] = [];

  for (let index = 0; index < episodes.length; index++) {
    const episode = episodes[index];
    if (page * episodesPerPage > index || index >= (page + 1) * episodesPerPage)
      continue;

    episode.kitsu_id = anime.id || 0;

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

  setVisibleEpisodes(episodesPart);

  router.route("/anime/updateEpisodeProgress", (query: any) => {
    if (query.kitsu_id !== anime.id) return;
    episodes.find(
      (episode) => episode.attributes.number === parseInt(query.episode),
    )!.leftoff = query.leftoff;
    const episodeTarget = visibleEpisodes().find(
      (episode) => episode.attributes.number === parseInt(query.episode),
    );

    if (!episodeTarget) return;

    episodeTarget.leftoff = query.leftoff;
    setVisibleEpisodes(visibleEpisodes());
  });
}
