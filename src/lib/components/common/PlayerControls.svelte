<script lang="ts">
    import { getSeriesBackdrop, getSeriesPoster, kitsu } from "$lib/kitsu";
    import {
        playerAnime,
        playerEpisode,
        playerShowEpisodes,
        settings,
        sourceInitialIndex,
    } from "$lib/stores";
    import InputSlider from "./InputSlider.svelte";
    import PlayerSeekbar from "./PlayerSeekbar.svelte";
    import { Tooltip } from "bits-ui";
    import { fade } from "svelte/transition";
    import Spinner from "./Spinner.svelte";

    let {
        video,
        episodeNumber,
        episodeTitle,
        show = $bindable(false),
        isMiniPlayer = $bindable(false),
    } = $props();

    let playTime = $state("");
    let volume = $state($settings.player_volume || 100);
    let isMuted = $state(false);
    let isPaused = $state(false);
    let isFullscreen = $state(false);
    let toggleRemainingTime = $state(false);

    video.addEventListener("pause", () => {
        isPaused = true;
    });

    video.addEventListener("play", () => {
        isPaused = false;
    });

    video.addEventListener("timeupdate", () => {
        playTime = video.currentTime;
    });

    function handleVolumeChange(value: number) {
        value = Math.max(0, Math.min(100, value));
        video.volume = value / 100;
        volume = value;
        settings.setSetting("player_volume", value);
    }

    function handleMuteChange(value: boolean) {
        video.muted = value;
        isMuted = value;
    }

    function handleFullscreen() {
        if (isFullscreen) {
            window.electronAPI.exitFullscreen();
        } else {
            window.electronAPI.enterFullscreen();
        }
        isMiniPlayer = false;
        isFullscreen = !isFullscreen;
    }

    function handleKeyDown(e: KeyboardEvent) {
        // Check if the active element is an input-like element
        const activeElement = document.activeElement;
        const isInputElement =
            activeElement instanceof HTMLInputElement ||
            activeElement instanceof HTMLTextAreaElement ||
            activeElement instanceof HTMLSelectElement ||
            (activeElement instanceof HTMLElement &&
                activeElement.isContentEditable);

        // Don't handle shortcuts if user is typing in an input
        if (isInputElement) return;

        switch (e.key) {
            case "ArrowLeft":
                if (!video) return;
                video.currentTime -= 10;
                break;
            case "ArrowRight":
                if (!video) return;
                video.currentTime += 10;
                break;
            case "ArrowUp":
                if (!video) return;
                handleVolumeChange(volume + 10);
                break;
            case "ArrowDown":
                if (!video) return;
                handleVolumeChange(volume - 10);
                break;
            case " ":
                if (!video) return;
                video.paused ? video.play() : video.pause();
                break;
            case "m":
                if (!video) return;
                handleMuteChange(!isMuted);
                break;
            case "f":
                if (!video) return;
                handleFullscreen();
                break;
            case "t":
                if (!video) return;
                isMiniPlayer = !isMiniPlayer;
                break;
            case "P":
                if (!e.shiftKey || $playerEpisode.number === 1) return;

                sourceInitialIndex.set($playerEpisode.number - 2);
                break;
            case "N":
                if (
                    !e.shiftKey ||
                    $playerEpisode.number ===
                        $playerAnime.attributes.episodeCount
                )
                    return;

                sourceInitialIndex.set($playerEpisode.number);
                break;
        }
    }

    let nextPreviewLoading = $state(true);
    let nextPreviewImage = $state("");

    async function handleNextPreview() {
        nextPreviewLoading = true;

        const episodeObj = await await kitsu.getEpisodesPagination(
            $playerAnime.id,
            $playerEpisode.number,
            1,
        );

        nextPreviewImage =
            (episodeObj[0].attributes?.thumbnail &&
                episodeObj[0].attributes.thumbnail.original) ||
            getSeriesBackdrop($playerAnime) ||
            getSeriesPoster($playerAnime);

        nextPreviewLoading = false;
    }
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if show}
    <div
        class="absolute left-0 right-0 bottom-0 h-fit p-3 space-y-2 text-white"
        transition:fade={{ duration: 100 }}
    >
        {#if video}
            <PlayerSeekbar {video} />
        {/if}
        <div class="flex gap-2">
            <Tooltip.Provider>
                <Tooltip.Root delayDuration={0}>
                    <Tooltip.Trigger>
                        <button
                            class="relative flex items-center bg-black/30 rounded-full p-2 outline-hidden cursor-pointer before:content-[''] before:absolute before:inset-1 before:rounded-full hover:before:bg-white/10"
                            onclick={() =>
                                video.paused ? video.play() : video.pause()}
                            aria-label="Play/Pause"
                        >
                            {#if isPaused}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="24px"
                                    viewBox="0 -960 960 960"
                                    width="24px"
                                    fill="currentColor"
                                    class="relative z-1 size-7"
                                    ><path
                                        d="M320-273v-414q0-17 12-28.5t28-11.5q5 0 10.5 1.5T381-721l326 207q9 6 13.5 15t4.5 19q0 10-4.5 19T707-446L381-239q-5 3-10.5 4.5T360-233q-16 0-28-11.5T320-273Z"
                                    /></svg
                                >
                            {:else}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="24px"
                                    viewBox="0 -960 960 960"
                                    width="24px"
                                    fill="currentColor"
                                    class="relative z-1 size-7"
                                    ><path
                                        d="M640-200q-33 0-56.5-23.5T560-280v-400q0-33 23.5-56.5T640-760q33 0 56.5 23.5T720-680v400q0 33-23.5 56.5T640-200Zm-320 0q-33 0-56.5-23.5T240-280v-400q0-33 23.5-56.5T320-760q33 0 56.5 23.5T400-680v400q0 33-23.5 56.5T320-200Z"
                                    /></svg
                                >
                            {/if}
                        </button>
                    </Tooltip.Trigger>
                    <Tooltip.Content class="ml-3" sideOffset={20}>
                        <div
                            class="flex items-center gap-1 px-2 py-1 bg-black/30 rounded-md text-sm"
                        >
                            <span>{isPaused ? "Play" : "Pause"}</span>
                            <div
                                class="flex items-center justify-center px-0.75 py-0.5 border border-white/30 rounded leading-none"
                            >
                                Space
                            </div>
                        </div>
                    </Tooltip.Content>
                </Tooltip.Root>
            </Tooltip.Provider>
            {#if !isMiniPlayer}
                <div
                    class="flex items-center gap-2.5 bg-black/30 rounded-full px-2.5"
                >
                    <Tooltip.Provider>
                        <Tooltip.Root delayDuration={0}>
                            <Tooltip.Trigger>
                                <button
                                    class="relative pr-0.5 py-2 outline-hidden cursor-pointer before:content-[''] before:absolute before:inset-y-1 before:-inset-x-1.5 before:rounded-full hover:before:bg-white/10"
                                    onclick={() => {
                                        if ($playerEpisode.number === 1) return;

                                        sourceInitialIndex.set(
                                            $playerEpisode.number - 2,
                                        );
                                    }}
                                    aria-label="Rewind"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="24px"
                                        viewBox="0 -960 960 960"
                                        width="24px"
                                        fill="currentColor"
                                        class="relative z-1 size-7"
                                        ><path
                                            d="M220-280v-400q0-17 11.5-28.5T260-720q17 0 28.5 11.5T300-680v400q0 17-11.5 28.5T260-240q-17 0-28.5-11.5T220-280Zm458-1L430-447q-9-6-13.5-14.5T412-480q0-10 4.5-18.5T430-513l248-166q5-4 11-5t11-1q16 0 28 11t12 29v330q0 18-12 29t-28 11q-5 0-11-1t-11-5Z"
                                        /></svg
                                    >
                                </button>
                            </Tooltip.Trigger>
                            <Tooltip.Content sideOffset={20}>
                                <div
                                    class="flex items-center gap-1 px-2 py-1 bg-black/30 rounded-md text-sm"
                                >
                                    <span>Previous</span>
                                    <div
                                        class="flex items-center justify-center px-0.75 py-0.5 border border-white/30 rounded leading-none"
                                    >
                                        Shift + P
                                    </div>
                                </div>
                            </Tooltip.Content>
                        </Tooltip.Root>
                    </Tooltip.Provider>
                    <Tooltip.Provider>
                        <Tooltip.Root
                            delayDuration={0}
                            onOpenChange={(state) => {
                                if (
                                    !state &&
                                    $playerEpisode.number !==
                                        $playerAnime.attributes.episodeCount
                                )
                                    return;

                                handleNextPreview();
                            }}
                        >
                            <Tooltip.Trigger>
                                <button
                                    class="relative pl-0.5 py-2 outline-hidden cursor-pointer before:content-[''] before:absolute before:inset-y-1 before:-inset-x-1.5 before:rounded-full hover:before:bg-white/10"
                                    onclick={() => {
                                        if (
                                            $playerEpisode.number ===
                                            $playerAnime.attributes.episodeCount
                                        )
                                            return;

                                        sourceInitialIndex.set(
                                            $playerEpisode.number,
                                        );
                                        nextPreviewImage = "";
                                    }}
                                    aria-label="Forward"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="24px"
                                        viewBox="0 -960 960 960"
                                        width="24px"
                                        fill="currentColor"
                                        class="relative z-1 size-7"
                                        ><path
                                            d="M660-280v-400q0-17 11.5-28.5T700-720q17 0 28.5 11.5T740-680v400q0 17-11.5 28.5T700-240q-17 0-28.5-11.5T660-280Zm-440-35v-330q0-18 12-29t28-11q5 0 11 1t11 5l248 166q9 6 13.5 14.5T548-480q0 10-4.5 18.5T530-447L282-281q-5 4-11 5t-11 1q-16 0-28-11t-12-29Z"
                                        /></svg
                                    >
                                </button>
                            </Tooltip.Trigger>
                            <Tooltip.Content sideOffset={20}>
                                <div
                                    class="flex flex-col items-center gap-y-4 p-2 bg-black/30 rounded-md text-sm"
                                >
                                    <div class="flex items-center gap-1">
                                        <span>Next</span>
                                        <div
                                            class="flex items-center justify-center px-0.75 py-0.5 border border-white/30 rounded leading-none"
                                        >
                                            Shift + N
                                        </div>
                                    </div>
                                    <div
                                        class="h-32 aspect-video flex items-center justify-center"
                                    >
                                        {#if !nextPreviewLoading}
                                            <img
                                                class="h-32 aspect-video rounded shrink-0"
                                                src={nextPreviewImage}
                                                alt=""
                                            />
                                        {:else}
                                            <Spinner />
                                        {/if}
                                    </div>
                                </div>
                            </Tooltip.Content>
                        </Tooltip.Root>
                    </Tooltip.Provider>
                </div>
            {/if}
            <Tooltip.Provider>
                <Tooltip.Root delayDuration={0}>
                    <Tooltip.Trigger>
                        <div
                            class="relative flex items-center bg-black/30 rounded-full px-2 py-2 group hover:pr-3.5 before:content-[''] before:absolute before:inset-1 before:rounded-full hover:before:bg-white/10"
                        >
                            <button
                                class="relative z-1 outline-hidden cursor-pointer size-7"
                                onclick={() => {
                                    handleMuteChange(!isMuted);
                                }}
                            >
                                {#if isMuted || Number(volume) === 0}
                                    <svg
                                        height="24"
                                        viewBox="0 0 24 24"
                                        width="24"
                                        class="absolute inset-0 size-6 m-auto"
                                        transition:fade={{ duration: 150 }}
                                        ><path
                                            d="M11.60 2.08L11.48 2.14L3.91 6.68C3.02 7.21 2.28 7.97 1.77 8.87C1.26 9.77 1.00 10.79 1 11.83V12.16L1.01 12.56C1.07 13.52 1.37 14.46 1.87 15.29C2.38 16.12 3.08 16.81 3.91 17.31L11.48 21.85C11.63 21.94 11.80 21.99 11.98 21.99C12.16 22.00 12.33 21.95 12.49 21.87C12.64 21.78 12.77 21.65 12.86 21.50C12.95 21.35 13 21.17 13 21V3C12.99 2.83 12.95 2.67 12.87 2.52C12.80 2.37 12.68 2.25 12.54 2.16C12.41 2.07 12.25 2.01 12.08 2.00C11.92 1.98 11.75 2.01 11.60 2.08ZM4.94 8.4V8.40L11 4.76V19.23L4.94 15.6C4.38 15.26 3.92 14.80 3.58 14.25C3.24 13.70 3.05 13.07 3.00 12.43L3 12.17V11.83C2.99 11.14 3.17 10.46 3.51 9.86C3.85 9.25 4.34 8.75 4.94 8.4ZM21.29 8.29L19 10.58L16.70 8.29L16.63 8.22C16.43 8.07 16.19 7.99 15.95 8.00C15.70 8.01 15.47 8.12 15.29 8.29C15.12 8.47 15.01 8.70 15.00 8.95C14.99 9.19 15.07 9.43 15.22 9.63L15.29 9.70L17.58 12L15.29 14.29C15.19 14.38 15.12 14.49 15.06 14.61C15.01 14.73 14.98 14.87 14.98 15.00C14.98 15.13 15.01 15.26 15.06 15.39C15.11 15.51 15.18 15.62 15.28 15.71C15.37 15.81 15.48 15.88 15.60 15.93C15.73 15.98 15.86 16.01 15.99 16.01C16.12 16.01 16.26 15.98 16.38 15.93C16.50 15.87 16.61 15.80 16.70 15.70L19 13.41L21.29 15.70L21.36 15.77C21.56 15.93 21.80 16.01 22.05 15.99C22.29 15.98 22.53 15.88 22.70 15.70C22.88 15.53 22.98 15.29 22.99 15.05C23.00 14.80 22.93 14.56 22.77 14.36L22.70 14.29L20.41 12L22.70 9.70C22.80 9.61 22.87 9.50 22.93 9.38C22.98 9.26 23.01 9.12 23.01 8.99C23.01 8.86 22.98 8.73 22.93 8.60C22.88 8.48 22.81 8.37 22.71 8.28C22.62 8.18 22.51 8.11 22.39 8.06C22.26 8.01 22.13 7.98 22.00 7.98C21.87 7.98 21.73 8.01 21.61 8.06C21.49 8.12 21.38 8.19 21.29 8.29Z"
                                            fill="currentColor"
                                        ></path></svg
                                    >
                                {:else}
                                    <svg
                                        height="24"
                                        viewBox="0 0 24 24"
                                        width="24"
                                        class="absolute inset-0 size-6 m-auto"
                                        transition:fade={{ duration: 150 }}
                                        ><path
                                            d="M 11.60 2.08 L 11.48 2.14 L 3.91 6.68 C 3.02 7.21 2.28 7.97 1.77 8.87 C 1.26 9.77 1.00 10.79 1 11.83 V 12.16 L 1.01 12.56 C 1.07 13.52 1.37 14.46 1.87 15.29 C 2.38 16.12 3.08 16.81 3.91 17.31 L 11.48 21.85 C 11.63 21.94 11.80 21.99 11.98 21.99 C 12.16 22.00 12.33 21.95 12.49 21.87 C 12.64 21.78 12.77 21.65 12.86 21.50 C 12.95 21.35 13 21.17 13 21 V 3 C 12.99 2.83 12.95 2.67 12.87 2.52 C 12.80 2.37 12.68 2.25 12.54 2.16 C 12.41 2.07 12.25 2.01 12.08 2.00 C 11.92 1.98 11.75 2.01 11.60 2.08 Z"
                                            fill="currentColor"
                                        ></path><path
                                            d=" M 15.53 7.05 C 15.35 7.22 15.25 7.45 15.24 7.70 C 15.23 7.95 15.31 8.19 15.46 8.38 L 15.53 8.46 L 15.70 8.64 C 16.09 9.06 16.39 9.55 16.61 10.08 L 16.70 10.31 C 16.90 10.85 17 11.42 17 12 L 16.99 12.24 C 16.96 12.73 16.87 13.22 16.70 13.68 L 16.61 13.91 C 16.36 14.51 15.99 15.07 15.53 15.53 C 15.35 15.72 15.25 15.97 15.26 16.23 C 15.26 16.49 15.37 16.74 15.55 16.92 C 15.73 17.11 15.98 17.21 16.24 17.22 C 16.50 17.22 16.76 17.12 16.95 16.95 C 17.6 16.29 18.11 15.52 18.46 14.67 L 18.59 14.35 C 18.82 13.71 18.95 13.03 18.99 12.34 L 19 12 C 18.99 11.19 18.86 10.39 18.59 9.64 L 18.46 9.32 C 18.15 8.57 17.72 7.89 17.18 7.3 L 16.95 7.05 L 16.87 6.98 C 16.68 6.82 16.43 6.74 16.19 6.75 C 15.94 6.77 15.71 6.87 15.53 7.05"
                                            fill="currentColor"
                                            transform="translate(18, 12) scale(1) translate(-18,-12)"
                                        ></path><path
                                            class="transition-transform duration-150"
                                            d="M18.36 4.22C18.18 4.39 18.08 4.62 18.07 4.87C18.05 5.12 18.13 5.36 18.29 5.56L18.36 5.63L18.66 5.95C19.36 6.72 19.91 7.60 20.31 8.55L20.47 8.96C20.82 9.94 21 10.96 21 11.99L20.98 12.44C20.94 13.32 20.77 14.19 20.47 15.03L20.31 15.44C19.86 16.53 19.19 17.52 18.36 18.36C18.17 18.55 18.07 18.80 18.07 19.07C18.07 19.33 18.17 19.59 18.36 19.77C18.55 19.96 18.80 20.07 19.07 20.07C19.33 20.07 19.59 19.96 19.77 19.77C20.79 18.75 21.61 17.54 22.16 16.20L22.35 15.70C22.72 14.68 22.93 13.62 22.98 12.54L23 12C22.99 10.73 22.78 9.48 22.35 8.29L22.16 7.79C21.67 6.62 20.99 5.54 20.15 4.61L19.77 4.22L19.70 4.15C19.51 3.99 19.26 3.91 19.02 3.93C18.77 3.94 18.53 4.04 18.36 4.22 Z"
                                            fill="currentColor"
                                            transform="translate(22, 12) scale({Number(
                                                $settings.player_volume,
                                            ) > 50
                                                ? 1
                                                : 0}) translate(-22, -12)"
                                        ></path></svg
                                    >
                                {/if}
                            </button>
                            <InputSlider
                                bind:value={volume}
                                class="w-0 opacity-0 group-hover:w-16 group-hover:opacity-100 group-hover:ml-2 transition-width duration-250"
                                onChange={(value: number) => {
                                    handleVolumeChange(value);
                                }}
                            />
                        </div>
                    </Tooltip.Trigger>
                    <Tooltip.Content
                        align="start"
                        sideOffset={20}
                        class="-translate-x-1/4"
                    >
                        <div
                            class="flex items-center gap-1 px-2 py-1 bg-black/30 rounded-md text-sm"
                        >
                            <span>Mute</span>
                            <div
                                class="flex items-center justify-center px-0.75 py-0.5 border border-white/30 rounded leading-none"
                            >
                                M
                            </div>
                        </div>
                    </Tooltip.Content>
                </Tooltip.Root>
            </Tooltip.Provider>
            <button
                class="relative flex items-center bg-black/30 rounded-full px-2.5 py-2 text-sm font-semibold before:content-[''] before:absolute before:inset-1 before:rounded-full hover:before:bg-white/10 cursor-pointer outline-hidden"
                onclick={() => (toggleRemainingTime = !toggleRemainingTime)}
            >
                <span class="relative z-1 px-2">
                    {#if toggleRemainingTime && playTime}
                        -{new Date((video.duration - playTime) * 1000)
                            .toISOString()
                            .substring(14, 19)} / {new Date(
                            video.duration * 1000,
                        )
                            .toISOString()
                            .substring(14, 19)}
                    {:else if playTime}
                        {new Date(playTime * 1000)
                            .toISOString()
                            .substring(14, 19)} / {new Date(
                            video.duration * 1000,
                        )
                            .toISOString()
                            .substring(14, 19)}
                    {:else}
                        00:00 / 00:00
                    {/if}
                </span>
            </button>

            <!-- Spacer -->
            <div class="h-0 flex-1"></div>

            <div class="flex gap-2 bg-black/30 rounded-full px-2">
                <Tooltip.Provider>
                    <Tooltip.Root delayDuration={0}>
                        <Tooltip.Trigger class="flex items-center">
                            <button
                                class="relative px-1 outline-hidden cursor-pointer before:content-[''] before:absolute before:-inset-1 before:rounded-full hover:before:bg-white/10"
                                onclick={() =>
                                    playerShowEpisodes.set(
                                        !$playerShowEpisodes,
                                    )}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="24px"
                                    viewBox="0 -960 960 960"
                                    width="24px"
                                    fill="currentColor"
                                    class="relative z-1 size-7"
                                    ><path
                                        d="M160-320q-17 0-28.5-11.5T120-360q0-17 11.5-28.5T160-400h240q17 0 28.5 11.5T440-360q0 17-11.5 28.5T400-320H160Zm0-160q-17 0-28.5-11.5T120-520q0-17 11.5-28.5T160-560h400q17 0 28.5 11.5T600-520q0 17-11.5 28.5T560-480H160Zm0-160q-17 0-28.5-11.5T120-680q0-17 11.5-28.5T160-720h400q17 0 28.5 11.5T600-680q0 17-11.5 28.5T560-640H160Zm511 499q-5 3-10 3t-10-2q-5-2-8-6.5t-3-10.5v-246q0-6 3-10.5t8-6.5q5-2 10-2t10 3l184 122q5 3 7 7.5t2 9.5q0 5-2 9.5t-7 7.5L671-141Z"
                                    /></svg
                                >
                            </button></Tooltip.Trigger
                        >
                        <Tooltip.Content sideOffset={20}>
                            <div
                                class="flex items-center gap-1 px-2 py-1 bg-black/30 rounded-md text-sm"
                            >
                                <span>Playlist</span>
                            </div>
                        </Tooltip.Content>
                    </Tooltip.Root>
                </Tooltip.Provider>
                <Tooltip.Provider>
                    <Tooltip.Root delayDuration={0}>
                        <Tooltip.Trigger class="flex items-center">
                            <button
                                class="relative px-1 outline-hidden cursor-pointer before:content-[''] before:absolute before:-inset-1 before:rounded-full hover:before:bg-white/10"
                                onclick={() => (isMiniPlayer = !isMiniPlayer)}
                            >
                                {#if isMiniPlayer}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="24px"
                                        viewBox="0 -960 960 960"
                                        width="24px"
                                        fill="currentColor"
                                        class="relative z-1 size-7"
                                        ><path
                                            d="M160-160q-33 0-56.5-23.5T80-240v-240q0-17 11.5-28.5T120-520h240q33 0 56.5-23.5T440-600v-160q0-17 11.5-28.5T480-800h320q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm360-400q-17 0-28.5 11.5T480-520v160q0 17 11.5 28.5T520-320q17 0 28.5-11.5T560-360v-63l95 95q12 12 28 12t28-12q12-12 12-28.5T711-385l-95-95h64q17 0 28.5-11.5T720-520q0-17-11.5-28.5T680-560H520Zm-400-40q-17 0-28.5-11.5T80-640v-120q0-17 11.5-28.5T120-800h200q17 0 28.5 11.5T360-760v120q0 17-11.5 28.5T320-600H120Z"
                                        /></svg
                                    >
                                {:else}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="24px"
                                        viewBox="0 -960 960 960"
                                        width="24px"
                                        fill="currentColor"
                                        class="relative z-1 size-7"
                                        ><path
                                            d="M120-520q-17 0-28.5-11.5T80-560q0-17 11.5-28.5T120-600h104L80-743q-12-12-12-28.5T80-800q12-12 28.5-12t28.5 12l143 144v-104q0-17 11.5-28.5T320-800q17 0 28.5 11.5T360-760v200q0 17-11.5 28.5T320-520H120Zm40 360q-33 0-56.5-23.5T80-240v-160q0-17 11.5-28.5T120-440q17 0 28.5 11.5T160-400v160h280q17 0 28.5 11.5T480-200q0 17-11.5 28.5T440-160H160Zm680-280q-17 0-28.5-11.5T800-480v-240H480q-17 0-28.5-11.5T440-760q0-17 11.5-28.5T480-800h320q33 0 56.5 23.5T880-720v240q0 17-11.5 28.5T840-440ZM600-160q-17 0-28.5-11.5T560-200v-120q0-17 11.5-28.5T600-360h240q17 0 28.5 11.5T880-320v120q0 17-11.5 28.5T840-160H600Z"
                                        /></svg
                                    >
                                {/if}
                            </button>
                        </Tooltip.Trigger>
                        <Tooltip.Content sideOffset={20}>
                            <div
                                class="flex items-center gap-1 px-2 py-1 bg-black/30 rounded-md text-sm"
                            >
                                <span>MiniPlayer</span>
                                <div
                                    class="flex items-center justify-center px-0.75 py-0.5 border border-white/30 rounded leading-none"
                                >
                                    T
                                </div>
                            </div>
                        </Tooltip.Content>
                    </Tooltip.Root>
                </Tooltip.Provider>
                <Tooltip.Provider>
                    <Tooltip.Root delayDuration={0}>
                        <Tooltip.Trigger class="flex items-center">
                            <button
                                class="relative px-1 outline-hidden cursor-pointer before:content-[''] before:absolute before:-inset-1 before:rounded-full hover:before:bg-white/10"
                                onclick={handleFullscreen}
                            >
                                {#if isFullscreen}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="24px"
                                        viewBox="0 -960 960 960"
                                        width="24px"
                                        fill="currentColor"
                                        class="relative z-1 size-7"
                                        ><path
                                            d="M400-344 164-108q-11 11-28 11t-28-11q-11-11-11-28t11-28l236-236H200q-17 0-28.5-11.5T160-440q0-17 11.5-28.5T200-480h240q17 0 28.5 11.5T480-440v240q0 17-11.5 28.5T440-160q-17 0-28.5-11.5T400-200v-144Zm216-216h144q17 0 28.5 11.5T800-520q0 17-11.5 28.5T760-480H520q-17 0-28.5-11.5T480-520v-240q0-17 11.5-28.5T520-800q17 0 28.5 11.5T560-760v144l236-236q11-11 28-11t28 11q11 11 11 28t-11 28L616-560Z"
                                        /></svg
                                    >
                                {:else}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        height="24px"
                                        viewBox="0 -960 960 960"
                                        width="24px"
                                        fill="currentColor"
                                        class="relative z-1 size-7"
                                        ><path
                                            d="M160-120q-17 0-28.5-11.5T120-160v-240q0-17 11.5-28.5T160-440q17 0 28.5 11.5T200-400v144l504-504H560q-17 0-28.5-11.5T520-800q0-17 11.5-28.5T560-840h240q17 0 28.5 11.5T840-800v240q0 17-11.5 28.5T800-520q-17 0-28.5-11.5T760-560v-144L256-200h144q17 0 28.5 11.5T440-160q0 17-11.5 28.5T400-120H160Z"
                                        /></svg
                                    >
                                {/if}
                            </button>
                        </Tooltip.Trigger>
                        <Tooltip.Content sideOffset={20} class="mr-3">
                            <div
                                class="flex items-center gap-1 px-2 py-1 bg-black/30 rounded-md text-sm"
                            >
                                <span>Fullscreen</span>
                                <div
                                    class="flex items-center justify-center px-0.75 py-0.5 border border-white/30 rounded leading-none"
                                >
                                    F
                                </div>
                            </div>
                        </Tooltip.Content>
                    </Tooltip.Root>
                </Tooltip.Provider>
            </div>
        </div>
    </div>
{/if}
