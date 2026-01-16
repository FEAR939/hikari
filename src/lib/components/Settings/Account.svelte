<script lang="ts">
    import { settings, user } from "$lib/stores";
    import { getAPIClient } from "$lib/api";

    const API = getAPIClient();

    let username = $user?.name;
</script>

<div class="flex flex-col h-full justify-between text-sm">
    <div class="overflow-y-scroll max-h-112 md:max-h-full">
        <div class="space-y-1">
            <div>
                <div class="text-base font-medium">Your Account</div>

                <div class="text-xs text-gray-500 mt-0.5">
                    Manage your account information.
                </div>
            </div>

            {#if $user}
                <div class="flex space-x-5 my-4">
                    <div class="w-20 space-y-2 group">
                        <label
                            class="relative size-20 outline-hidden cursor-pointer"
                            aria-label="Change Avatar"
                        >
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg"
                                class="hidden"
                                onchange={async (e) => {
                                    try {
                                        const file = e.currentTarget.files?.[0];
                                        if (!file) return;
                                        const path =
                                            await API.uploadAvatar(file);
                                        if (!path) return;
                                        const storeUser = $user;
                                        storeUser!.image = path as string;
                                        user.set(storeUser);
                                        e.currentTarget.value = ""; // Reset input for re-selecting same file
                                    } catch (error) {
                                        console.error(error);
                                    }
                                }}
                            />
                            <img
                                class="size-20 rounded-full"
                                src={`${$settings.api_server}${$user?.image}`}
                                alt="User Avatar"
                            />
                            <div
                                class="absolute right-0 bottom-0 bg-white text-black rounded-full size-6 grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="24px"
                                    viewBox="0 -960 960 960"
                                    width="24px"
                                    fill="currentColor"
                                    class="size-4"
                                >
                                    <path
                                        d="M160-120q-17 0-28.5-11.5T120-160v-97q0-16 6-30.5t17-25.5l505-504q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L313-143q-11 11-25.5 17t-30.5 6h-97Zm544-528 56-56-56-56-56 56 56 56Z"
                                    />
                                </svg>
                            </div>
                        </label>
                        <div
                            class="w-20 text-xs text-neutral-500 hidden group-hover:block wrap-break-word"
                            lang="en"
                        >
                            Aspect ratio of 1:1 is recom&shy;mended.
                            <p>Max file size is 5MB.</p>
                        </div>
                    </div>

                    <div class="flex flex-1 flex-col">
                        <div class=" flex-1">
                            <div class="flex flex-col w-full">
                                <div class=" mb-1 text-xs font-medium">
                                    {"Name"}
                                </div>

                                <div class="flex-1">
                                    <input
                                        class="w-full text-sm dark:text-gray-300 bg-transparent outline-hidden"
                                        type="text"
                                        value={username}
                                        required
                                        placeholder={"Enter your name"}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            {:else}
                <div
                    class="w-full h-fit p-4 grid place-items-center border border-gray-800 rounded-md text-neutral-500 space-y-2"
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
                        class="lucide lucide-info-icon lucide-info size-5"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 16v-4" />
                        <path d="M12 8h.01" />
                    </svg>
                    <div>You will need to log in to access these settings.</div>
                </div>
            {/if}
        </div>
    </div>
</div>
