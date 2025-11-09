import { router } from "../../lib/router/index";
import { fetchSections } from "../../lib/anilist";
import CategorySlider from "../../ui/Slider";
import { Card } from "../../ui/card";
import { API } from "../../app";
import { Carousel } from "../../ui/carousel";
import { authService } from "../../services/auth";
import { currentSeason, currentYear } from "../../lib/anilist/util";
import { h } from "../../lib/jsx/runtime";
import { createSignal, bind } from "../../lib/jsx/reactive";
import { kitsu, KitsuAnime, KitsuCategory } from "../../lib/kitsu";

export default async function Home(query) {
  const [categories, setCategories, subscribeCategories] = createSignal<
    KitsuCategory[]
  >([]);

  const page = (
    <div class="h-full w-full overflow-y-scroll">
      {bind([categories, setCategories, subscribeCategories], (value) =>
        value.length > 0 ? (
          <div class="space-y-4">
            <Carousel
              items={
                value
                  .find((category) => category.type === "upcoming")
                  ?.data.slice(0, 5) ?? []
              }
            ></Carousel>
            {value.map((categorie) => {
              const entries = categorie.data.map((item) => {
                return (
                  <Card
                    item={item}
                    className="snap-start"
                    options={{ label: true }}
                  />
                );
              });

              return (
                <CategorySlider label={categorie.title}>
                  {entries}
                </CategorySlider>
              );
            })}
          </div>
        ) : (
          <div>
            <div class="relative w-full h-48 md:h-96">
              <div class="absolute inset-0 bg-neutral-900">
                <div class="absolute inset-0 brightness-50 mask-t-from-25% bg-[#080808]"></div>
              </div>
              <div class="absolute z-1 top-20 md:top-48 left-4 w-1/3 h-8 rounded bg-neutral-800 animate-pulse"></div>
              <div class="absolute z-1 top-24 md:top-58 left-4 w-1/2 h-12 rounded bg-neutral-800 animate-pulse"></div>
              <div class="absolute z-1 top-34 md:top-72 left-4 w-48 h-6 rounded bg-neutral-800 animate-pulse"></div>
            </div>
            {Array.from({ length: 2 }).map((_, index) => (
              <div class="h-fit w-full p-4 pt-0 animate-pulse">
                <div class="h-6 w-64 rounded bg-neutral-900"></div>
                <div class="space-x-2 md:space-x-4 flex mt-8">
                  {Array.from({ length: window.innerWidth / (48 * 4) }).map(
                    (_, index) => (
                      <div class="w-48 aspect-5/7 rounded bg-neutral-900"></div>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        ),
      )}
    </div>
  ) as HTMLElement;

  router.container!.appendChild(page);

  let continueList: KitsuAnime[] = [];
  let bookmarkList: KitsuAnime[] = [];
  if (authService.getUser()) {
    try {
      const continueAnime = await API.getContinueAnime();
      const bookmarkAnime = await API.getBookmarks();

      const continueIds: string[] = continueAnime
        .filter((item) => item.kitsu_id != null)
        .map((item) => String(item.kitsu_id));

      const bookmarkIds: string[] = bookmarkAnime
        .filter((item) => item.kitsu_id != null)
        .map((item) => String(item.kitsu_id));

      if (continueIds.length > 0) {
        continueList = (await kitsu.getAnimeByIds(continueIds)) as KitsuAnime[];
      }
      if (bookmarkIds.length > 0) {
        bookmarkList = (await kitsu.getAnimeByIds(bookmarkIds)) as KitsuAnime[];
      }
    } catch (error) {
      console.error("Error fetching continue watching:", error);
    }
  }

  const categoriesdefault = await kitsu.getCategories(
    [
      {
        type: "upcoming",
        title: "Top Upcoming",
      },
      {
        type: "highest_rated",
        title: "Highest Rated",
      },
      {
        type: "seasonal",
        title: "Popular this season",
      },
      {
        type: "trending",
        title: "Trending Now",
      },
    ],
    20,
  );

  const homeCategories: KitsuCategory[] = [
    continueList.length !== 0
      ? { type: "continue", title: "Continue Watching", data: continueList }
      : null,
    bookmarkList.length !== 0
      ? { type: "bookmark", title: "Your List", data: bookmarkList }
      : null,
    ...categoriesdefault,
  ].filter(Boolean);

  console.assert(homeCategories.length > 0, "No categories found");
  setCategories(homeCategories);
}
