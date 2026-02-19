<script lang="ts">
    import Topbar from "$lib/components/common/Topbar.svelte";
    import SettingsModal from "$lib/components/modals/SettingsModal.svelte";

    import { pageScrollPosition, showTopbar, showSettings } from "$lib/stores";

    let { children } = $props();

    function handleScroll(event: Event) {
        const target = event.target as HTMLElement;
        pageScrollPosition.set(target.scrollTop);
    }
</script>

<SettingsModal bind:show={$showSettings} />

<div class="relative h-full w-full">
    <Topbar bind:show={$showTopbar}></Topbar>

    <div
        class="h-full w-full bg-black overflow-y-scroll"
        onscroll={handleScroll}
    >
        {@render children?.()}
    </div>
</div>
