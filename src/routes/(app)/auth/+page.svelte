<script lang="ts">
    import { goto } from "$app/navigation";
    import { authClient } from "$lib/auth/auth";
    import { user } from "$lib/stores";
    import { slide } from "svelte/transition";
    import { quintOut } from "svelte/easing";

    let signState = $state("signin");
    let email = $state("");
    let password = $state("");
    let showPassword = $state(false);
    let username = $state("");
    let errorMsg = $state<string | null>(null);
    let hasValues = $state(false);

    async function handleSignin(email: string, password: string) {
        if (!email || !password) return;
        const { data, error } = await authClient.signIn.email({
            email,
            password,
        });
        if (data && !error) {
            user.set(data.user);
            goto("/");
        } else {
            errorMsg = error.message!;
        }
    }

    async function handleSignup(
        username: string,
        email: string,
        password: string,
    ) {
        if (!username || !email || !password) return;
        const { data, error } = await authClient.signUp.email({
            email,
            password,
            name: username,
        });
        if (data && !error) {
            user.set(data.user);
            goto("/");
        } else {
            errorMsg = error.message!;
        }
    }

    $effect(() => {
        if (signState === "signup") {
            hasValues = username !== "" && email !== "" && password !== "";
        } else if (signState === "signin") {
            hasValues = email !== "" && password !== "";
        }
    });
</script>

<div class="h-full w-full bg-black">
    <img
        src="/background.jpg"
        class="absolute h-full w-full object-cover object-center"
        alt="Background"
    />
    <div class="absolute inset-0 h-fit w-96 m-auto space-y-4">
        <div class="mb-12">
            <img src="/icon.png" class="mx-auto size-24" alt="Hikari Logo" />
            <div class="w-fit text-2xl mx-auto">Welcome</div>

            <div class="flex gap-2 text-sm w-fit mx-auto">
                {#if signState === "signup"}
                    <span class="text-gray-500">Already have an account?</span>
                    <button
                        onclick={() => (signState = "signin")}
                        class="cursor-pointer outline-hidden hover:underline focus:underline"
                    >
                        Sign In
                    </button>
                {:else if signState === "signin"}
                    <span class="text-gray-500">Don't have an account?</span>
                    <button
                        onclick={() => (signState = "signup")}
                        class="cursor-pointer outline-hidden hover:underline focus:underline"
                    >
                        Sign Up
                    </button>
                {/if}
            </div>
        </div>

        {#if ["signup"].includes(signState)}
            <div
                in:slide={{ duration: 300, easing: quintOut }}
                out:slide={{ duration: 300, easing: quintOut }}
            >
                <div
                    class="relative bg-black/30 px-4 py-3 rounded-xl w-full before:content-[''] before:absolute before:inset-1 before:rounded-lg hover:before:bg-white/10 focus-within:before:bg-white/10"
                >
                    <input
                        bind:value={username}
                        type="text"
                        placeholder="Username"
                        class="relative z-1 outline-hidden placeholder:text-white"
                    />
                </div>
            </div>
        {/if}
        {#if ["signup", "signin"].includes(signState)}
            <div
                class="relative bg-black/30 px-4 py-3 rounded-xl w-full before:content-[''] before:absolute before:inset-1 before:rounded-lg hover:before:bg-white/10 focus-within:before:bg-white/10"
            >
                <input
                    bind:value={email}
                    type="email"
                    placeholder="Email"
                    class="relative z-1 outline-hidden placeholder:text-white"
                />
            </div>
        {/if}
        {#if ["signup", "signin"].includes(signState)}
            <div
                class="relative bg-black/30 px-4 py-3 rounded-xl w-full before:content-[''] before:absolute before:inset-1 before:rounded-lg hover:before:bg-white/10 focus-within:before:bg-white/10"
            >
                <input
                    bind:value={password}
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    class="relative z-1 outline-hidden placeholder:text-white"
                />
                <button
                    class="absolute right-4 top-1/2 transform -translate-y-1/2 outline-hidden cursor-pointer text-gray-500 focus:text-white hover:text-white transition-colors duration-300"
                    onclick={() => (showPassword = !showPassword)}
                >
                    {#if showPassword}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="currentColor"
                            class="size-5"
                            ><path
                                d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-134 0-244.5-72T61-462q-5-9-7.5-18.5T51-500q0-10 2.5-19.5T61-538q64-118 174.5-190T480-800q134 0 244.5 72T899-538q5 9 7.5 18.5T909-500q0 10-2.5 19.5T899-462q-64 118-174.5 190T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"
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
                                d="M607-627q29 29 42.5 66t9.5 76q0 15-11 25.5T622-449q-15 0-25.5-10.5T586-485q5-26-3-50t-25-41q-17-17-41-26t-51-4q-15 0-25.5-11T430-643q0-15 10.5-25.5T466-679q38-4 75 9.5t66 42.5Zm-127-93q-19 0-37 1.5t-36 5.5q-17 3-30.5-5T358-742q-5-16 3.5-31t24.5-18q23-5 46.5-7t47.5-2q137 0 250.5 72T904-534q4 8 6 16.5t2 17.5q0 9-1.5 17.5T905-466q-18 40-44.5 75T802-327q-12 11-28 9t-26-16q-10-14-8.5-30.5T753-392q24-23 44-50t35-58q-50-101-144.5-160.5T480-720Zm0 520q-134 0-245-72.5T60-463q-5-8-7.5-17.5T50-500q0-10 2-19t7-18q20-40 46.5-76.5T166-680l-83-84q-11-12-10.5-28.5T84-820q11-11 28-11t28 11l680 680q11 11 11.5 27.5T820-84q-11 11-28 11t-28-11L624-222q-35 11-71 16.5t-73 5.5ZM222-624q-29 26-53 57t-41 67q50 101 144.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z"
                            /></svg
                        >
                    {/if}
                </button>
            </div>
        {/if}
        <button
            onclick={() => {
                switch (signState) {
                    case "signup":
                        handleSignup(username, email, password);
                        break;
                    case "signin":
                        handleSignin(email, password);
                        break;
                }
            }}
            class="text-black px-4 py-3 mt-8 rounded-xl w-full cursor-pointer outline-hidden {hasValues
                ? 'bg-white hover:bg-gray-300 focus:bg-gray-300'
                : 'bg-gray-500'}"
        >
            {signState === "signup" ? "Sign Up" : "Sign In"}
        </button>
        {#if errorMsg}
            <div
                class="text-red-500 text-sm w-fit mx-auto"
                in:slide={{ duration: 200, easing: quintOut }}
                out:slide={{ duration: 200, easing: quintOut }}
            >
                {errorMsg}
            </div>
        {/if}
    </div>
</div>
