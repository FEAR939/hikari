import { h } from "../../lib/jsx/runtime";
import { createSignal } from "../../lib/jsx/reactive";
import { cn } from "../../lib/util";

interface TooltipProps {
  content: string | HTMLElement;
  children?: any;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = "top",
  delay = 500,
  className = "",
}: TooltipProps) {
  const [isVisible, setIsVisible, subscribeVisible] = createSignal(false);
  let triggerRef: HTMLElement;
  let tooltipElement: HTMLDivElement | null = null;
  let showTimeout: NodeJS.Timeout | null = null;

  const calculatePosition = () => {
    if (!triggerRef || !tooltipElement) return { top: 0, left: 0 };

    const triggerRect = triggerRef.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();
    const gap = 12; // Space between element and tooltip (includes arrow)

    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case "bottom":
        top = triggerRect.bottom + gap;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case "left":
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case "right":
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.right + gap;
        break;
    }

    // Keep on screen with padding
    const padding = 8;
    left = Math.max(
      padding,
      Math.min(left, window.innerWidth - tooltipRect.width - padding),
    );
    top = Math.max(
      padding,
      Math.min(top, window.innerHeight - tooltipRect.height - padding),
    );

    return { top, left };
  };

  const updatePosition = () => {
    if (!tooltipElement || !triggerRef) return;
    const { top, left } = calculatePosition();
    tooltipElement.style.top = `${top}px`;
    tooltipElement.style.left = `${left}px`;
  };

  subscribeVisible(() => {
    const visible = isVisible();
    if (visible) {
      // Create tooltip element
      tooltipElement = (
        <div
          class={cn(
            "fixed z-9999 w-max max-w-[250px] px-3 py-2 text-sm text-white bg-neutral-900 rounded-lg shadow-xl pointer-events-none",
            "opacity-0",
            className,
          )}
          style="top: -9999px; left: -9999px;"
        >
          {/* Arrow pointer */}
          <div
            class={cn(
              "absolute w-2 h-2 bg-neutral-900 rotate-45",
              position === "top" && "-bottom-1 left-1/2 -translate-x-1/2",
              position === "bottom" && "-top-1 left-1/2 -translate-x-1/2",
              position === "left" && "-right1 top-1/2 -translate-y-1/2",
              position === "right" && "-left-1 top-1/2 -translate-y-1/2",
            )}
          />

          {/* Content */}
          <div class="relative z-1">
            {typeof content === "string" ? content : content}
          </div>
        </div>
      ) as HTMLDivElement;

      document.body.appendChild(tooltipElement);

      // Calculate position after element is in DOM (so we can measure it)
      requestAnimationFrame(() => {
        if (!tooltipElement) return;

        const { top, left } = calculatePosition();
        tooltipElement.style.top = `${top}px`;
        tooltipElement.style.left = `${left}px`;

        // Fade in after positioning
        requestAnimationFrame(() => {
          if (tooltipElement) {
            tooltipElement.style.transition = "opacity 150ms ease-out";
            tooltipElement.style.opacity = "1";
          }
        });
      });

      // Update position on scroll/resize
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      // Store cleanup function
      (tooltipElement as any).__cleanup = () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    } else {
      if (tooltipElement) {
        (tooltipElement as any).__cleanup?.();
        tooltipElement.remove();
        tooltipElement = null;
      }
    }
  });

  const handleMouseEnter = () => {
    showTimeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (showTimeout) {
      clearTimeout(showTimeout);
      showTimeout = null;
    }
    setIsVisible(false);
  };

  return (
    <div
      ref={(el: HTMLElement) => (triggerRef = el as HTMLElement)}
      class="inline-block"
      onmouseenter={handleMouseEnter}
      onmouseleave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
