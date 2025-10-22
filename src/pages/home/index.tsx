import { router } from "../../lib/router/index";
import { fetchSections } from "../../lib/anilist";
import CategorySlider from "../../ui/Slider";
import { Card } from "../../ui/card";
import { API } from "../../app";
import { Carousel } from "../../ui/carousel";
import { authService } from "../../services/auth";
import { currentSeason, currentYear } from "../../lib/anilist/util";
import { h } from "../../lib/jsx/runtime";
import { kitsu, KitsuAnime } from "../../lib/kitsu";

export default async function Home(query) {
  let continueList: KitsuAnime[] = [];
  if (authService.getUser()) {
    try {
      const continueAnime = await API.getContinueAnime();

      const ids: string[] = continueAnime
        .filter((item) => item.kitsu_id != null)
        .map((item) => String(item.kitsu_id));

      if (ids.length > 0) {
        continueList = (await kitsu.getAnimeByIds(ids)) as KitsuAnime[];
      }
    } catch (error) {
      console.error("Error fetching continue watching:", error);
    }
  }

  const categories = await kitsu.getCategories(
    [
      { type: "trending", title: "Trending Now" },
      { type: "seasonal", title: "Popular this season" },
    ],
    30,
  );

  const homeCategories = [
    continueList.length !== 0
      ? { type: "continue", title: "Continue Watching", data: continueList }
      : null,
    ...categories,
  ].filter(Boolean);

  console.log(homeCategories);

  const page = (
    <div class="h-full w-full space-y-4 overflow-y-scroll">
      <Carousel
        items={
          categories
            .find((category) => category.type === "seasonal")
            ?.data.slice(0, 5) ?? []
        }
      ></Carousel>
      {homeCategories.map((categorie) => {
        const entries = categorie.data.map((item) => {
          return <Card item={item} />;
        });

        const slider = CategorySlider({
          label: categorie.title,
          children: entries,
        });

        return slider;
      })}
    </div>
  ) as HTMLElement;

  router.container!.appendChild(page);
  // const page = document.createElement("div");
  // page.className = "h-full w-full space-y-4 overflow-y-scroll";

  // router.container.appendChild(page);

  // let ids = [];
  // if (authService.getUser()) {
  //   ids = (await API.getContinueAnime()).map((item) => item.kitsu_id);
  // }

  // const sections = [
  //   {
  //     type: "trending",
  //     title: "Trending.Slider",
  //     params: { perPage: 5 },
  //   },
  //   ids.length !== 0
  //     ? {
  //         type: "continue",
  //         title: "Continue Watching",
  //         params: {
  //           ids,
  //         },
  //       }
  //     : null,
  //   {
  //     type: "seasonal",
  //     title: "Popular this Season",
  //     params: {
  //       season: currentSeason,
  //       seasonYear: currentYear,
  //       perPage: 30,
  //     },
  //   },
  //   {
  //     type: "trending",
  //     title: "Trending Now",
  //     params: { perPage: 30 },
  //   },
  // ].filter(Boolean);

  // const results = await fetchSections(sections);

  // results.forEach((result) => {
  //   switch (result.title) {
  //     case "Trending.Slider":
  //       const slider = Carousel(result.data);
  //       page.appendChild(slider);
  //       break;
  //     case "Continue Watching":
  //       const orderedAnime = ids.map((id) =>
  //         result.data.find((item) => item.id === id),
  //       );

  //       const continueAnimeCards = orderedAnime.map((item) => {
  //         const card = Card({ item: item });
  //         return card;
  //       });
  //       const continueAnimeSlider = CategorySlider(
  //         "Continue Watching",
  //         continueAnimeCards,
  //       );
  //       page.appendChild(continueAnimeSlider);
  //       break;
  //     default:
  //       const animeCards = result.data.map((item) => {
  //         const card = Card({ item: item });
  //         return card;
  //       });
  //       const animeSlider = CategorySlider(result.title, animeCards);
  //       page.appendChild(animeSlider);
  //       break;
  //   }
  // });
}
