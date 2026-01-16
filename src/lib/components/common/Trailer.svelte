<script lang="ts">
    import { showTrailer } from "$lib/stores";

    let { youtubeId } = $props();
</script>

<button
    class="group/trailer relative h-36 aspect-video bg-gray-950 rounded-lg border-none overflow-hidden outline-white outine-offset-2 hover:outline-2 focus-within:outline-2 cursor-pointer"
    onclick={() => showTrailer.set(!$showTrailer)}
>
    <!-- Image -->
    <img
        src="https://img.youtube.com/vi/{youtubeId}/maxresdefault.jpg"
        class="w-full h-full object-cover transition-transform duration-300 group-hover/trailer:scale-105 group-focus-within/trailer:scale-105"
        loading="lazy"
        alt={`Thumbnail`}
    />
</button>
