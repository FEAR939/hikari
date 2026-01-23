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
    <div class="text-xl font-bold!">Client Settings</div>
    {#each clientsettings as setting}
        <div
            class="h-fit w-full p-4 space-y-2 border border-white/10 rounded-2xl"
        >
            <div class="h-fit w-full space-y-1">
                <div class="text-white text-sm font-bold!">{setting.name}</div>
                <div class="text-neutral-400 text-xs">
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
                        class="px-4 py-2 h-fit w-96 bg-gray-900 text-neutral-300 rounded-xl leading-none text-sm placeholder:text-sm outline-none"
                    />
                {/if}
            </div>
        </div>
    {/each}
</div>
