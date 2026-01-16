<script lang="ts">
    import { fade } from "svelte/transition";

    let x = $state(0);
    let y = $state(0);
    let rot = $state(0);
    let size = $state(0);
    let opacity = $state(0);
    let roamX = $state(0);
    let roamY = $state(0);
    let roamRot = $state(0);
    let key = $state(0);

    function roam() {
        key++;
        x = Math.random() * 100;
        y = Math.random() * 100;
        rot = Math.random() * 360;
        size = (Math.random() + 0.5) * 10;
        opacity = (Math.random() + 0.5) * 0.5;
        roamX = (Math.random() - 0.5) * 300;
        roamY = (Math.random() - 0.5) * 300;
        roamRot = Math.random() * 360;

        setTimeout(roam, Math.random() * 10000);
    }

    roam();
</script>

{#key key}
    <div
        class="absolute star-roam rounded-full blur-[1px]"
        style="left: {x}%; top: {y}%; width: {size}px; height: {size}px; opacity: var(--opacity); --opacity: {opacity}; --roam-x: {roamX}px; --roam-y: {roamY}px; --roam-rot: {roamRot}deg; --rot: {rot}deg;"
        transition:fade={{ duration: 300 }}
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor"
            class="h-full w-full text-white/25"
            ><path
                d="M480-269 314-169q-11 7-23 6t-21-8q-9-7-14-17.5t-2-23.5l44-189-147-127q-10-9-12.5-20.5T140-571q4-11 12-18t22-9l194-17 75-178q5-12 15.5-18t21.5-6q11 0 21.5 6t15.5 18l75 178 194 17q14 2 22 9t12 18q4 11 1.5 22.5T809-528L662-401l44 189q3 13-2 23.5T690-171q-9 7-21 8t-23-6L480-269Z"
            /></svg
        >
    </div>
{/key}

<style>
    .star-roam {
        animation: star-roam 5s linear infinite alternate;
    }

    @keyframes star-roam {
        0% {
            transform: translate3d(0, 0, 0) rotate(var(--rot));
        }
        100% {
            transform: translate3d(var(--roam-x), var(--roam-y), 0)
                rotate(var(--roam-rot));
        }
    }
</style>
