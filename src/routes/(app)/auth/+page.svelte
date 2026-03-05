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
    <div class="absolute inset-0 h-fit w-md m-auto space-y-4">
        <div class="mb-12 space-y-2">
            <div class="w-full text-center text-2xl font-semibold!">
                {signState === "signup" ? "Sign up" : "Sign in"} to Rune
            </div>

            <div class="w-full flex justify-center gap-2 text-sm">
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
                <div class="w-full space-y-1">
                    <div>Username</div>
                    <input
                        bind:value={username}
                        type="text"
                        placeholder="Enter your Username"
                        class="outline-hidden placeholder:text-gray-500 text-sm"
                    />
                </div>
            </div>
        {/if}
        {#if ["signup", "signin"].includes(signState)}
            <div class="w-full space-y-1">
                <div>Email</div>
                <input
                    bind:value={email}
                    type="email"
                    placeholder="Enter your Email"
                    class="outline-hidden placeholder:text-gray-500 text-sm"
                />
            </div>
        {/if}
        {#if ["signup", "signin"].includes(signState)}
            <div class="w-full space-y-1">
                <div>Password</div>
                <div class="relative">
                    <input
                        bind:value={password}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your Password"
                        class="outline-hidden placeholder:text-gray-500 text-sm"
                    />
                    <button
                        class="absolute right-4 top-1/2 transform -translate-y-1/2 outline-hidden cursor-pointer text-white transition-colors duration-300"
                        onclick={() => (showPassword = !showPassword)}
                    >
                        {#if showPassword}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="24px"
                                viewBox="0 -960 960 960"
                                width="24px"
                                fill="currentColor"
                                class="size-4"
                                ><path
                                    d="M764-84 624-222q-35 11-71 16.5t-73 5.5q-134 0-245-72T61-462q-5-9-7.5-18.5T51-500q0-10 2.5-19.5T61-538q22-39 47-76t58-66l-83-84q-11-11-11-27.5T84-820q11-11 28-11t28 11l680 680q11 11 11.5 27.5T820-84q-11 11-28 11t-28-11ZM480-320q11 0 21-1t20-4L305-541q-3 10-4 20t-1 21q0 75 52.5 127.5T480-320Zm0-480q134 0 245.5 72.5T900-537q5 8 7.5 17.5T910-500q0 10-2 19.5t-7 17.5q-19 37-42.5 70T806-331q-14 14-33 13t-33-15l-80-80q-7-7-9-16.5t1-19.5q4-13 6-25t2-26q0-75-52.5-127.5T480-680q-14 0-26 2t-25 6q-10 3-20 1t-17-9l-33-33q-19-19-12.5-44t31.5-32q25-5 50.5-8t51.5-3Zm79 226q11 13 18.5 28.5T587-513q1 8-6 11t-13-3l-82-82q-6-6-2.5-13t11.5-7q19 2 35 10.5t29 22.5Z"
                                /></svg
                            >
                        {:else}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="24px"
                                viewBox="0 -960 960 960"
                                width="24px"
                                fill="currentColor"
                                class="size-4"
                                ><path
                                    d="M607.5-372.5Q660-425 660-500t-52.5-127.5Q555-680 480-680t-127.5 52.5Q300-575 300-500t52.5 127.5Q405-320 480-320t127.5-52.5Zm-204-51Q372-455 372-500t31.5-76.5Q435-608 480-608t76.5 31.5Q588-545 588-500t-31.5 76.5Q525-392 480-392t-76.5-31.5ZM235.5-272Q125-344 61-462q-5-9-7.5-18.5T51-500q0-10 2.5-19.5T61-538q64-118 174.5-190T480-800q134 0 244.5 72T899-538q5 9 7.5 18.5T909-500q0 10-2.5 19.5T899-462q-64 118-174.5 190T480-200q-134 0-244.5-72Z"
                                /></svg
                            >
                        {/if}
                    </button>
                </div>
            </div>
        {/if}
        {#if ["signup"].includes(signState)}
            <div
                class="flex flex-wrap gap-x-4 text-xs"
                in:slide={{ duration: 300, easing: quintOut }}
                out:slide={{ duration: 300, easing: quintOut }}
            >
                <div
                    class="flex items-center {password.trim().length >= 8
                        ? 'text-green-500'
                        : 'text-red-500'}"
                >
                    {#if password.trim().length >= 8}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="currentColor"
                            class="size-4"
                            ><path
                                d="m382-354 339-339q12-12 28-12t28 12q12 12 12 28.5T777-636L410-268q-12 12-28 12t-28-12L182-440q-12-12-11.5-28.5T183-497q12-12 28.5-12t28.5 12l142 143Z"
                            /></svg
                        >
                    {:else}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="currentColor"
                            class="size-4"
                            ><path
                                d="M480-424 284-228q-11 11-28 11t-28-11q-11-11-11-28t11-28l196-196-196-196q-11-11-11-28t11-28q11-11 28-11t28 11l196 196 196-196q11-11 28-11t28 11q11 11 11 28t-11 28L536-480l196 196q11 11 11 28t-11 28q-11 11-28 11t-28-11L480-424Z"
                            /></svg
                        >
                    {/if}
                    <span class="ml-2">Must be at least 8 characters long</span>
                </div>
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
            class="px-4 py-2.5 mt-4 rounded-full w-full outline-hidden transition-colors duration-100 text-sm {hasValues
                ? 'bg-gray-100/5 hover:bg-gray-100/10 focus:bg-gray-100/10 text-white cursor-pointer'
                : 'bg-gray-100/5 text-gray-800'}"
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
