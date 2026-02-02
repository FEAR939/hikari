<script lang="ts">
    import { defaultSettings, settings } from "$lib/stores";
    import { Select } from "bits-ui";

    const languages = ["en-US", "de-DE"];

    let lang = $state($settings["language"]);
</script>

<div class="h-full w-full space-y-4 overflow-y-scroll">
    <div class="text-xl font-bold!">General Settings</div>
    <div class="h-fit w-full p-4 space-y-2 border border-white/10 rounded-2xl">
        <div class="h-fit w-full space-y-1">
            <div class="text-white text-sm font-bold!">Language</div>
            <div class="text-neutral-400 text-xs">
                Change the language of the application. (Only News currently
                supported)
            </div>
        </div>
        <div class="flex items-center">
            <Select.Root
                type="single"
                value={$settings["language"]}
                onValueChange={(value) => {
                    if (value) {
                        lang = value;
                        settings.setSetting("language", value);
                    }
                }}
            >
                <Select.Trigger
                    class="w-24 h-7 px-2 text-xs bg-gray-900 border border-gray-850 rounded-lg flex items-center justify-between hover:bg-[#2a2a2a] transition-colors"
                >
                    <span class="truncate">{lang}</span>
                    <svg
                        class="size-3 shrink-0 ml-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M6 9L12 15L18 9"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
                </Select.Trigger>
                <Select.Content
                    class="z-50 bg-gray-900 border border-gray-850 rounded-lg overflow-hidden shadow-lg"
                    sideOffset={4}
                >
                    {#each languages as value}
                        <Select.Item
                            {value}
                            class="px-3 py-1.5 text-xs cursor-pointer text-white hover:bg-[#252525] data-[highlighted]:bg-[#252525] outline-none"
                        >
                            {value}
                        </Select.Item>
                    {/each}
                </Select.Content>
            </Select.Root>
            <!-- {#if false === "input"}
                <input
                    type="text"
                    value={$settings[setting.storageKey]}
                    placeholder={defaultSettings[setting.storageKey]}
                    oninput={(e) => {}}
                    class="px-4 py-2 h-fit w-96 bg-gray-900 text-neutral-300 rounded-xl leading-none text-sm placeholder:text-sm outline-none"
                />
            {/if} -->
        </div>
    </div>
</div>
