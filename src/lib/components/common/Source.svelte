<script lang="ts">
    import { fly, scale, slide } from "svelte/transition";

    let { source, onclick } = $props();

    console.log(source);

    let hasQuality = ["2160p", "1080p", "720p"].includes(source.file_quality);
</script>

<button
    class="h-18 w-full flex items-center rounded-2xl bg-gray-950 cursor-pointer"
    onclick={() => onclick?.()}
    in:slide={{ duration: 250 }}
>
    <div class="flex items-center px-2">
        <img
            src={source.icon}
            alt={source.from}
            class="size-12 overflow-hidden object-cover"
        />
    </div>
    <div class="text-left space-y-1">
        <div class="leading-none">{source.from}</div>
        <div class="text-sm text-gray-400">{source.file_name}</div>
    </div>

    <div class="text-left space-y-1 px-6 ml-auto">
        {#if hasQuality}
            <div class="flex gap-1 items-center">
                {#if source.file_quality === "2160p"}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="currentColor"
                        class="size-6"
                        ><path
                            d="m580-450 61 79q2 3 23 11 18 0 26-16.5t-3-30.5l-57-73 57-74q11-14 3-30t-26-16q-7 0-13 3t-10 8l-61 79v-60q0-13-8.5-21.5T550-600q-13 0-21.5 8.5T520-570v180q0 13 8.5 21.5T550-360q13 0 21.5-8.5T580-390v-60Zm-200 30v30q0 13 8.5 21.5T410-360q13 0 21.5-8.5T440-390v-30h10q13 0 21.5-8.5T480-450q0-13-8.5-21.5T450-480h-10v-90q0-13-8.5-21.5T410-600q-13 0-21.5 8.5T380-570v90h-60v-90q0-13-8.5-21.5T290-600q-13 0-21.5 8.5T260-570v120q0 13 8.5 21.5T290-420h90ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"
                        /></svg
                    >
                {:else if source.file_quality === "1080p"}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="currentColor"
                        class="size-6"
                        ><path
                            d="M440-440h60v50q0 13 8.5 21.5T530-360q13 0 21.5-8.5T560-390v-180q0-13-8.5-21.5T530-600q-13 0-21.5 8.5T500-570v70h-60v-70q0-13-8.5-21.5T410-600q-13 0-21.5 8.5T380-570v180q0 13 8.5 21.5T410-360q13 0 21.5-8.5T440-390v-50Zm190 80h90q25 0 42.5-17.5T780-420v-120q0-25-17.5-42.5T720-600h-90q-13 0-21.5 8.5T600-570v180q0 13 8.5 21.5T630-360Zm30-60v-120h60v120h-60Zm-420-20h50q13 0 21.5-8.5T320-470q0-13-8.5-21.5T290-500h-50v-40h70q13 0 21.5-8.5T340-570q0-13-8.5-21.5T310-600H210q-13 0-21.5 8.5T180-570v180q0 13 8.5 21.5T210-360q13 0 21.5-8.5T240-390v-50ZM120-160q-33 0-56.5-23.5T40-240v-480q0-33 23.5-56.5T120-800h720q33 0 56.5 23.5T920-720v480q0 33-23.5 56.5T840-160H120Zm0-80h720v-480H120v480Zm0 0v-480 480Z"
                        /></svg
                    >
                {:else if source.file_quality === "720p"}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 -960 960 960"
                        width="24px"
                        fill="currentColor"
                        class="size-6"
                        ><path
                            d="M300-440h80v50q0 13 8.5 21.5T410-360q13 0 21.5-8.5T440-390v-180q0-13-8.5-21.5T410-600q-13 0-21.5 8.5T380-570v70h-80v-70q0-13-8.5-21.5T270-600q-13 0-21.5 8.5T240-570v180q0 13 8.5 21.5T270-360q13 0 21.5-8.5T300-390v-50Zm240 80h140q17 0 28.5-11.5T720-400v-160q0-17-11.5-28.5T680-600H540q-8 0-14 6t-6 14v200q0 8 6 14t14 6Zm40-60v-120h80v120h-80ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-480H160v480Zm0 0v-480 480Z"
                        /></svg
                    >
                {/if}
                <span class="text-xs">{source.file_quality}</span>
            </div>
        {/if}
        {#if source.file_size}
            <div class="flex gap-1 items-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="currentColor"
                    class="size-6"
                    ><path
                        d="M160-280h640v-240H160v240Zm520-60q25 0 42.5-17.5T740-400q0-25-17.5-42.5T680-460q-25 0-42.5 17.5T620-400q0 25 17.5 42.5T680-340Zm200-260H767l-80-80H273l-80 80H80l137-137q11-11 25.5-17t30.5-6h414q16 0 30.5 6t25.5 17l137 137ZM160-200q-33 0-56.5-23.5T80-280v-320h800v320q0 33-23.5 56.5T800-200H160Z"
                    /></svg
                >
                <span class="text-xs">{source.file_size}</span>
            </div>
        {/if}
    </div>
</button>
