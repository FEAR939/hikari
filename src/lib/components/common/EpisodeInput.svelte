<script lang="ts">
    let {
        anime,
        currentIndex = $bindable(0),
        currentEpisodeName = $bindable(""),
    } = $props();
</script>

{#if anime}
    <div
        class="flex items-center w-full py-1.5 text-sm dark:text-gray-300 px-3.5 rounded-full bg-gray-100/80 dark:bg-gray-950"
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor"
            class="size-6"
            ><path
                d="M160-320q-17 0-28.5-11.5T120-360q0-17 11.5-28.5T160-400h240q17 0 28.5 11.5T440-360q0 17-11.5 28.5T400-320H160Zm0-160q-17 0-28.5-11.5T120-520q0-17 11.5-28.5T160-560h400q17 0 28.5 11.5T600-520q0 17-11.5 28.5T560-480H160Zm0-160q-17 0-28.5-11.5T120-680q0-17 11.5-28.5T160-720h400q17 0 28.5 11.5T600-680q0 17-11.5 28.5T560-640H160Zm511 499q-5 3-10 3t-10-2q-5-2-8-6.5t-3-10.5v-246q0-6 3-10.5t8-6.5q5-2 10-2t10 3l184 122q5 3 7 7.5t2 9.5q0 5-2 9.5t-7 7.5L671-141Z"
            /></svg
        >
        <span class="ml-1.5">EP</span>
        <input
            class="field-sizing-content text-white outline-hidden ml-0.5 mr-1.5"
            type="number"
            value={currentIndex + 1}
            min={1}
            max={anime.attributes.episodeCount}
            oninput={(e) =>
                (currentIndex =
                    parseInt((e.target as HTMLInputElement).value) - 1)}
        />
        <span>|</span>
        <span class="ml-1.5">{currentEpisodeName}</span>
        <div class="flex flex-col justify-center h-full ml-auto">
            <button
                class="flex items-center h-2.5 outline-hidden {currentIndex <
                anime.attributes.episodeCount - 1
                    ? 'text-gray-700 hover:text-white cursor-pointer'
                    : 'text-gray-800'}"
                aria-label="Increase"
                onclick={() => {
                    if (currentIndex < anime.attributes.episodeCount - 1) {
                        currentIndex += 1;
                    }
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="currentColor"
                    class="size-5"
                    ><path
                        d="M328-400q-9 0-14.5-6t-5.5-14q0-2 6-14l145-145q5-5 10-7t11-2q6 0 11 2t10 7l145 145q3 3 4.5 6.5t1.5 7.5q0 8-5.5 14t-14.5 6H328Z"
                    /></svg
                >
            </button>
            <button
                class="flex items-center h-2.5 outline-hidden {currentIndex > 0
                    ? 'text-gray-700 hover:text-white cursor-pointer'
                    : 'text-gray-800'}"
                aria-label="Decrease"
                onclick={() => {
                    if (currentIndex > 0) {
                        currentIndex -= 1;
                    }
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="currentColor"
                    class="size-5"
                    ><path
                        d="M459-381 314-526q-3-3-4.5-6.5T308-540q0-8 5.5-14t14.5-6h304q9 0 14.5 6t5.5 14q0 2-6 14L501-381q-5 5-10 7t-11 2q-6 0-11-2t-10-7Z"
                    /></svg
                >
            </button>
        </div>
    </div>
{/if}

<style>
    input[type="number"] {
        appearance: textfield;
        -moz-appearance: textfield; /* Firefox */
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        /* display: none; <- Crashes Chrome on hover */
        -webkit-appearance: none;
        margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
    }
</style>
