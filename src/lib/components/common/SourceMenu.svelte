<script lang="ts">
    import { DropdownMenu } from "bits-ui";
    import { fade } from "svelte/transition";

    let {
        show = $bindable(false),
        children,
        onChange,
        onCreateSourceFolder,
    } = $props();
</script>

<DropdownMenu.Root
    bind:open={show}
    onOpenChange={(state) => {
        onChange?.(state);
    }}
>
    <DropdownMenu.Trigger>
        {@render children()}
    </DropdownMenu.Trigger>
    <DropdownMenu.Content sideOffset={8} forceMount class="z-9999">
        {#if show}
            <div
                class="w-[260px] px-1 py-1 rounded-2xl border border-gray-100 dark:border-gray-900 z-50 bg-white dark:bg-black/70 dark:text-white shadow-lg text-sm backdrop-blur-2xl"
                transition:fade={{ duration: 100 }}
            >
                <DropdownMenu.Item
                    class="flex rounded-xl py-1.5 px-3 w-full hover:bg-gray-50 dark:hover:bg-white/10 transition cursor-pointer"
                    onclick={() => onCreateSourceFolder?.()}
                >
                    <div class=" self-center mr-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="currentColor"
                            class="size-5"
                            ><path
                                d="M440-440H240q-17 0-28.5-11.5T200-480q0-17 11.5-28.5T240-520h200v-200q0-17 11.5-28.5T480-760q17 0 28.5 11.5T520-720v200h200q17 0 28.5 11.5T760-480q0 17-11.5 28.5T720-440H520v200q0 17-11.5 28.5T480-200q-17 0-28.5-11.5T440-240v-200Z"
                            /></svg
                        >
                    </div>
                    <div class="self-center truncate">Create Source Folder</div>
                </DropdownMenu.Item>
            </div>
        {/if}
    </DropdownMenu.Content>
</DropdownMenu.Root>
