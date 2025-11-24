import { h } from "@lib/jsx/runtime";

export function NumberInput() {
  let inputRef: HTMLInputElement;
  let titleRef: HTMLDivElement;

  const wrapper = (
    <div
      class="relative w-full h-8 px-4 space-x-2 bg-[#1d1d1d] border border-[#222222] rounded-full flex items-center cursor-pointer"
      onClick={() => inputRef.focus()}
    >
      <div class="size-4 text-neutral-500">
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
          class="lucide lucide-list-video-icon lucide-list-video size-4"
        >
          <path d="M21 5H3" />
          <path d="M10 12H3" />
          <path d="M10 19H3" />
          <path d="M15 12.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997a1 1 0 0 1-1.517-.86z" />
        </svg>
      </div>
      <div class="text-neutral-500 mr-0">E</div>
      <input
        class="w-fit p-0 outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        type="number"
        ref={(el: HTMLInputElement) => (inputRef = el)}
      ></input>
      <div class="text-neutral-500 ml-0">|</div>
      <div
        class="text-neutral-500 ml-4"
        ref={(el: HTMLDivElement) => (titleRef = el)}
      ></div>
      <div class="absolute right-2 h-fit w-fit overflow-hidden">
        <div
          class="relative h-3.25 w-4 text-neutral-500 hover:text-neutral-300 overflow-hidden"
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            inputRef.value = (parseInt(inputRef.value) + 1).toString();
            inputRef.dispatchEvent(new Event("input"));
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
            class="lucide lucide-chevron-up-icon lucide-chevron-up size-4 absolute top-0"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
        </div>
        <div
          class="relative h-3.25 w-4 text-neutral-500 hover:text-neutral-300 overflow-hidden"
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            inputRef.value = (parseInt(inputRef.value) - 1).toString();
            inputRef.dispatchEvent(new Event("input"));
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
            class="lucide lucide-chevron-down-icon lucide-chevron-down size-4 absolute bottom-0"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>
  ) as HTMLDivElement;

  wrapper.input = inputRef;
  wrapper.titlefield = titleRef;

  return wrapper;
}
