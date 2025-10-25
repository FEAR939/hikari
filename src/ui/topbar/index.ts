import { router } from "../../lib/router/index";
import { AccountAvatar } from "../accountAvatar/index";
import { accountMenu } from "../accountMenu/index";

export function topBar() {
  const bar = document.createElement("div");
  bar.className =
    "absolute z-4 top-0 left-0 right-0 h-16 w-full px-4 flex items-center justify-end space-x-4 bg-gradient-to-t from-transparent to-[#0d0d0d]";

  let hasUpdate = false;

  const updateAvailable = document.createElement("div");
  updateAvailable.className =
    "flex items-center justify-center size-5 text-green-500 hidden cursor-pointer";
  updateAvailable.title = "Update available, click to restart and apply";
  updateAvailable.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download-icon lucide-download"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>`;

  window.electronAPI?.onUpdateAvailable(() => {
    hasUpdate = true;
    updateAvailable.classList.remove("hidden");
  });

  updateAvailable.addEventListener("click", () => {
    if (!hasUpdate) return;
    window.electronAPI?.restartAndUpdate();
  });

  bar.appendChild(updateAvailable);

  const search = document.createElement("div");
  search.className =
    "flex items-center justify-center size-5 rounded-full cursor-pointer";
  search.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-icon lucide-search size-5"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>`;

  bar.appendChild(search);

  search.addEventListener("click", () => {
    router.navigate("/search");
  });

  const avatar = AccountAvatar();

  const avatarMenu = accountMenu();

  avatar.appendChild(avatarMenu);
  avatarMenu.registerTrigger(avatar);

  avatar.addEventListener("click", (e) => {
    if (e.target === avatarMenu || avatarMenu.contains(e.target)) return;
    avatarMenu.toggleVisibility();
  });

  bar.appendChild(avatar);

  return bar;
}
