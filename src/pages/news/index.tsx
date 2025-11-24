import { h } from "../../lib/jsx/runtime";
import { router } from "../../lib/router";
import { Client } from "../../lib/anime2you/index";
import { NewsCard } from "../../ui/newscard";

interface NewsQuery {}

export default async function News(query: NewsQuery) {
  const newsClient = new Client();

  const news = await newsClient.getNews();

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
