export function NumberInput() {
  const wrapper = document.createElement("div");
  wrapper.className =
    "relative w-full bg-[#080808] outline-1 outline-[#1a1a1a] rounded-md flex items-center";

  const input = document.createElement("input");
  input.className =
    "h-full w-full px-4 py-2 outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
  input.type = "number";

  const arrowBox = document.createElement("div");
  arrowBox.className = "absolute right-2 h-fit w-fit bg-[#080808]";

  const upArrow = document.createElement("div");
  upArrow.className = "h-fit w-fit text-neutral-500 hover:text-neutral-300";
  upArrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-up-icon lucide-chevron-up size-4"><path d="m18 15-6-6-6 6"/></svg>`;

  const downArrow = document.createElement("div");
  downArrow.className = "h-fit w-fit text-neutral-500 hover:text-neutral-300";
  downArrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down-icon lucide-chevron-down size-4"><path d="m6 9 6 6 6-6"/></svg>`;

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
