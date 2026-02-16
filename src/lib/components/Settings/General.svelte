<script lang="ts">
    import { defaultSettings, settings } from "$lib/stores";
    import { Select } from "bits-ui";

    const languages = [
        {
            value: "en-US",
            label: "English",
        },
        {
            value: "de-DE",
            label: "Deutsch",
        },
    ];

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
                    class="w-48 px-5 py-2 text-xs bg-white/5 border border-white/10 rounded-full flex items-center justify-between hover:bg-[#2a2a2a] transition-colors outline-hidden"
                >
                    <span class="truncate"
                        >{languages.find((l) => l.value === lang)?.label}</span
                    >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="currentColor"
                        class="size-6"
                        ><path
                            d="M459-381 314-526q-3-3-4.5-6.5T308-540q0-8 5.5-14t14.5-6h304q9 0 14.5 6t5.5 14q0 2-6 14L501-381q-5 5-10 7t-11 2q-6 0-11-2t-10-7Z"
                        /></svg
                    >
                </Select.Trigger>
                <Select.Content
                    class="w-48 py-2 z-50 bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg"
                    sideOffset={4}
                >
                    {#each languages as lang}
                        <Select.Item
                            value={lang.value}
                            class="px-5 py-2 text-xs cursor-pointer text-white hover:bg-[#252525] data-[highlighted]:bg-[#252525] outline-none"
                        >
                            {lang.label}
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
