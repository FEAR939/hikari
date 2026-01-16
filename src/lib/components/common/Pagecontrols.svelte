<script lang="ts">
    import { clsx } from "clsx";

    interface Props {
        totalPages: number;
        currentPage?: number;
        callback: (page: number) => void;
        class?: string;
    }

    let {
        totalPages,
        currentPage: initialPage = 1,
        callback,
        class: className = "",
    }: Props = $props();

    let currentPage = $state(initialPage);

    const handlePageChange = (page: number) => {
        currentPage = page;
        callback(page);
    };
</script>

{#snippet pageButton(page: number, isCurrent: boolean)}
    <button
        type="button"
        class={clsx(
            "size-6 grid place-items-center text-sm cursor-pointer",
            isCurrent
                ? "bg-gray-900 rounded-full text-white"
                : "text-neutral-500",
        )}
        onclick={() => handlePageChange(page)}
    >
        {page}
    </button>
{/snippet}

<div class={clsx("w-fit flex gap-2 items-center", className)}>
    <!-- Previous Button -->
    <button
        type="button"
        class={clsx(
            "size-4",
            currentPage === 1 ? "text-neutral-500" : "cursor-pointer",
        )}
        onclick={() => {
            if (currentPage > 1) handlePageChange(currentPage - 1);
        }}
        disabled={currentPage === 1}
        aria-label="previous"
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
            class="lucide lucide-chevron-left size-4"
        >
            <path d="m15 18-6-6 6-6" />
        </svg>
    </button>

    <!-- Page Numbers -->
    <div class="flex">
        <!-- First page (always visible) -->
        {@render pageButton(1, currentPage === 1)}

        <!-- Current page - 1 (if not adjacent to first) -->
        {#if currentPage - 1 > 1}
            {@render pageButton(currentPage - 1, false)}
        {/if}

        <!-- Current page (if not first or last) -->
        {#if currentPage > 1 && currentPage < totalPages}
            {@render pageButton(currentPage, true)}
        {/if}

        <!-- Current page + 1 (if not adjacent to last) -->
        {#if currentPage + 1 < totalPages}
            {@render pageButton(currentPage + 1, false)}
        {/if}

        <!-- Last page (if more than 1 page) -->
        {#if totalPages > 1}
            {@render pageButton(totalPages, currentPage === totalPages)}
        {/if}
    </div>

    <!-- Next Button -->
    <button
        type="button"
        class={clsx(
            "size-4",
            currentPage === totalPages ? "text-neutral-500" : "cursor-pointer",
        )}
        onclick={() => {
            if (currentPage < totalPages) handlePageChange(currentPage + 1);
        }}
        disabled={currentPage === totalPages}
        aria-label="next"
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
            class="lucide lucide-chevron-right size-4"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    </button>
</div>
