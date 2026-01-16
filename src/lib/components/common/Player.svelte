<script lang="ts">
    import {
        visibleEpisodes,
        currentAnime,
        playerAnime,
        playerEpisode,
        playerSources,
        playerSourceIndex,
        user,
        showTopbar,
        playerShowEpisodes,
    } from "$lib/stores";
    import PlayerControls from "./PlayerControls.svelte";
    import { getAPIClient } from "$lib/api";
    import { fade } from "svelte/transition";
    import PlayerEpisodeView from "./PlayerEpisodeView.svelte";
    const API = getAPIClient();

    let { show = $bindable(true) } = $props();
    let currentSource = $state("");

    let playerElement: HTMLElement | null = $state(null);
    let videoElement: HTMLVideoElement | null = $state(null);

    let showOverlay = $state(true);
    let isMiniPlayer = $state(false);

    $effect(() => {
        if (show && playerElement!) {
            document.body.appendChild(playerElement);

            console.log({
                currentAnime: $currentAnime,
                playerAnime: $playerAnime,
                playerEpisode: $playerEpisode,
                playerSources: $playerSources,
                playerSourceIndex: $playerSourceIndex,
            });

            const source = $playerSources?.[$playerSourceIndex!];

            function create(url: string, headers = {}) {
                const headersBase64 = btoa(JSON.stringify(headers));
                const encodedUrl = encodeURIComponent(url);
                return `mediaproxy://video?url=${encodedUrl}&headers=${headersBase64}`;
            }

            const proxiedUrl = create(source?.file_url, source?.headers);

            if ($user) {
                (async () => {
                    const leftoffEntry = await API.getLeftoff({
                        kitsu_id: parseInt($playerAnime?.id),
                        ident: $playerEpisode?.number,
                    });
                    if (leftoffEntry.length > 0) {
                        videoElement!.currentTime = leftoffEntry[0].leftoff;
                    }
                })();
            }

            currentSource = proxiedUrl;

            return () => {
                syncProgress();
                showTopbar.set(true);
                if (playerElement?.parentElement === document.body) {
                    document.body.removeChild(playerElement);
                }
            };
        }
    });

    async function syncProgress() {
        if (!$user || !videoElement!) return;
        const currentTime = videoElement.currentTime;

        // Sync with server
        API.setLeftoff({
            kitsu_id: parseInt($playerAnime?.id),
            episode: $playerEpisode?.number,
            leftoff: Math.floor(currentTime),
        });

        // Only Sync with visible Episodes in EpisodeView if it's still the same anime
        if ($playerAnime?.id !== $currentAnime?.anime.id) return;
        visibleEpisodes.update((episodes) => {
            const updatedEpisodes = episodes.map((episode) => {
                if (episode.attributes.number === $playerEpisode?.number) {
                    return { ...episode, leftoff: Math.floor(currentTime) };
                }
                return episode;
            });
            return updatedEpisodes;
        });
    }

    let timeout: NodeJS.Timeout | null = null;

    function handleMouseMove() {
        if (!playerElement) return;
        showOverlay = true;
        playerElement.style.cursor = "default";
        showTopbar.set(true);
        if (!show || videoElement?.paused) return;
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            if (!show || videoElement?.paused || !playerElement) return;
            showOverlay = false;
            playerElement.style.cursor = "none";
            if (isMiniPlayer) return;
            showTopbar.set(false);
        }, 3000);
    }
</script>

<svelte:window onmousemove={handleMouseMove} />

{#if show}
    <div
        bind:this={playerElement}
        aria-modal="true"
        role="dialog"
        class={!isMiniPlayer
            ? "fixed bottom-0 right-0 bg-black w-full h-screen max-h-[100dvh] z-1111 transition-all duration-250 transform-gpu"
            : "fixed bottom-4 right-4 w-lg h-[calc(32rem*(9/16))] bg-black z-1111 rounded-2xl overflow-hidden transition-all duration-250 transform-gpu"}
    >
        <div class="relative h-full w-full">
            {#if showOverlay}
                <button
                    class="relative z-2222 top-3 left-3 p-2 bg-black/30 rounded-full outline-hidden cursor-pointer before:content-[''] before:absolute before:inset-1 before:rounded-full hover:before:bg-white/10 text-white"
                    aria-label="Close"
                    onclick={() => (show = false)}
                    transition:fade={{ duration: 100 }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="currentColor"
                        class="relative z-1 size-7"
                        ><path
                            d="M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z"
                        /></svg
                    >
                </button>
            {/if}
            <video
                src={currentSource}
                autoplay
                class="absolute inset-0 h-full w-full"
                bind:this={videoElement}
                onmousedown={() =>
                    videoElement?.paused
                        ? [videoElement?.play(), handleMouseMove()]
                        : videoElement?.pause()}
                onpause={handleMouseMove}
                onplay={handleMouseMove}
            ></video>
            {#if videoElement}
                <PlayerControls
                    video={videoElement}
                    episodeNumber={$playerEpisode?.number}
                    episodeTitle={$playerEpisode?.title}
                    bind:show={showOverlay}
                    bind:isMiniPlayer
                />
                <PlayerEpisodeView bind:show={$playerShowEpisodes} />
            {/if}
        </div>
    </div>
{/if}
