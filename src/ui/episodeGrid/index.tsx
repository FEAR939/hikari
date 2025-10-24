import { h } from "../../lib/jsx/runtime";
import { createSignal, bind } from "../../lib/jsx/reactive";
import { router } from "../../lib/router";
import { Episode } from "../episode";
import { PageControls } from "../pageControls";
import { SourcePanel } from "../sourcePanel";
import { kitsu, KitsuAnime, KitsuEpisode } from "../../lib/kitsu";
import { API } from "../../app";

const [visibleEpisodes, setVisibleEpisodes, subscribeVisibleEpisodes] =
  createSignal<KitsuEpisode[]>([]);

export function EpisodeView({
  anime,
  sourcepanel_callback,
}: {
  anime: KitsuAnime;
  sourcepanel_callback: any;
}) {
  episodeHandler(anime, 0);

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
        totalPages={Math.ceil(anime.attributes.episodeCount! / 15)}
        currentPage={1}
        callback={(page) => episodeHandler(anime, page - 1)}
      />
    </div>
  );
}

async function episodeHandler(anime: KitsuAnime, page: number) {
  const episodesPerPage = 15;

  const [episodes, episodesProgress] = await Promise.all([
    await kitsu.getEpisodesPagination(anime.id, page, episodesPerPage),
    await API.getAnimeProgress(
      anime.id,
      page * episodesPerPage,
      page * episodesPerPage + episodesPerPage,
    ),
  ]);

  episodes.map((episode) => {
    const progress = episodesProgress.find(
      (progress) => progress.episode === episode.attributes.number,
    );
    episode.leftoff = progress ? progress.leftoff : 0;
  });

  setVisibleEpisodes(episodes);

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
