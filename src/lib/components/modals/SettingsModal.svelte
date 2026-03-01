<script lang="ts">
    import Modal from "../common/Modal.svelte";
    import Client from "../Settings/Client.svelte";
    import Extensions from "../Settings/Extensions.svelte";
    import Developer from "../Settings/Developer.svelte";
    import Account from "../Settings/Account.svelte";
    import About from "../Settings/About.svelte";
    import General from "../Settings/General.svelte";

    let { show = $bindable(false) } = $props();

    let query = $state("");

    const settingsCategories = [
        {
            id: "general",
            label: "General",
            keywords: ["language"],
        },
        {
            id: "client",
            label: "Client",
            keywords: ["local", "media", "api", "server"],
        },
        {
            id: "extensions",
            label: "Extensions",
            keywords: ["install", "update", "remove"],
        },
        {
            id: "developer",
            label: "Developer",
            keywords: ["dev", "devtools", "debug", "cache"],
        },
        {
            id: "account",
            label: "Account",
            keywords: ["profile"],
        },
        {
            id: "about",
            label: "About",
            keywords: ["version", "github"],
        },
    ];

    let filteredCategories = $state([]);

    let activeCategory = $derived(
        filteredCategories[0] ?? settingsCategories[0],
    );

    $effect(() => {
        filteredCategories = settingsCategories.filter(
            (category) =>
                category.label.toLowerCase().includes(query.toLowerCase()) ||
                category.keywords.some((keyword) =>
                    keyword.toLowerCase().includes(query.toLowerCase()),
                ),
        );
    });
</script>

