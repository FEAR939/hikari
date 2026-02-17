<script lang="ts">
    import { DropdownMenu } from "bits-ui";
    import { goto } from "$app/navigation";

    import { notifications } from "$lib/stores";
    import { fade } from "svelte/transition";

    let { show = $bindable(false), children } = $props();
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
                class="w-[260px] px-1 py-1 rounded-2xl border border-gray-100 dark:border-gray-900 z-50 bg-white dark:bg-black/70 dark:text-white shadow-lg text-sm backdrop-blur-2xl"
                transition:fade={{ duration: 100 }}
            >
                {#each $notifications as notification}
                    <DropdownMenu.Item
                        class="flex rounded-xl py-1.5 px-3 w-full hover:bg-gray-50 dark:hover:bg-white/10 focus:bg-white/10 transition cursor-pointer outline-hidden"
                        onclick={async () => {
                            // show = false;
                            // TODO!
                        }}
                    >
                        <div class="self-center truncate">
                            {notification.title}
                        </div>
                    </DropdownMenu.Item>
                {/each}
            </div>
        {/if}
    </DropdownMenu.Content>
</DropdownMenu.Root>
