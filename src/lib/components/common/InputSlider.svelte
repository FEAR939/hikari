<script lang="ts">
    import { twMerge } from "tailwind-merge";
    let { value = $bindable(0), class: className, onChange } = $props();
    let dragging = $state(false);
    let sliderEl: HTMLDivElement;

    function updateValue(e: MouseEvent) {
        const rect = sliderEl.getBoundingClientRect();
        const percent = Math.min(
            Math.max(((e.clientX - rect.left) / rect.width) * 100, 0),
            100,
        );
        value = Math.round(percent);
        onChange?.(value);
    }

    function handleMouseDown(e: MouseEvent) {
        dragging = true;
        updateValue(e);
    }

    function handleMouseMove(e: MouseEvent) {
        if (dragging) updateValue(e);
    }

    function handleMouseUp() {
        dragging = false;
    }
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

<div
    bind:this={sliderEl}
    onmousedown={handleMouseDown}
    role="slider"
    aria-valuenow={value}
    aria-valuemin={0}
    aria-valuemax={100}
    tabindex="0"
    class={twMerge("relative h-0.5 w-full cursor-pointer", className)}
>
    <!-- Background track -->
    <div class="absolute inset-0 rounded-full bg-white/30"></div>
    <!-- Progress -->
    <div
        class="absolute left-0 top-0 h-full rounded-full bg-white"
        style="width: {value}%"
    ></div>
    <!-- Thumb -->
    <div
        class="absolute top-1/2 -translate-y-1/2 size-3 rounded-full bg-white"
        style="left: {value}%; transform: translateX(-{value}%);"
    ></div>
</div>
