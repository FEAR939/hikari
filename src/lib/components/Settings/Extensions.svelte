<script lang="ts">
    import { onMount } from "svelte";
    import Extension from "../common/Extension.svelte";

    let installURL = "";
    let extensions = $state([]);

    async function load_extensions() {
        const loadedExtensions = await window.electronAPI?.loadExtensions();
        for (const extension of loadedExtensions) {
            const data = await window.electronAPI.readFileBinary(
                `${extension.path}/icon.png`,
            );
            if (data) {
                const blob = new Blob([data], { type: "image/png" });
                const imageUrl = URL.createObjectURL(blob);
                extension.icon = imageUrl;
            }
        }

        extensions = loadedExtensions;
    }

    onMount(async () => {
        await load_extensions();
    });
</script>

<div class="h-full w-full space-y-4">
    <div class="flex h-fit w-full space-x-2">
        <div
            class="flex items-center space-x-2 px-4 h-10 w-full bg-gray-950 text-white border border-gray-900 rounded-full"
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
                class="lucide lucide-link2-icon lucide-link-2 size-4"
            >
                <path d="M9 17H7A5 5 0 0 1 7 7h2" />
                <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
                <line x1="8" x2="16" y1="12" y2="12" />
            </svg>
            <input
                type="text"
                placeholder="Extension URL from GitHub"
                bind:value={installURL}
                class="w-full py-2 border-none outline-none leading-none"
            />
        </div>
        <button
            class="w-1/3 px-4 py-2 flex items-center justify-center text-black bg-neutral-200 hover:bg-neutral-400 rounded-full cursor-pointer space-x-2 outline-hidden transition-colors duration-150"
            onclick={async () => {
                const url = installURL;
                if (!url || !url.match(/https:\/\/github\.com\/.*\.git/))
                    return;
                if (!localStorage.getItem("extensions.config")) {
                    localStorage.setItem(
                        "extensions.config",
                        JSON.stringify([]),
                    );
                }
                console.log("Installing extension:", url);
                const extension =
                    await window.electronAPI?.installExtension(url);
                const extensionsConfig = JSON.parse(
                    localStorage.getItem("extensions.config") || "[]",
                );
                extensionsConfig.push({ id: extension.github, enabled: true });
                load_extensions();
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
                class="lucide lucide-download-icon lucide-download size-4"
            >
                <path d="M12 15V3" />
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="m7 10 5 5 5-5" />
            </svg>
            <div>Install Extension</div>
        </button>
    </div>
    <div class="w-full h-fit space-y-2 mt-4">
        {#if extensions.length > 0}
            {#each extensions as extension}
                <Extension {extension} />
            {/each}
        {:else}
            <div
                class="w-full py-8 flex flex-col items-center justify-center space-y-1"
            >
                <div class="text-3xl">😕</div>
                <div class="text-lg">No Extensions found</div>
                <div class="text-neutral-500 text-xs">
                    Try installing extensions, they will be listed here
                    afterwards.
                </div>
            </div>
        {/if}
    </div>
</div>
