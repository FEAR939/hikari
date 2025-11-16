export function NumberInput() {
  const wrapper = document.createElement("div");
  wrapper.className =
    "relative w-full px-4 space-x-2 bg-neutral-950/50 outline-1 outline-white/10 rounded-lg flex items-center active:bg-white/10 active:scale-99 transition-all duration-150 ease-in-out";

  const icon = document.createElement("div");
  icon.className = "size-4 text-neutral-500";
  icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-video-icon lucide-list-video size-4"><path d="M21 5H3"/><path d="M10 12H3"/><path d="M10 19H3"/><path d="M15 12.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997a1 1 0 0 1-1.517-.86z"/></svg>`;

  wrapper.appendChild(icon);

  const input = document.createElement("input");
  input.className =
    "h-full w-full py-2 outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
  input.type = "number";

  const arrowBox = document.createElement("div");
  arrowBox.className = "absolute right-2 h-fit w-fit overflow-hidden";

  const upArrow = document.createElement("div");
  upArrow.className =
    "relative h-3.25 w-4 text-neutral-500 hover:text-neutral-300 overflow-hidden";
  upArrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-up-icon lucide-chevron-up size-4 absolute top-0"><path d="m18 15-6-6-6 6"/></svg>`;

  const downArrow = document.createElement("div");
  downArrow.className =
    "relative h-3.25 w-4 text-neutral-500 hover:text-neutral-300 overflow-hidden";
  downArrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down size-4 absolute bottom-0"><path d="m6 9 6 6 6-6"/></svg>`;

  upArrow.addEventListener("click", () => {
    input.value = (parseInt(input.value) + 1).toString();
    input.dispatchEvent(new Event("input"));
  });

  downArrow.addEventListener("click", () => {
    input.value = (parseInt(input.value) - 1).toString();
    input.dispatchEvent(new Event("input"));
  });

  arrowBox.appendChild(upArrow);
  arrowBox.appendChild(downArrow);

  wrapper.append(arrowBox);

  wrapper.appendChild(input);
  wrapper.field = input;

  return wrapper;
}
