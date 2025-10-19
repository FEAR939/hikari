export function PageControls({
  totalPages,
  currentPage = 1,
  callback,
}: {
  totalPages: number;
  currentPage: number;
  callback: (page: number) => void;
}) {
  const container = document.createElement("div");
  container.className = "w-fit flex gap-2 items-center";

  // Helper function to create page button
  const createPageButton = (pageNumber: number, isCurrent: boolean = false) => {
    const button = document.createElement("div");
    button.textContent = String(pageNumber);
    button.className = isCurrent
      ? "px-2 py-1 bg-neutral-800 rounded text-white cursor-pointer"
      : "px-1 py-1 text-neutral-500 cursor-pointer";

    button.onclick = () => {
      currentPage = pageNumber;
      callback(currentPage);
      updatePageControls();
    };

    return button;
  };

  // Function to update page controls
  const updatePageControls = () => {
    container.innerHTML = "";

    const pageBack = document.createElement("div");
    pageBack.className = `size-4 ${currentPage === 1 ? "text-neutral-500" : "cursor-pointer"}`;
    pageBack.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left-icon lucide-chevron-left size-4"><path d="m15 18-6-6 6-6"/></svg>`;

    container.appendChild(pageBack);

    pageBack.onclick = () => {
      if (currentPage === 1) return;
      currentPage = Math.max(currentPage - 1, 1);
      callback(currentPage);
      updatePageControls();
    };

    // Field 1: First page (always visible)
    container.appendChild(createPageButton(1, currentPage === 1));

    // Field 2: Current page - 1 (only if it's not the first page and not adjacent to first)
    if (currentPage - 1 > 1) {
      container.appendChild(createPageButton(currentPage - 1));
    }

    // Field 3: Current page (only if it's not first or last page)
    if (currentPage > 1 && currentPage < totalPages) {
      container.appendChild(createPageButton(currentPage, true));
    }

    // Field 4: Current page + 1 (only if it's not the last page and not adjacent to last)
    if (currentPage + 1 < totalPages) {
      container.appendChild(createPageButton(currentPage + 1));
    }

    // Field 5: Last page (always visible, only if there's more than 1 page)
    if (totalPages > 1) {
      container.appendChild(
        createPageButton(totalPages, currentPage === totalPages),
      );
    }

    const pageForward = document.createElement("div");
    pageForward.className = `size-4 ${currentPage === totalPages ? "text-neutral-500" : "cursor-pointer"}`;
    pageForward.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right-icon lucide-chevron-right size-4"><path d="m9 18 6-6-6-6"/></svg>`;

    container.appendChild(pageForward);

    pageForward.onclick = () => {
      if (currentPage === totalPages) return;
      currentPage = Math.min(currentPage + 1, totalPages);
      callback(currentPage);
      updatePageControls();
    };
  };

  // Initial render
  updatePageControls();

  return container;
}
