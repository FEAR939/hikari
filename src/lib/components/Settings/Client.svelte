<script lang="ts">
    import { defaultSettings, settings } from "$lib/stores";
    const clientsettings = [
        {
            name: "Media on this device",
            description: "Where media is stored on this device",
            type: "input",
            storageKey: "media_storage_path",
        },
        {
            name: "API Server",
            description: "The server to connect to",
            type: "input",
            storageKey: "api_server",
        },
    ];
</script>

<div class="h-full w-full space-y-4 overflow-y-scroll">
    <div class="text-xl">Client Settings</div>
    {#each clientsettings as setting}
        <div
            class="bg-gray-950 border border-gray-900 rounded-2xl h-fit w-full p-4 flex gap-2"
        >
            <div class="h-fit w-full space-y-1">
                <div class="text-neutral-200 text-sm">{setting.name}</div>
                <div class="text-neutral-500 text-xs">
                    {setting.description}
                </div>
            </div>
            <div class="flex items-center">
                {#if setting.type === "input"}
                    <input
                        type="text"
                        value={$settings[setting.storageKey]}
                        placeholder={defaultSettings[setting.storageKey]}
                        oninput={(e) => {
                            settings.setSetting(
                                setting.storageKey,
                                e.target.value || "",
                            );
                        }}
                        class="px-4 py-2 h-fit w-64 bg-gray-850 text-neutral-300 rounded-full leading-none text-sm placeholder:text-sm outline-none"
                    />
                {/if}
            </div>
        </div>
    {/each}
</div>
