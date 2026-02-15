<script lang="ts">
    import { user, searchQuery } from "$lib/stores";
    import { fade } from "svelte/transition";
    import UserMenu from "./UserMenu.svelte";
    import { goto } from "$app/navigation";

    let { show = $bindable(true) } = $props();

    let isMaximized = $state(false);

    window.electronAPI.onmaximized(() => {
        isMaximized = true;
    });

    window.electronAPI.onunmaximized(() => {
        isMaximized = false;
    });
</script>

{#if show}
    <div
        class="fixed z-2222 top-0 left-14 right-0 flex gap-1 items-center justify-end h-12 [app-region:drag] [&_*]:[app-region:none]"
        transition:fade={{ duration: 100 }}
    >
        <div
            class="absolute left-0 right-0 mx-auto h-8 w-sm px-3 bg-black/30 outline outline-white/10 backdrop-blur-lg rounded-full flex items-center gap-x-2"
        >
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
            <input
                type="text"
                placeholder="Search"
                class="outline-hidden text-sm leading-none w-full"
                bind:value={$searchQuery}
                onkeyup={(e) => {
                    if (e.target.value.length === 0) return;

                    if (e.key === "Enter") {
                        goto("/search?q=" + encodeURIComponent($searchQuery));
                    }
                }}
            />
        </div>
        <a
            href="/watchlist"
            class="hover:bg-white hover:text-black focus:bg-white focus:text-black size-8 rounded-full flex items-center justify-center transition-colors duration-250 outline-hidden"
            aria-label="Watchlist"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="currentColor"
                class="size-5"
                ><path
                    d="m400-200-182 91q-20 10-39-1.5T160-145v-495q0-33 23.5-56.5T240-720h320q33 0 56.5 23.5T640-640v495q0 23-19 34.5t-39 1.5l-182-91Zm331.5-51.5Q720-263 720-280v-520H320q-17 0-28.5-11.5T280-840q0-17 11.5-28.5T320-880h400q33 0 56.5 23.5T800-800v520q0 17-11.5 28.5T760-240q-17 0-28.5-11.5Z"
                /></svg
            >
        </a>
        <UserMenu>
            <div
                class="mx-1 rounded-full overflow-hidden cursor-pointer transition-transform duration-150 outline-white outline-offset-2 group-focus-visible/usermenu:outline-1"
            >
                {#if $user}
                    <img
                        class="size-8 object-cover rounded-full"
                        src={`https://hikari.animenetwork.org${$user.image}`}
                        alt="User Avatar"
                    />
                {:else}
                    <div
                        class="relative p-2 bg-black/30 before:content-[''] before:absolute before:inset-1 before:rounded-full hover:before:bg-white/10 rounded-full flex items-center justify-center"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="currentColor"
                            class="size-4"
                            ><path
                                d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-240v-32q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v32q0 33-23.5 56.5T720-160H240q-33 0-56.5-23.5T160-240Zm80 0h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"
                            /></svg
                        >
                    </div>
                {/if}
            </div>
        </UserMenu>

        <!-- Window Controls -->
        <div class="h-full flex text-xs">
            <button
                class="h-full w-12 flex items-center justify-center hover:bg-black/50"
                style="font-family: 'Segoe Fluent Icons'"
                onclick={() => window.electronAPI.windowMinimize()}
                tabIndex="-1"
            >
                &#xE921;
            </button>
            <button
                class="h-full w-12 flex items-center justify-center hover:bg-black/50"
                style="font-family: 'Segoe Fluent Icons'"
                onclick={() => window.electronAPI.windowMaximized(!isMaximized)}
                tabIndex="-1"
            >
                {#if isMaximized}
                    &#xE923;
                {:else}
                    &#xE922;
                {/if}
            </button>
            <button
                class="h-full w-12 flex items-center justify-center hover:bg-red-500"
                style="font-family: 'Segoe Fluent Icons'"
                onclick={() => window.electronAPI.quit()}
                tabIndex="-1"
            >
                &#xE8BB;
            </button>
        </div>
    </div>
{/if}
