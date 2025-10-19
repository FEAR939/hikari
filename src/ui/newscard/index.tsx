import { h } from "../../lib/jsx/runtime";
import { NewsItem } from "../../lib/anime2you";

export function NewsCard({ news }: { news: NewsItem }) {
  return (
    <div>
      <img
        src={news.image}
        alt={news.title}
        className="w-full aspect-video object-cover rounded-md"
      />
      <div className="text-lg">{news.title}</div>
      <div className="text-neutral-500">
        {new Date(news.date!).toLocaleDateString()}
      </div>
    </div>
  );
}
