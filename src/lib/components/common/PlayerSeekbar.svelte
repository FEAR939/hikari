<script lang="ts">
    import {
        currentAnimeAccentColor,
        playerSources,
        playerSourceIndex,
    } from "$lib/stores";
    let { video } = $props();
    let playProgress = $state(0);
    let seekProgress = $state(0);
    let seekSec = $state(0);
    let bufferProgress = $state(0);
    let dragging = $state(false);
    let seekbarEl: HTMLDivElement;

    let thumbnail: string | null = $state(null);

    let seekThumbnailEnabled = $derived(() => {
        return video.src.includes("mediaproxy://");
    });

    function throttle(func: Function, limit: number) {
        let inThrottle = false;
        let lastArgs: any[] | null = null;

        return function (...args: any[]) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;

                setTimeout(() => {
                    inThrottle = false;
                    // Fire once more with the latest args so the
                    // final position is never missed
                    if (lastArgs) {
                        func.apply(this, lastArgs);
                        lastArgs = null;
                    }
                }, limit);
            } else {
                // Store latest args so we don't lose the last hover position
                lastArgs = args;
            }
        };
    }

    async function getSeekThumbnail(videoPath: string, time: number) {
        const src = await window.electronAPI.getThumbnail(videoPath, time);
        thumbnail = src;
    }

    const throttledGetSeekThumbnail = throttle(getSeekThumbnail, 500);

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
        const duration = video.duration || 0;
        seekProgress = progress * 100;
        seekSec = progress * duration;
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

        if (
            (e.target === seekbarEl || e.target.parentElement === seekbarEl) &&
            seekThumbnailEnabled()
        ) {
            throttledGetSeekThumbnail(
                $playerSources![$playerSourceIndex!].file_url,
                seekSec,
            );
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
    >
        {#if seekProgress > 0 && seekThumbnailEnabled() && thumbnail}
            <div
                class="absolute bottom-14 right-0 translate-x-1/2 h-32 aspect-video rounded-lg bg-black outline-offset-2 outline outline-white overflow-hidden"
            >
                <img src={thumbnail} class="h-full w-full object-cover" />
            </div>
        {/if}
        {#if seekProgress > 0}
            <div
                class="absolute bottom-4 right-0 translate-x-1/2 h-fit px-3 py-1 rounded-full bg-black/30 backdrop-blur-lg text-sm"
            >
                {new Date(seekSec * 1000).toISOString().substring(14, 19)}
            </div>
        {/if}
    </div>
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
