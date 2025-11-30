import { h } from "../../lib/jsx/runtime";
import { createSignal, bind } from "@lib/jsx/reactive";
import { router } from "../../lib/router";
import { NewsCard } from "../../ui/newscard";
import RSSClient from "@lib/rss";

interface NewsQuery {}

export default async function News(query: NewsQuery) {
  const [loading, setLoading, subscribeLoading] = createSignal(true);

  const page = (
    <div class="relative h-full w-full px-4 md:px-12 pt-12 pb-4 space-y-4 overflow-y-scroll">
      <div class="text-xl">News</div>

      {bind([loading, setLoading, subscribeLoading], (isLoading) => (
        <div class="h-fit w-full grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {isLoading && (
            <div class="col-span-full h-[calc(100vh-12rem)] grid place-items-center">
              <div class="flex items-center justify-center text-center">
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
          )}
          {!isLoading && news.map((newsEntry) => <NewsCard news={newsEntry} />)}
        </div>
      ))}
    </div>
  ) as HTMLElement;

  router.container!.appendChild(page);

  const rss = new RSSClient(
    "https://cr-news-api-service.prd.crunchyrollsvc.com/v1/en-US/rss",
  );

  const news = (await rss.getRSSFeed()) || [];

  setLoading(false);
}
