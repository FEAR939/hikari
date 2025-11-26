import { h } from "@lib/jsx/runtime";
import { createSignal, onCleanup } from "@lib/jsx/reactive";
import clsx from "clsx";

interface DropdownMenuProps {
  className?: string;
  placeholder?: string;
  children: HTMLElement[] | HTMLElement[][];
  onChange?: (value: string) => void;
}

export default function DropdownMenu({
  className = "",
  placeholder = "Select",
  children,
  onChange,
}: DropdownMenuProps) {
  const [open, setOpen, subscribeOpen] = createSignal(false);
  const [selectedValue, setSelectedValue, subscribeValue] = createSignal<
    string | null
  >(null);
  const [selectedLabel, setSelectedLabel, subscribeLabel] = createSignal<
    string | null
  >(null);

  // Normalize children to flat array
  const items = Array.isArray(children[0]) ? children[0] : children;

  // Attach click handlers to menu items
  items.forEach((child: HTMLElement) => {
    if (child instanceof HTMLElement) {
      child.addEventListener("click", (e) => {
        e.stopPropagation();
        const value =
          child.getAttribute("data-value") || child.getAttribute("value");
        const label = child.textContent || value;

        setSelectedValue(value);
        setSelectedLabel(label);
        setOpen(false);

        if (onChange && value) {
          onChange(value);
        }
      });

      // Add hover styles
      child.classList.add(
        "cursor-pointer",
        "px-2",
        "py-1",
        "rounded",
        "hover:bg-white/10",
        "transition-colors",
      );
    }
  });

  // Close dropdown when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    if (open()) {
      setOpen(false);
    }
  };

  // Add global click listener (you may need to adapt cleanup based on your framework)
  setTimeout(() => {
    document.addEventListener("click", handleClickOutside);
  }, 0);

  return (
    <div
      class={clsx("relative h-8 w-fit text-xs", className)}
      onClick={(e: MouseEvent) => e.stopPropagation()}
    >
      {/* Trigger Button */}
      <button
        type="button"
        class={clsx(
          "h-full min-w-[120px] px-3 flex items-center justify-between gap-2",
        )}
        onClick={() => setOpen(!open())}
        aria-haspopup="listbox"
        ref={(el: HTMLElement) => {
          subscribeOpen(() => {
            el.setAttribute("aria-expanded", String(open()));
          });
        }}
      >
        <span
          ref={(el: HTMLElement) => {
            subscribeLabel(() => {
              el.textContent = selectedLabel() || placeholder;
              el.classList.toggle("text-white/50", !selectedLabel());
            });
          }}
          class={clsx(!selectedLabel() && "text-white/50")}
        >
          {placeholder}
        </span>

        {/* Chevron Icon */}
        <svg
          class="w-4 h-4 transition-transform"
          ref={(el: SVGElement) => {
            subscribeOpen(() => {
              el.style.transform = open() ? "rotate(180deg)" : "rotate(0deg)";
            });
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Panel */}
      <div
        role="listbox"
        class={clsx(
          "absolute z-50 top-full mt-1 right-0",
          "min-w-full w-max max-h-60 overflow-y-auto",
          "rounded-lg border border-[#303030] bg-[#262626]",
          "shadow-lg p-1",
          "hidden",
        )}
        ref={(el: HTMLElement) => {
          subscribeOpen(() => {
            el.classList.toggle("hidden", !open());
          });
        }}
      >
        {items}
      </div>
    </div>
  );
}

export function DropdownItem({
  value,
  children,
}: {
  value: string;
  children: any;
}) {
  return (
    <div data-value={value} role="option">
      {children}
    </div>
  );
}
