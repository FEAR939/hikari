<script lang="ts">
    let { news } = $props();
</script>

<button
    class="relative text-left outline-hidden group/newscard cursor-pointer"
    onclick={() => window.electronAPI?.openUrl(news.link)}
>
    <div class="relative flex space-y-2">
        <div
            class="min-w-1/3 max-w-1/3 aspect-video rounded-lg overflow-hidden outline-offset-2 outline-white group-hover/newscard:outline-2 group-focus-within/newscard:outline-2"
        >
            <img
                src={news.thumbnail}
                alt={news.title}
                class="h-full w-full object-cover transition-transform duration-300 group-hover/newscard:scale-105 group-focus-within/newscard:scale-105"
            />
        </div>
        <div class="p-4">
            <div class="text-lg font-bold!">{news.title}</div>
            <div class="text-xs text-gray-400">
                {new Date(news.pubDate!).toLocaleDateString()}
            </div>
            <div class="mt-4 text-sm text-gray-400">
                {news.description}
            </div>
        </div>
    </div>
</button>
