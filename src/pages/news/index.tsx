import { h } from "../../lib/jsx/runtime";
import { router } from "../../lib/router";
import { Client } from "../../lib/anime2you/index";
import { NewsCard } from "../../ui/newscard";
import RSSClient from "@lib/rss";

interface NewsQuery {}

export default async function News(query: NewsQuery) {
  const rss = new RSSClient(
    "https://cr-news-api-service.prd.crunchyrollsvc.com/v1/en-US/rss",
  );

  const news = (await rss.getRSSFeed()) || [];

  const page = (
    <div class="relative h-full w-full px-4 md:px-12 pt-12 pb-4 space-y-4 overflow-y-scroll">
      <div class="text-xl">News</div>
      <div class="h-fit w-full grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
        {news.map((newsEntry) => (
          <NewsCard news={newsEntry} />
        ))}
      </div>
    </div>
  ) as HTMLElement;

  router.container!.appendChild(page);
}
