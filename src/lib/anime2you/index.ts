import { cache } from "../../services/cache";

export interface NewsItem {
  image: string | null;
  title: string | null;
  link: string | null;
  date: string | null;
}

export type NewsResponse = NewsItem[];

export class Client {
  baseUrl: string;

  constructor() {
    this.baseUrl = "https://www.anime2you.de/news/";
  }

  async getNews(): Promise<NewsResponse> {
    if (cache.get("news")) {
      return cache.get("news");
    }

    const res = await fetch(this.baseUrl);

    const data = await res.text();

    const newsItems = this.scrapeFromPage(data);

    cache.set("news", newsItems, 1000 * 60 * 30);

    return newsItems;
  }

  scrapeFromPage(html: string): NewsResponse {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const newsItems = doc.querySelectorAll(".td-cpt-post");

    const news = Array.from(newsItems).map((item) => {
      const image =
        item.querySelector(".entry-thumb")?.getAttribute("data-img-url") ||
        null;
      const title = item.querySelector(".entry-title a")?.textContent || null;
      const link =
        item.querySelector(".entry-title a")?.getAttribute("href") || null;
      const date =
        item.querySelector(".entry-date")?.getAttribute("datetime") || null;

      return { image, title, link, date };
    });

    return news;
  }
}