<Modal bind:show class="z-3333">
    <div class="text-gray-700 dark:text-gray-100 mx-1">
        <div
            class=" flex justify-between dark:text-gray-300 px-4 md:px-4.5 pt-4.5 pb-0.5 md:pb-2.5"
        >
            <div class=" text-lg font-medium self-center">Settings</div>
            <button
                aria-label="Close settings modal"
                class="self-center cursor-pointer"
                onclick={() => {
                    show = false;
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
                    class="lucide lucide-x size-4"
                >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                </svg>
            </button>
        </div>

        <div class="flex flex-col md:flex-row w-full pt-1 pb-4">
            <div
                role="tablist"
                class="tabs flex flex-row overflow-x-auto gap-2.5 mx-3 md:pr-4 md:gap-1 md:flex-col flex-1 md:flex-none md:w-50 md:min-h-[42rem] md:max-h-[42rem] dark:text-gray-200 text-sm text-left mb-1 md:mb-0 -translate-y-1"
            >
                <div
                    class="hidden md:flex w-full rounded-full px-2.5 gap-2 border border-white/10 my-1 mb-1.5"
                >
                    <div class="self-center rounded-l-xl bg-transparent">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                            stroke-width="1.5"
                            class="size-3.5"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                            ></path></svg
                        >
                    </div>
                    <label class="sr-only" for="search-input-settings-modal"
                        >Search</label
                    >
                    <input
                        id="search-input-settings-modal"
                        class="w-full py-1 text-sm bg-transparent outline-hidden"
                        placeholder="Search"
                        bind:value={query}
                    />
                </div>
                {#each filteredCategories as category}
                    <button
                        role="tab"
                        class="px-0.5 md:px-2.5 py-1 min-w-fit rounded-xl flex-1 md:flex-none flex text-left transition outline-hidden {category.id ===
                        activeCategory.id
                            ? ''
                            : 'text-gray-300 dark:text-gray-600 hover:text-gray-700 dark:hover:text-white focus:text-gray-700 dark:focus:text-white cursor-pointer'}"
                        onclick={() => (activeCategory = category)}
                    >
                        <div class=" self-center mr-2">
                            {#if category.id === "general"}
                                <svg
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    class="size-4"
                                    stroke-width="2"
                                    ><path
                                        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    ></path><path
                                        d="M19.6224 10.3954L18.5247 7.7448L20 6L18 4L16.2647 5.48295L13.5578 4.36974L12.9353 2H10.981L10.3491 4.40113L7.70441 5.51596L6 4L4 6L5.45337 7.78885L4.3725 10.4463L2 11V13L4.40111 13.6555L5.51575 16.2997L4 18L6 20L7.79116 18.5403L10.397 19.6123L11 22H13L13.6045 19.6132L16.2551 18.5155C16.6969 18.8313 18 20 18 20L20 18L18.5159 16.2494L19.6139 13.598L21.9999 12.9772L22 11L19.6224 10.3954Z"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    ></path></svg
                                >
                            {:else if category.id === "client"}
                                <svg
                                    width="100%"
                                    height="100%"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="size-4"
                                >
                                    <path
                                        d="M5 21L5 15M5 15C6.10457 15 7 14.1046 7 13C7 11.8954 6.10457 11 5 11C3.89543 11 3 11.8954 3 13C3 14.1046 3.89543 15 5 15ZM5 7V3M12 21V15M12 7V3M12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7ZM19 21V17M19 17C20.1046 17 21 16.1046 21 15C21 13.8954 20.1046 13 19 13C17.8954 13 17 13.8954 17 15C17 16.1046 17.8954 17 19 17ZM19 9V3"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                            {:else if category.id === "extensions"}
                                <svg
                                    width="100%"
                                    height="100%"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="size-4"
                                >
                                    <path
                                        d="M7.5 4.5C7.5 3.11929 8.61929 2 10 2C11.3807 2 12.5 3.11929 12.5 4.5V6H13.5C14.8978 6 15.5967 6 16.1481 6.22836C16.8831 6.53284 17.4672 7.11687 17.7716 7.85195C18 8.40326 18 9.10218 18 10.5H19.5C20.8807 10.5 22 11.6193 22 13C22 14.3807 20.8807 15.5 19.5 15.5H18V17.2C18 18.8802 18 19.7202 17.673 20.362C17.3854 20.9265 16.9265 21.3854 16.362 21.673C15.7202 22 14.8802 22 13.2 22H12.5V20.25C12.5 19.0074 11.4926 18 10.25 18C9.00736 18 8 19.0074 8 20.25V22H6.8C5.11984 22 4.27976 22 3.63803 21.673C3.07354 21.3854 2.6146 20.9265 2.32698 20.362C2 19.7202 2 18.8802 2 17.2V15.5H3.5C4.88071 15.5 6 14.3807 6 13C6 11.6193 4.88071 10.5 3.5 10.5H2C2 9.10218 2 8.40326 2.22836 7.85195C2.53284 7.11687 3.11687 6.53284 3.85195 6.22836C4.40326 6 5.10218 6 6.5 6H7.5V4.5Z"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                            {:else if category.id === "developer"}
                                <svg
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    class="size-4"
                                    stroke-width="2"
                                    ><path
                                        d="M10.0503 10.6066L2.97923 17.6777C2.19818 18.4587 2.19818 19.725 2.97923 20.5061V20.5061C3.76027 21.2871 5.0266 21.2871 5.80765 20.5061L12.8787 13.435"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    ></path><path
                                        d="M10.0502 10.6066C9.20638 8.45358 9.37134 5.6286 11.1109 3.88909C12.8504 2.14957 16.0606 1.76777 17.8284 2.82843L14.7877 5.8691L14.5051 8.98014L17.6161 8.69753L20.6568 5.65685C21.7175 7.42462 21.3357 10.6349 19.5961 12.3744C17.8566 14.1139 15.0316 14.2789 12.8786 13.435"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    ></path></svg
                                >
                            {:else if category.id === "account"}
                                <svg
                                    width="100%"
                                    height="100%"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="size-4"
                                >
                                    <path
                                        d="M5.3163 19.4384C5.92462 18.0052 7.34492 17 9 17H15C16.6551 17 18.0754 18.0052 18.6837 19.4384M16 9.5C16 11.7091 14.2091 13.5 12 13.5C9.79086 13.5 8 11.7091 8 9.5C8 7.29086 9.79086 5.5 12 5.5C14.2091 5.5 16 7.29086 16 9.5ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                            {:else if category.id === "about"}
                                <svg
                                    width="100%"
                                    height="100%"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="size-4"
                                >
                                    <path
                                        d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                            {/if}
                        </div>
                        <div class=" self-center">{category.label}</div>
                    </button>
                {/each}
                {#if filteredCategories.length === 0}
                    <div
                        class="p-4 text-center text-gray-500 dark:text-gray-400"
                    >
                        No results found
                    </div>
                {/if}
            </div>
            <div
                class="flex-1 px-3.5 md:pl-0 md:pr-4.5 md:min-h-[42rem] max-h-[42rem]"
            >
                {#if activeCategory.id === "general"}
                    <General />
                {:else if activeCategory.id === "client"}
                    <Client />
                {:else if activeCategory.id === "extensions"}
                    <Extensions />
                {:else if activeCategory.id === "developer"}
                    <Developer />
                {:else if activeCategory.id === "account"}
                    <Account />
                {:else if activeCategory.id === "about"}
                    <About />
                {/if}
            </div>
        </div>
    </div></Modal
>
