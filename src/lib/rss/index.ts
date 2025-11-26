export default class RSSClient {
  constructor(url: string) {
    this.url = url;
  }

  async getRSSFeed() {
    const response = await fetch(this.url);

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status}`);
    }

    const data = await response.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "text/xml");

    const items = xmlDoc.getElementsByTagName("item");

    const feed = Array.from(items).map((item) => ({
      title: item.getElementsByTagName("title")[0].textContent,
      link: item.getElementsByTagName("link")[0].textContent,
      thumbnail: item
        .getElementsByTagName("media:thumbnail")[0]
        .getAttribute("url"),
      description: item.getElementsByTagName("description")[0].textContent,
      pubDate: item.getElementsByTagName("pubDate")[0].textContent,
    }));

    return feed;
  }
}
