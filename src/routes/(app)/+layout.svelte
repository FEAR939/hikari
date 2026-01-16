<script lang="ts">
    import Topbar from "$lib/components/common/Topbar.svelte";
    import SettingsModal from "$lib/components/modals/SettingsModal.svelte";

    import { showTopbar, showSettings } from "$lib/stores";

    let { children } = $props();
</script>

<SettingsModal bind:show={$showSettings} />

<div class="relative h-full w-full">
    <Topbar bind:show={$showTopbar}></Topbar>

    <div class="h-full w-full bg-black overflow-y-scroll">
        {@render children?.()}
    </div>
</div>
