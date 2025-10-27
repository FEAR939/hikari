import { h } from "../../lib/jsx/runtime";
import { createSignal, bind } from "../../lib/jsx/reactive";
import { cn } from "../../lib/util";

export function PageControls({
  totalPages,
  currentPage: initialPage = 1,
  callback,
  className = "",
}: {
  totalPages: number;
  currentPage?: number;
  callback: (page: number) => void;
  className?: string;
}) {
  const [currentPage, setCurrentPage, subscribeCurrentPage] =
    createSignal(initialPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    callback(page);
  };

  const PageButton = ({
    page,
    isCurrent,
  }: {
    page: number;
    isCurrent: boolean;
  }) => (
    <div
      class={cn(
        "px-2 py-1 cursor-pointer",
        isCurrent ? "bg-neutral-800 rounded text-white" : "text-neutral-500",
      )}
      onClick={() => handlePageChange(page)}
    >
      {page}
    </div>
  );

  return (
    <div class={cn("w-fit flex gap-2 items-center", className)}>
      {/* Previous Button */}
      {bind([currentPage, setCurrentPage, subscribeCurrentPage], (page) => (
        <div
          class={cn(
            "size-4",
            page === 1 ? "text-neutral-500" : "cursor-pointer",
          )}
          onClick={() => {
            if (page > 1) handlePageChange(page - 1);
          }}
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
        </div>
      ))}

      {/* Page Numbers */}
      {bind([currentPage, setCurrentPage, subscribeCurrentPage], (page) => (
        <div class="flex">
          {/* First page (always visible) */}
          <PageButton page={1} isCurrent={page === 1} />

          {/* Current page - 1 (if not adjacent to first) */}
          {page - 1 > 1 && <PageButton page={page - 1} isCurrent={false} />}

          {/* Current page (if not first or last) */}
          {page > 1 && page < totalPages && (
            <PageButton page={page} isCurrent={true} />
          )}

          {/* Current page + 1 (if not adjacent to last) */}
          {page + 1 < totalPages && (
            <PageButton page={page + 1} isCurrent={false} />
          )}

          {/* Last page (if more than 1 page) */}
          {totalPages > 1 && (
            <PageButton page={totalPages} isCurrent={page === totalPages} />
          )}
        </div>
      ))}

      {/* Next Button */}
      {bind([currentPage, setCurrentPage, subscribeCurrentPage], (page) => (
        <div
          class={cn(
            "size-4",
            page === totalPages ? "text-neutral-500" : "cursor-pointer",
          )}
          onClick={() => {
            if (page < totalPages) handlePageChange(page + 1);
          }}
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
        </div>
      ))}
    </div>
  );
}
