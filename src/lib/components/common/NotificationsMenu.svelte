<script lang="ts">
    import { DropdownMenu } from "bits-ui";
    import { user, notifications, notificationsToDisplay } from "$lib/stores";
    import { fade } from "svelte/transition";
    import Notification from "./Notification.svelte";
    import {
        loadNextPage,
        markNotificationsRead,
        resetPagination,
        loading,
        hasMore,
    } from "$lib/notifications";
    import { untrack } from "svelte";
    import Spinner from "./Spinner.svelte";

    let { show = $bindable(false), children } = $props();
    let wasOpen = false;
    let sentinel: HTMLDivElement = $state(null);

    const unread = $derived($notifications.filter((n) => !n.read).length);

    $effect(() => {
        const isOpen = show;

        untrack(() => {
            if (!$user) {
                resetPagination();
                notifications.set([]);
                notificationsToDisplay.set([]);
            }

            if (isOpen && !wasOpen && $user) {
                resetPagination();
                loadNextPage();
            }

            if (!isOpen && wasOpen && $user && unread > 0) {
                markNotificationsRead();
            }

            wasOpen = isOpen;
        });
    });

    // Intersection observer to detect when user scrolls to bottom
    $effect(() => {
        if (!show || !sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    !$loading &&
                    $hasMore &&
                    $user
                ) {
                    console.log("Sentinel visible, loading next page");
                    loadNextPage();
                }
            },
            { threshold: 0.1 },
        );

        observer.observe(sentinel);

        return () => observer.disconnect();
    });
</script>

<DropdownMenu.Root bind:open={show}>
    <DropdownMenu.Trigger class="group/notificationsmenu outline-hidden">
        {@render children()}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content
        sideOffset={4}
        align="center"
        forceMount
        class="outline-hidden"
    >
        {#if show}
            <div
                class="w-sm rounded-2xl border border-gray-100 dark:border-gray-900 z-50 bg-white dark:bg-black/70 dark:text-white shadow-lg text-sm backdrop-blur-2xl"
                transition:fade={{ duration: 100 }}
            >
                <div class="py-1.5 px-3 border-b border-white/10">
                    <div class="text-lg font-semibold!">Notifications</div>
                </div>

                <div class="max-h-96 overflow-y-auto px-1 py-1">
                    {#each $notificationsToDisplay as notification (notification.id)}
                        <DropdownMenu.Item class="outline-hidden">
                            <Notification {notification} />
                        </DropdownMenu.Item>
                    {/each}

                    <!-- Sentinel element at the bottom -->
                    {#if $hasMore && $user}
                        <div
                            bind:this={sentinel}
                            class="py-3 text-center text-gray-400 text-xs"
                        >
                            {#if $loading}
                                <Spinner />
                            {:else}
                                No more notifications
                            {/if}
                        </div>
                    {:else if !$hasMore && $notificationsToDisplay.length > 0 && $user}
                        <div class="py-3 text-center text-gray-400 text-xs">
                            No more notifications
                        </div>
                    {:else if !$loading && $notificationsToDisplay.length === 0 && $user}
                        <div class="py-6 text-center text-gray-400">
                            No notifications yet
                        </div>
                    {:else if !$user}
                        <div class="py-6 text-center text-gray-400">
                            Please log in to view notifications
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
    </DropdownMenu.Content>
</DropdownMenu.Root>
