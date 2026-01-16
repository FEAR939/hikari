<script lang="ts">
    import { currentAnimeAccentColor } from "$lib/stores";
    let { video } = $props();
    let playProgress = $state(0);
    let seekProgress = $state(0);
    let bufferProgress = $state(0);
    let dragging = $state(false);
    let seekbarEl: HTMLDivElement;

    video.addEventListener("timeupdate", () => {
        const currentTime = video.currentTime || 0;
        const duration = video.duration || 0;

        playProgress = (currentTime / duration) * 100;
    });

    video.addEventListener("progress", () => {
        if (video.buffered.length > 0) {
            const buffered = video.buffered.end(video.buffered.length - 1);
            const duration = video.duration || 0;

            bufferProgress = (buffered / duration) * 100;
        }
    });

    function updateSeekProgress(e: MouseEvent) {
        const rect = seekbarEl.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const progress = Math.min(Math.max(x / width, 0), 1);
        const duration = video.duration || 0;
        video.currentTime = progress * duration;
    }

    function updateSeekVisual(e: MouseEvent) {
        const rect = seekbarEl.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const progress = Math.min(Math.max(x / width, 0), 1);
        seekProgress = progress * 100;
    }

    function handleMouseDown(e: MouseEvent) {
        dragging = true;
        updateSeekProgress(e);
    }

    function handleMouseMove(e: MouseEvent) {
        if (e.target === seekbarEl || e.target.parentElement === seekbarEl) {
            updateSeekVisual(e);
        } else {
            seekProgress = 0;
        }
        if (dragging) updateSeekProgress(e);
    }

    function handleMouseUp(e: MouseEvent) {
        dragging = false;
    }
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

<div
    bind:this={seekbarEl}
    onmousedown={handleMouseDown}
    role="seekbar"
    class="relative w-full h-1 rounded-full bg-gray-900/50 cursor-pointer"
>
    <div
        class="absolute top-0 left-0 flex items-center h-full bg-gray-600 rounded-full transition"
        style:width={bufferProgress + "%"}
    ></div>
    <div
        class="absolute top-0 left-0 flex items-center h-full bg-gray-400 rounded-full transition"
        style:width={seekProgress + "%"}
    ></div>
    <div
        class="absolute top-0 left-0 flex items-center h-full shadow-xl rounded-full transition"
        style:background="rgb({$currentAnimeAccentColor?.join(',')})"
        style:width={playProgress + "%"}
    >
        <div
            class="absolute left-[100%] -translate-x-1/2 size-2.5 rounded-full shrink-0"
            style:background="rgb({$currentAnimeAccentColor?.join(',')})"
        ></div>
    </div>
</div>
