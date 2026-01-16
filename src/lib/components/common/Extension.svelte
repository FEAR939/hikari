<script lang="ts">
    import { Switch } from "bits-ui";

    let { extension } = $props();

    let isEnabled = $state(
        JSON.parse(localStorage.getItem("extensions") || "[]")?.find(
            (ext) => ext.id === extension.github,
        )?.enabled ?? true,
    );

    $effect(() => {
        if (isEnabled !== null) {
            const exts = JSON.parse(localStorage.getItem("extensions") || "[]");
            const ext = exts.find((ext) => ext.id === extension.github);

            if (!ext) {
                localStorage.setItem(
                    "extensions",
                    JSON.stringify([
                        ...exts,
                        {
                            id: extension.github,
                            enabled: isEnabled,
                        },
                    ]),
                );
            } else {
                ext.enabled = isEnabled;
                localStorage.setItem("extensions", JSON.stringify(exts));
            }
        }
    });
</script>

<div class="relative p-4 h-fit rounded-2xl bg-gray-950 border border-gray-900">
    <div class="flex items-center">
        <img src={extension.icon} alt={extension.name} class="size-8 mr-2" />
        <div>
            <div class="leading-none">{extension.name}</div>
        </div>
    </div>
    <div class="min-h-6 flex space-x-2 pt-4">
        <div
            class="h-full flex items-center px-3 py-0.5 rounded-full bg-gray-900"
        >
            {extension.version}
        </div>
        <div
            class="h-full flex items-center px-3 py-0.5 rounded-full bg-gray-900"
        >
            {extension.type}
        </div>
    </div>
    <button
        class="absolute right-4 top-4 size-4 cursor-pointer text-red-500 outline-hidden"
        aria-label="Remove Extension"
        onclick={async () => {
            await window.electronAPI?.removeExtension(extension.name);
        }}
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-trash2-icon lucide-trash-2 size-4"
        >
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    </button>
    <Switch.Root
        bind:checked={isEnabled}
        class="absolute bottom-4 right-4 bg-black data-[state=checked]:bg-white peer inline-flex h-6 min-h-6 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors"
    >
        <Switch.Thumb
            class="bg-white data-[state=checked]:bg-black pointer-events-none block size-4 shrink-0 rounded-full transition-transform data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-1"
        />
    </Switch.Root>
</div>
