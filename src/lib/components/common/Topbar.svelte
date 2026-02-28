<script lang="ts">
    import {
        user,
        searchQuery,
        notifications,
        showPlayer,
        miniPlayer,
    } from "$lib/stores";
    import { fade } from "svelte/transition";
    import UserMenu from "./UserMenu.svelte";
    import { goto } from "$app/navigation";
    import NotificationsMenu from "./NotificationsMenu.svelte";

    let { show = $bindable(true) } = $props();

    let isMaximized = $state(false);

    const unreadNotifications = $derived(
        $notifications.filter((notification) => !notification.read),
    );

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
            class="absolute left-0 right-0 mx-auto h-8 w-sm px-3 bg-white/5 outline outline-white/10 backdrop-blur-lg rounded-full flex items-center gap-x-2"
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

                    if (e.key === "Enter" && $showPlayer && !$miniPlayer) {
                        miniPlayer.set(true);
                    }
                }}
            />
            {#if $searchQuery.length > 0}
                <button
                    class="absolute right-3 outline-hidden size-4 rounded-full bg-white text-black flex items-center justify-center cursor-pointer"
                    transition:fade={{ duration: 100 }}
                    onclick={() => ($searchQuery = "")}
                    aria-label="Clear search"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="currentColor"
                        class="size-4"
                        ><path
                            d="M480-424 364-308q-11 11-28 11t-28-11q-11-11-11-28t11-28l116-116-116-115q-11-11-11-28t11-28q11-11 28-11t28 11l116 116 115-116q11-11 28-11t28 11q12 12 12 28.5T651-595L535-480l116 116q11 11 11 28t-11 28q-12 12-28.5 12T595-308L480-424Z"
                        /></svg
                    >
                </button>
            {/if}
        </div>
        <button
            onclick={() => {
                if ($showPlayer && !$miniPlayer) {
                    miniPlayer.set(true);
                }

                goto("/watchlist");
            }}
            class="hover:bg-white/5 border-white/10 hover:border size-8 backdrop-blur-lg rounded-full flex items-center justify-center transition-colors duration-100 outline-hidden cursor-pointer"
            aria-label="Watchlist"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="currentColor"
                class="size-6"
                ><path
                    d="m400-200-182 91q-20 10-39-1.5T160-145v-495q0-33 23.5-56.5T240-720h320q33 0 56.5 23.5T640-640v495q0 23-19 34.5t-39 1.5l-182-91Zm-160-1 122-66q18-10 38-10t38 10l122 66v-439H240v439Zm491.5-50.5Q720-263 720-280v-520H320q-17 0-28.5-11.5T280-840q0-17 11.5-28.5T320-880h400q33 0 56.5 23.5T800-800v520q0 17-11.5 28.5T760-240q-17 0-28.5-11.5ZM240-640h320-320Z"
                /></svg
            >
        </button>
        <NotificationsMenu>
            <div
                class="relative size-8 backdrop-blur-lg flex items-center justify-center rounded-full hover:bg-white/5 ring-white/10 hover:ring transition-colors duration-100 cursor-pointer"
                aria-label="Notifications"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                    width="24"
                    focusable="false"
                    aria-hidden="true"
                    fill="currentColor"
                    class="size-6"
                    ><path
                        d="M16 19a4 4 0 11-8 0H4.765C3.21 19 2.25 17.304 3.05 15.97l1.806-3.01A1 1 0 005 12.446V8a7 7 0 0114 0v4.446c0 .181.05.36.142.515l1.807 3.01c.8 1.333-.161 3.029-1.716 3.029H16ZM12 3a5 5 0 00-5 5v4.446a3 3 0 01-.428 1.543L4.765 17h14.468l-1.805-3.01A3 3 0 0117 12.445V8a5 5 0 00-5-5Zm-2 16a2 2 0 104 0h-4Z"
                    ></path></svg
                >
                {#if unreadNotifications.length > 0}
                    <div
                        class="absolute top-0.25 left-4 size-4 px-1 rounded-full text-xs font-normal leading-none flex items-center justify-center bg-[#e1002d] drop-shadow-xs"
                    >
                        {unreadNotifications.length > 10
                            ? "9+"
                            : unreadNotifications.length}
                    </div>
                {/if}
            </div>
        </NotificationsMenu>
        <UserMenu>
            <div
                class="relative size-8 backdrop-blur-lg flex items-center justify-center rounded-full hover:bg-white/5 ring-white/10 hover:ring transition-colors duration-100 cursor-pointer"
            >
                {#if $user}
                    <img
                        class="size-8 object-cover rounded-full"
                        src={`https://hikari.animenetwork.org${$user.image}`}
                        alt="User Avatar"
                    />
                {:else}
                    <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="size-6"
                    >
                        <path
                            d="M5.3163 19.4384C5.92462 18.0052 7.34492 17 9 17H15C16.6551 17 18.0754 18.0052 18.6837 19.4384M16 9.5C16 11.7091 14.2091 13.5 12 13.5C9.79086 13.5 8 11.7091 8 9.5C8 7.29086 9.79086 5.5 12 5.5C14.2091 5.5 16 7.29086 16 9.5ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </svg>
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
