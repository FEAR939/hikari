<script lang="ts">
    import "./layout.css";
    import Sidebar from "$lib/components/common/Sidebar.svelte";
    import { showPlayer } from "$lib/stores";
    import { goto } from "$app/navigation";
    import Player from "$lib/components/common/Player.svelte";
    import { Toaster, toast } from "svelte-sonner";

    let { children } = $props();

    let updatePromise: Promise<void> | null = null;
    let resolveUpdate: (() => void) | null = null;
    let rejectUpdate: (() => void) | null = null;

    window.electronAPI.onUpdateAvailable((version) => {
        updatePromise = new Promise((reject, resolve) => {
            resolveUpdate = resolve;
            rejectUpdate = reject;
        });
        console.log(`New version available: ${version}`);

        toast.promise(updatePromise, {
            loading: `New version available: ${version}. Downloading...`,
            success: `Version ${version} downloaded successfully. Restart to apply.`,
            error: "Failed to download update.",
        });
    });

    window.electronAPI.onUpdateDownloaded((version) => {
        resolveUpdate?.();
    });

    goto("/home");
</script>

<svelte:head></svelte:head>

<Player bind:show={$showPlayer}></Player>

<div class="flex h-screen antialiased text-neutral-200 font-medium">
    <Sidebar />

    <div class="w-full max-w-[calc(100vw-3.5rem)]">
        {@render children?.()}
    </div>
</div>

<Toaster theme="dark" position="top-center" closeButton />
