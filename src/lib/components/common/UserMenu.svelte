<script lang="ts">
    import { DropdownMenu } from "bits-ui";
    import { getAPIClient } from "$lib/api";
    import { goto } from "$app/navigation";
    import { authClient } from "$lib/auth/auth";

    import { showSettings } from "$lib/stores";

    import { user } from "$lib/stores";
    import { fade } from "svelte/transition";

    const API = getAPIClient();

    let { show = $bindable(false), children, class: className = "" } = $props();
</script>

<DropdownMenu.Root bind:open={show}>
    <DropdownMenu.Trigger class={className}>
        {@render children()}
    </DropdownMenu.Trigger>

    <DropdownMenu.Content sideOffset={4} align="center" forceMount>
        {#if show}
            <div
                class="w-[260px] px-1 py-1 rounded-2xl border border-gray-100 dark:border-gray-900 z-50 bg-white dark:bg-black/70 dark:text-white shadow-lg text-sm backdrop-blur-2xl"
                transition:fade={{ duration: 100 }}
            >
                {#if $user}
                    <div class="flex gap-3.5 w-full p-2.5 items-center">
                        <div class=" items-center flex shrink-0">
                            <img
                                src={`${API.baseurl}${$user.image}`}
                                class=" size-10 object-cover rounded-full"
                                alt="profile"
                            />
                        </div>

                        <div class=" flex flex-col w-full flex-1">
                            <div class="font-medium line-clamp-1 pr-2">
                                {$user.name}
                            </div>
                        </div>
                    </div>
                {/if}

                <DropdownMenu.Item
                    class="flex rounded-xl py-1.5 px-3 w-full hover:bg-gray-50 dark:hover:bg-white/10 transition cursor-pointer"
                    onclick={async () => {
                        show = false;

                        showSettings.set(true);
                    }}
                >
                    <div class=" self-center mr-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="currentColor"
                            class="size-5"
                            ><path
                                d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-240v-32q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v32q0 33-23.5 56.5T720-160H240q-33 0-56.5-23.5T160-240Zm80 0h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"
                            /></svg
                        >
                    </div>
                    <div class=" self-center truncate">Settings</div>
                </DropdownMenu.Item>

                <DropdownMenu.Item
                    class="flex rounded-xl py-1.5 px-3 w-full hover:bg-gray-50 dark:hover:bg-white/10 transition"
                    onclick={async () => {
                        if ($user) {
                            await authClient.signOut();
                            user.set(null);

                            goto("/");
                        } else {
                            goto("/auth");
                        }
                        show = false;
                    }}
                >
                    <div class=" self-center mr-3">
                        {#if $user}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="24px"
                                viewBox="0 -960 960 960"
                                width="24px"
                                fill="currentColor"
                                class="size-5"
                                ><path
                                    d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h240q17 0 28.5 11.5T480-800q0 17-11.5 28.5T440-760H200v560h240q17 0 28.5 11.5T480-160q0 17-11.5 28.5T440-120H200Zm487-320H400q-17 0-28.5-11.5T360-480q0-17 11.5-28.5T400-520h287l-75-75q-11-11-11-27t11-28q11-12 28-12.5t29 11.5l143 143q12 12 12 28t-12 28L669-309q-12 12-28.5 11.5T612-310q-11-12-10.5-28.5T613-366l74-74Z"
                                /></svg
                            >
                        {:else}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="24px"
                                viewBox="0 -960 960 960"
                                width="24px"
                                fill="currentColor"
                                class="size-5"
                                ><path
                                    d="M520-120q-17 0-28.5-11.5T480-160q0-17 11.5-28.5T520-200h240v-560H520q-17 0-28.5-11.5T480-800q0-17 11.5-28.5T520-840h240q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H520Zm-73-320H160q-17 0-28.5-11.5T120-480q0-17 11.5-28.5T160-520h287l-75-75q-11-11-11-27t11-28q11-12 28-12.5t29 11.5l143 143q12 12 12 28t-12 28L429-309q-12 12-28.5 11.5T372-310q-11-12-10.5-28.5T373-366l74-74Z"
                                /></svg
                            >
                        {/if}
                    </div>
                    <div class=" self-center truncate">
                        {$user ? "Sign Out" : "Sign In"}
                    </div>
                </DropdownMenu.Item>
            </div>
        {/if}
    </DropdownMenu.Content>
</DropdownMenu.Root>
