<script lang="ts">
    import { user } from "$lib/stores";
    import { fade } from "svelte/transition";
    import UserMenu from "./UserMenu.svelte";

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
        class="fixed z-2222 top-0 left-16 right-0 flex gap-1 items-center justify-end h-12 [app-region:drag] [&_*]:[app-region:none]"
        transition:fade={{ duration: 100 }}
    >
        <a
            class="rounded-xl overflow-hidden cursor-pointer transition"
            aria-label="Search"
            href="/search"
        >
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
                        d="M380-320q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l224 224q11 11 11 28t-11 28q-11 11-28 11t-28-11L532-372q-30 24-69 38t-83 14Zm0-80q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"
                    /></svg
                >
            </div>
        </a>
        <UserMenu>
            <div
                class="mx-1 rounded-xl overflow-hidden cursor-pointer transition"
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
            >
                &#xE921;
            </button>
            <button
                class="h-full w-12 flex items-center justify-center hover:bg-black/50"
                style="font-family: 'Segoe Fluent Icons'"
                onclick={() => window.electronAPI.windowMaximized(!isMaximized)}
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
            >
                &#xE8BB;
            </button>
        </div>
    </div>
{/if}
