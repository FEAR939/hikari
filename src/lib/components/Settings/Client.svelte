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
        <div class="h-fit w-full space-y-2 flex">
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
                        class="w-96 px-5 py-3 text-xs bg-white/5 border border-white/10 rounded-full text-neutral-300 leading-none placeholder:text-sm outline-none"
                    />
                {/if}
            </div>
        </div>
    {/each}
</div>
