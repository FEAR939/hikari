import { h } from "../../lib/jsx/runtime";
import { createSignal, bind } from "../../lib/jsx/reactive";
import { cn } from "../../lib/util";

export function Toggle({
  callback,
  className = "",
  initial = false,
}: {
  callback: (state: boolean) => void;
  className?: string;
  initial?: boolean;
}) {
  const [state, setState, subscribeState] = createSignal(initial);

  // Create the knob element once
  const knob = (
    <div class="h-full aspect-square rounded-full bg-neutral-950 transition-transform duration-300 ease-in-out"></div>
  ) as HTMLDivElement;

  // Create the container once
  const container = (
    <div
      onClick={() => {
        setState(!state());
        callback(state());
      }}
      class={cn(
        "h-4 w-8 p-0.5 shrink-0 grow-0 rounded-full flex items-center transition-colors duration-300 ease-in-out cursor-pointer",
        className,
      )}
    >
      {knob}
    </div>
  ) as HTMLDivElement;

  // Subscribe to state changes and update classes
  subscribeState(() => {
    const value = state();
    // Update container background
    if (value) {
      container.classList.remove("bg-neutral-800");
      container.classList.add("bg-neutral-200");
    } else {
      container.classList.remove("bg-neutral-200");
      container.classList.add("bg-neutral-800");
    }

    // Update knob position
    if (value) {
      knob.classList.add("translate-x-[125%]");
    } else {
      knob.classList.remove("translate-x-[125%]");
    }
  });

  // Set initial state
  if (initial) {
    container.classList.add("bg-neutral-200");
    knob.classList.add("translate-x-[125%]");
  } else {
    container.classList.add("bg-neutral-800");
  }

  return container;
}
