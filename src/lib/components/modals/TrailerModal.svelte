<script lang="ts">
    import Modal from "../common/Modal.svelte";

    let { show = $bindable(false), anime } = $props();

    let frame: HTMLIFrameElement | null = $state(null);
    let timeout: ReturnType<typeof setInterval> | null = null;

    function initFrame() {
        if (!frame) return;

        timeout = setInterval(() => {
            frame?.contentWindow?.postMessage(
                '{"event":"listening","id":1,"channel":"widget"}',
                "*",
            );
        }, 100);

        frame.contentWindow?.postMessage(
            '{"event":"listening","id":1,"channel":"widget"}',
            "*",
        );
    }

    function handleYouTubeMessage(e: MessageEvent) {
        if (e.origin !== "https://www.youtube-nocookie.com") return;
        if (timeout) {
            clearInterval(timeout);
            timeout = null;
        }
    }
</script>

<Modal
    bind:show
    classModal="relative w-full aspect-video max-w-3xl rounded-2xl overflow-hidden p-0 border-none"
>
    <button
        aria-label="Close settings modal"
        class="absolute z-1 right-4 top-4 self-center cursor-pointer text-white"
        onclick={() => {
            show = false;
        }}
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-x size-5"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    </button>
    {#if anime.attributes.youtubeVideoId}
        <div class="absolute top-0 w-full h-full overflow-clip">
            <iframe
                bind:this={frame}
                src="https://www.youtube-nocookie.com/embed/{anime.attributes
                    .youtubeVideoId}?autoplay=1&controls=0&mute=0&disablekb=1&cc_lang_pref=ja"
                title="Trailer"
                class="w-full border-0 left-0 h-[calc(100%+200px)] pointer-events-none absolute top-1/2 transform-gpu -translate-y-1/2"
                frameborder="0"
                allow="autoplay; encrypted-media"
                onload={initFrame}
            ></iframe>
        </div>
    {/if}
</Modal>
