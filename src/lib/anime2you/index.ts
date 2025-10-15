import { cache } from "../../services/cache";

export class Client {
  baseUrl: string;

  constructor() {
    this.baseUrl = "https://www.anime2you.de/news/";
  }

  async getNews() {
    if (cache.get("news")) {
      return cache.get("news");
    }

    const res = await fetch(this.baseUrl);

    const data = await res.text();

    const newsItems = this.scrapeFromPage(data);

    cache.set("news", newsItems, 1000 * 60 * 30);

    return newsItems;
  }

  scrapeFromPage(html: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const newsItems = doc.querySelectorAll(".td-cpt-post");

    const news = Array.from(newsItems).map((item) => {
      const image = item
        .querySelector(".entry-thumb")
        ?.getAttribute("data-img-url");
      const title = item.querySelector(".entry-title a")?.textContent;
      const link = item.querySelector(".entry-title a")?.getAttribute("href");
      const date = item.querySelector(".entry-date")?.getAttribute("datetime");

      return { image, title, link, date };
    });

    return news;
  }
}
