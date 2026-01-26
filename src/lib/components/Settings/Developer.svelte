<script lang="ts">
    import { settings } from "$lib/stores";

    let developerSettings = [
        {
            name: "Open Developer Tools",
            description: "Open the developer tools.",
            type: "button",
            category: "Debug",
            storageKey: null,
            onchange: null,
            onclick: () => {
                window.electronAPI?.openDevTools();
            },
            newValue: null,
            default: "Open Devtools",
        },
        {
            name: "Clear Application Cache",
            description: "Clear the application cache.",
            type: "button",
            category: "Debug",
            storageKey: null,
            onchange: null,
            onclick: () => {
                localStorage.clear();
            },
            newValue: null,
            default: "Clear Cache",
        },
    ];
</script>

<div class="h-full w-full space-y-4 overflow-y-scroll">
    <div class="text-xl font-bold!">Developer Settings</div>
    {#each developerSettings as setting}
        <div
            class="h-fit w-full gap-y-2 p-4 border border-white/10 rounded-2xl flex"
        >
            <div class="h-fit w-full space-y-1">
                <div class="text-white font-bold! text-sm">{setting.name}</div>
                <div class="text-neutral-500 text-xs">
                    {setting.description}
                </div>
            </div>
            <div class="flex items-center">
                {#if setting.type === "button"}
                    <button
                        class="px-4 py-2 w-fit text-sm bg-neutral-200 hover:bg-neutral-400 text-black rounded-full cursor-pointer transition-colors duration-150 text-nowrap outline-hidden"
                        onclick={() => {
                            setting.onclick?.();
                        }}
                    >
                        {setting.default}
                    </button>
                {/if}
            </div>
        </div>
    {/each}
</div>
