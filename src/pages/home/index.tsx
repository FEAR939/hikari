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
          <div class="w-full h-full grid place-items-center">
            <div class="flex justify-center text-center">
              <svg
                aria-hidden="true"
                class="size-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
                  opacity=".25"
                />
                <path
                  d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"
                  class="spinner_ajPY"
                />
              </svg>
            </div>
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
