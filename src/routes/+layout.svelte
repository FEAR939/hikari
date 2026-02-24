<script lang="ts">
    import "./layout.css";
    import Sidebar from "$lib/components/common/Sidebar.svelte";
    import {
        showPlayer,
        user,
        notifications,
        notificationsSyncPoint,
    } from "$lib/stores";
    import { goto } from "$app/navigation";
    import Player from "$lib/components/common/Player.svelte";
    import { Toaster, toast } from "svelte-sonner";
    import { getAPIClient } from "$lib/api";
    import { untrack } from "svelte";

    let { children } = $props();

    const API = getAPIClient();

    let updatePromise: Promise<void> | null = null;
    let resolveUpdate: (() => void) | null = null;
    let rejectUpdate: (() => void) | null = null;

    window.electronAPI.onUpdateAvailable((version) => {
        updatePromise = new Promise((reject, resolve) => {
            resolveUpdate = resolve;
            rejectUpdate = reject;
        });

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

    let interval: ReturnType<typeof setInterval> | null = null;

    async function pollNewNotifications() {
        if (!$user) return;
        const API = getAPIClient();
        const result = await API.getNewNotifications($notificationsSyncPoint);

        if (result.notifications.length > 0) {
            notifications.update((current) => {
                const existingIds = new Set(current.map((n) => n.id));
                const newOnly = result.notifications.filter(
                    (n) => !existingIds.has(n.id),
                );
                return [...newOnly, ...current];
            });
        }

        notificationsSyncPoint.set(result.syncedAt);
    }

    $effect(() => {
        const currentUser = $user; // only reactive dependency

        untrack(() => {
            if (interval) clearInterval(interval);

            if (currentUser) {
                pollNewNotifications();
                interval = setInterval(pollNewNotifications, 10 * 60 * 1000);
            }
        });

        return () => {
            if (interval) clearInterval(interval);
        };
    });
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
