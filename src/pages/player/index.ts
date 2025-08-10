import { getBundle } from "../../lib/animetoast";
import { getEpisodeLink } from "../../lib/animetoast";
import { extract_voe_url } from "../../lib/voe/index";

interface PlayerQuery {
  url: string;
  episodeNumber: string;
  isBundle: boolean;
}

export default async function Player(query: PlayerQuery) {
  let player = document.querySelector("#player");

  if (!player) {
    player = document.createElement("div");
    player.className = "absolute top-0 h-full w-full bg-[#0c0c0c]";

    document.body.appendChild(player);
  }

  player.innerHTML = "";

  player.classList.add("z-10");

  const video = document.createElement("video");
  video.className = "h-full w-full";
  video.controls = true;

  player.appendChild(video);

  let link = "";

  if (query.isBundle == true) {
    const bundle = await getBundle(query.url);

    if (!bundle) return;

    const episode = bundle.find(
      (sourceEpisode) =>
        sourceEpisode.label.replace("Ep. ", "") == query.episodeNumber,
    );

    if (!episode) return;

    link = (await getEpisodeLink(episode.url)) || "";
  } else {
    link = (await getEpisodeLink(query.url)) || "";
  }

  if (!link) return;

  const stream_link = await extract_voe_url(link);

  video.src = stream_link?.mp4;
}
