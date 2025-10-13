import { router } from "../../lib/router/index";
import { fetchSections, get } from "../../lib/anilist";
import CategorySlider from "../../ui/Slider";
import { Card } from "../../ui/card";
import { API } from "../../app";
import { Carousel } from "../../ui/carousel";
import { authService } from "../../services/auth";
import { currentSeason, currentYear } from "../../lib/anilist/util";

export default async function Home(query) {
  const page = document.createElement("div");
  page.className = "h-full w-full space-y-4 overflow-y-scroll";

  document.root.appendChild(page);

  let ids = [];
  if (authService.getUser()) {
    ids = (await API.getContinueAnime()).map((item) => item.anilist_id);
  }

  const sections = [
    {
      type: "trending",
      title: "Trending.Slider",
      params: { perPage: 5 },
    },
    ids.length !== 0
      ? {
          type: "continue",
          title: "Continue Watching",
          params: {
            ids,
          },
        }
      : null,
    {
      type: "seasonal",
      title: "Popular this Season",
      params: {
        season: currentSeason,
        seasonYear: currentYear,
        perPage: 30,
      },
    },
    {
      type: "trending",
      title: "Trending Now",
      params: { perPage: 30 },
    },
  ].filter(Boolean);

  const results = await fetchSections(sections);

  results.forEach((result) => {
    switch (result.title) {
      case "Trending.Slider":
        const slider = Carousel(result.data);
        page.appendChild(slider);
        break;
      case "Continue Watching":
        const orderedAnime = ids.map((id) =>
          result.data.find((item) => item.id === id),
        );

        const continueAnimeCards = orderedAnime.map((item) => {
          const card = Card(item);
          return card;
        });
        const continueAnimeSlider = CategorySlider(
          "Continue Watching",
          continueAnimeCards,
        );
        page.appendChild(continueAnimeSlider);
        break;
      default:
        const animeCards = result.data.map((item) => {
          const card = Card(item);
          return card;
        });
        const animeSlider = CategorySlider(result.title, animeCards);
        page.appendChild(animeSlider);
        break;
    }
  });
}
