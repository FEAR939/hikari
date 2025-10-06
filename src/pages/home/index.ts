import { router } from "../../lib/router/index";
import { getTrendingAnime, getSeasonAnime } from "../../lib/anilist";
import CategorySlider from "../../ui/Slider";
import { Card } from "../../ui/card";
import { getContinueAnime } from "../../lib/api";
import { Carousel } from "../../ui/carousel";

export default async function Home(query) {
  const page = document.createElement("div");
  page.className = "h-full w-full space-y-4 overflow-y-scroll";

  document.root.appendChild(page);

  const trendingAnime = await getTrendingAnime();

  const carousel = Carousel(trendingAnime);
  page.appendChild(carousel);

  const continueAnime = await getContinueAnime();

  if (continueAnime !== false) {
    const continueCards = Object.values(continueAnime).map((item) => {
      const card = Card(item);
      return card;
    });

    const continueSlider = CategorySlider("Continue Watching", continueCards);
    page.appendChild(continueSlider);
  }

  const anime = await getSeasonAnime();

  const animeCards = anime.map((item) => {
    const card = Card(item);
    return card;
  });

  const animeSlider = CategorySlider("Popular this Season", animeCards);
  page.appendChild(animeSlider);
}
