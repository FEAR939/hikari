import { h } from "../../lib/jsx/runtime";
import { NewsItem } from "../../lib/anime2you";

export function NewsCard({ news }: { news: NewsItem }) {
  return (
    <div
      class="space-y-2"
      onClick={() => window.electronAPI?.openUrl(news.link)}
    >
      <img
        src={news.thumbnail}
        alt={news.title}
        className="w-full aspect-video object-cover rounded-md"
      />
      <div className="text-sm">{news.title}</div>
      <div className="text-xs text-neutral-500">
        {new Date(news.pubDate!).toLocaleDateString()}
      </div>
    </div>
  );
}
