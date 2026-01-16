<script lang="ts">
    let { news } = $props();
</script>

<button
    class="relative flex flex-col text-left outline-hidden group/newscard cursor-pointer"
    onclick={() => window.electronAPI?.openUrl(news.link)}
>
    <div class="relative space-y-2">
        <div
            class="w-full aspect-video rounded-lg overflow-hidden outline-offset-2 outline-white group-hover/newscard:outline-2 group-focus-within/newscard:outline-2"
        >
            <img
                src={news.thumbnail}
                alt={news.title}
                class="h-full w-full object-cover transition-transform duration-300 group-hover/newscard:scale-105 group-focus-within/newscard:scale-105"
            />
        </div>
        <div class="text-sm">{news.title}</div>
        <div class="text-xs text-neutral-500">
            {new Date(news.pubDate!).toLocaleDateString()}
        </div>
    </div>
</button>
