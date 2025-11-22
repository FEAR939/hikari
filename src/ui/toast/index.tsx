import { h } from "@lib/jsx/runtime";
import { clsx } from "clsx";

export function Toast({
  children,
  className,
  ...props
}: {
  children?: HTMLElement[];
  className?: string;
}) {
  let toastRef: HTMLElement;

  return (
    <div
      class={clsx(
        `flex h-fit w-full p-4 rounded-xl bg-[#1d1d1d] border border-[#222222] gap-2`,
        className,
      )}
      ref={(el: HTMLElement) => {
        toastRef = el;
      }}
      {...props}
    >
      <div class="w-full h-fit">{children}</div>
      <div class="w-4 h-full cursor-pointer" onClick={() => toastRef.remove()}>
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
          class="lucide lucide-x size-4"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </div>
    </div>
  );
}
