import { twMerge } from "tailwind-merge";
import { clsx, ClassValue } from "clsx";

export function debounce(callback, wait) {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(...args);
    }, wait);
  };
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
