<script lang="ts">
    import Spinner from "$lib/components/common/Spinner.svelte";
    import Card from "$lib/components/common/Card.svelte";
    import { kitsu } from "$lib/kitsu";
    import { Select } from "bits-ui";
    import { fade } from "svelte/transition";
    import { goto } from "$app/navigation";

    let isSearching = $state(false);
    let searchQuery = $state("");
    let searchResults = $state<any[]>([]);
    let filterOpen = $state(false);

    let filters = $state({
        season: {
            label: "Season",
            value: "all",
            type: "string" as const,
            possibleValues: ["all", "winter", "spring", "summer", "fall"],
        },
        seasonYear: {
            label: "Year",
            value: "all",
            type: "number" as const,
        },
        status: {
            label: "Status",
            value: "all",
            type: "string" as const,
            possibleValues: [
                "all",
                "current",
                "finished",
                "tba",
                "unreleased",
                "upcoming",
            ],
        },
    });

    function capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function hasActiveFilters(): boolean {
        return Object.values(filters).some(
            (filter) => filter.value !== "all" && filter.value !== "",
        );
    }

    async function search() {
        isSearching = true;
        searchResults = [];
        let results = null;

        if (hasActiveFilters()) {
            const params: Record<string, string> = {};
            Object.entries(filters).forEach(([key, filter]) => {
                if (filter.value !== "all" && filter.value !== "") {
                    params[key] = filter.value;
                }
            });
            results = await kitsu.advancedSearch({
                text: searchQuery,
                ...params,
            });
        } else {
            results = await kitsu.searchAnime(searchQuery);
        }
        isSearching = false;
        searchResults = results.data;
    }
</script>

