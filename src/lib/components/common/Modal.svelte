<script lang="ts">
    import { onDestroy } from "svelte";
    import { twMerge } from "tailwind-merge";
    import { fade, scale } from "svelte/transition";

    let {
        children,
        show = $bindable(true),
        class: className,
        classModal,
    } = $props();

    let modalElement = null;

    $effect(() => {
        if (show && modalElement) {
            document.body.appendChild(modalElement);
        } else if (modalElement?.parentElement === document.body) {
            document.body.removeChild(modalElement);
        }
    });

    onDestroy(() => {
        show = false;
        if (modalElement) {
            document.body.removeChild(modalElement);
        }
    });
</script>

{#if show}
    <div
        bind:this={modalElement}
        aria-modal="true"
        role="dialog"
        class={twMerge(
            "modal fixed inset-0 bg-black/30 dark:bg-black/60 w-full h-screen max-h-[100dvh] flex justify-center z-999 overflow-y-auto overscroll-contain",
            className,
        )}
        in:fade={{ duration: 10 }}
    >
        <div
            class={twMerge(
                "m-auto max-w-full w-[70rem] shadow-3xl min-h-fit scrollbar-hidden border border-white dark:border-gray-900 p-3 bg-white/95 dark:bg-black/70 backdrop-blur-2xl rounded-4xl",
                classModal,
            )}
            in:scale={{ duration: 200 }}
        >
            {@render children()}
        </div>
    </div>
{/if}
