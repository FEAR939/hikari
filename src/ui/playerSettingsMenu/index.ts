import { Toggle } from "../toggle";

export function PlayerSettingsMenu() {
  const menu = document.createElement("div");
  menu.className =
    "absolute right-4 bottom-16 h-36 w-65 bg-black/75 rounded-md shadow-md overflow-hidden";
  menu.style.display = "none";

  menu.setVisibility = (state: boolean) => {
    menu.style.display = state ? "block" : "none";
  };

  const autoSkip = document.createElement("div");
  autoSkip.className =
    "flex items-center justify-between px-4 py-2 hover:bg-neutral-700";

  const autoSkipLabel = document.createElement("div");
  autoSkipLabel.textContent = "Auto Skip";

  autoSkip.appendChild(autoSkipLabel);

  const autoSkipToggle = Toggle(() => {});

  autoSkip.appendChild(autoSkipToggle);

  menu.appendChild(autoSkip);

  return menu;
}