<div class="relative h-full w-full py-4 pt-16 space-y-4 overflow-y-hidden">
    <div class="flex gap-2 mx-4">
        <div
            class="rounded-2xl border border-gray-900 bg-gray-950 h-10 w-64 px-3 flex items-center overflow-hidden"
        >
            <div class="h-full flex items-center shrink-0 text-neutral-700">
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    class="size-4"
                >
                    <path
                        d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </div>
            <input
                class="p-2 h-8 border-none outline-none text-sm text-neutral-300 font-medium inline-block w-full leading-none placeholder:text-neutral-500 placeholder:text-sm placeholder:font-medium bg-transparent"
                placeholder="Search"
                bind:value={searchQuery}
                onkeyup={async (e) => {
                    if (e.key !== "Enter") return;
                    search();
                }}
            />
        </div>

        <!-- Filter Toggle Button -->
        <div class="relative">
            <button
                aria-label="Filters"
                class="size-10 rounded-2xl bg-gray-950 border border-gray-900 grid place-items-center cursor-pointer hover:bg-[#252525] outline-hidden transition-colors"
                class:border-neutral-500={hasActiveFilters()}
                onclick={() => (filterOpen = !filterOpen)}
            >
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    class="size-4"
                    class:text-neutral-300={hasActiveFilters()}
                >
                    <path
                        d="M2 4.6C2 4.03995 2 3.75992 2.10899 3.54601C2.20487 3.35785 2.35785 3.20487 2.54601 3.10899C2.75992 3 3.03995 3 3.6 3H20.4C20.9601 3 21.2401 3 21.454 3.10899C21.6422 3.20487 21.7951 3.35785 21.891 3.54601C22 3.75992 22 4.03995 22 4.6V5.26939C22 5.53819 22 5.67259 21.9672 5.79756C21.938 5.90831 21.8901 6.01323 21.8255 6.10776C21.7526 6.21443 21.651 6.30245 21.4479 6.4785L15.0521 12.0215C14.849 12.1975 14.7474 12.2856 14.6745 12.3922C14.6099 12.4868 14.562 12.5917 14.5328 12.7024C14.5 12.8274 14.5 12.9618 14.5 13.2306V18.4584C14.5 18.6539 14.5 18.7517 14.4685 18.8363C14.4406 18.911 14.3953 18.9779 14.3363 19.0315C14.2695 19.0922 14.1787 19.1285 13.9971 19.2012L10.5971 20.5612C10.2296 20.7082 10.0458 20.7817 9.89827 20.751C9.76927 20.7242 9.65605 20.6476 9.58325 20.5377C9.5 20.4122 9.5 20.2142 9.5 19.8184V13.2306C9.5 12.9618 9.5 12.8274 9.46715 12.7024C9.43805 12.5917 9.39014 12.4868 9.32551 12.3922C9.25258 12.2856 9.15102 12.1975 8.94789 12.0215L2.55211 6.4785C2.34898 6.30245 2.24742 6.21443 2.17449 6.10776C2.10986 6.01323 2.06195 5.90831 2.03285 5.79756C2 5.67259 2 5.53819 2 5.26939V4.6Z"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </button>

            <!-- Filter Panel -->
            {#if filterOpen}
                <div
                    class="absolute z-10 left-0 top-12 w-64 h-fit max-h-sm rounded-2xl bg-gray-950 border border-gray-900 p-4 space-y-3"
                    transition:fade={{ duration: 100 }}
                >
                    {#each Object.entries(filters) as [filterName, filter]}
                        <div
                            class="h-8 w-full flex items-center justify-between"
                        >
                            <div class="text-xs text-neutral-300">
                                {filter.label}
                            </div>

                            {#if filter.type === "string" && "possibleValues" in filter}
                                <Select.Root
                                    type="single"
                                    value={filter.value}
                                    onValueChange={(value) => {
                                        if (value) {
                                            filters[
                                                filterName as keyof typeof filters
                                            ].value = value;
                                        }
                                    }}
                                >
                                    <Select.Trigger
                                        class="w-24 h-7 px-2 text-xs bg-gray-900 border border-gray-850 rounded-lg flex items-center justify-between hover:bg-[#2a2a2a] transition-colors"
                                    >
                                        <span class="truncate"
                                            >{capitalize(filter.value)}</span
                                        >
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
                                    <Select.Portal>
                                        <Select.Content
                                            class="z-50 bg-gray-900 border border-gray-850 rounded-lg overflow-hidden shadow-lg"
                                            sideOffset={4}
                                        >
                                            {#each filter.possibleValues as value}
                                                <Select.Item
                                                    {value}
                                                    class="px-3 py-1.5 text-xs cursor-pointer text-white hover:bg-[#252525] data-[highlighted]:bg-[#252525] outline-none"
                                                >
                                                    {capitalize(value)}
                                                </Select.Item>
                                            {/each}
                                        </Select.Content>
                                    </Select.Portal>
                                </Select.Root>
                            {:else if filter.type === "number"}
                                <input
                                    type="number"
                                    placeholder="All"
                                    class="w-20 h-7 px-2 text-xs bg-gray-900 border border-gray-850 rounded-lg outline-none text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:border-[#444444] transition-colors"
                                    value={filter.value === "all"
                                        ? ""
                                        : filter.value}
                                    oninput={(e) => {
                                        const target =
                                            e.target as HTMLInputElement;
                                        filters[
                                            filterName as keyof typeof filters
                                        ].value = target.value || "all";
                                    }}
                                />
                            {/if}
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>

    <div
        class="relative h-full w-full grid auto-rows-min grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-x-2 gap-y-6 pb-16 pt-4 px-4 overflow-y-auto"
    >
        {#if !isSearching && searchResults.length === 0}
            <div class="h-full col-span-full flex items-center justify-center">
                <div
                    class="w-full py-8 flex flex-col items-center justify-center space-y-1"
                >
                    <div class="text-3xl">😕</div>
                    <div class="text-lg">No results found</div>
                    <div class="text-neutral-500 text-xs">
                        Try adjusting your search to find what you are looking
                        for.
                    </div>
                </div>
            </div>
        {:else if isSearching}
            <div
                class="col-span-full h-[calc(100vh-16rem)] grid place-items-center"
            >
                <Spinner />
            </div>
        {:else if !isSearching && searchResults.length > 0}
            {#each searchResults as result}
                <Card
                    item={result}
                    onclick={() => {
                        goto(`/anime/${result.id}`);
                    }}
                />
            {/each}
        {/if}
    </div>
</div>
