import { router } from "../../lib/router/index";
import { accountAvatar } from "../accountAvatar/index";
import { accountMenu } from "../accountMenu/index";

export function topBar() {
  const bar = document.createElement("div");
  bar.className =
    "absolute top-0 left-0 right-0 h-12 w-full px-4 flex items-center justify-end space-x-2 bg-gradient-to-t from-transparent to-[#0d0d0d]";

  const search = document.createElement("div");
  search.className =
    "flex items-center justify-center w-8 h-8 rounded-full cursor-pointer";
  search.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-icon lucide-search"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>`;

  bar.appendChild(search);

  search.addEventListener("click", () => {
    router.navigate("/search");
  });

  const avatar = accountAvatar();

  const avatarMenu = accountMenu();

  avatar.appendChild(avatarMenu);

  avatar.addEventListener("click", (e) => {
    if (e.target === avatarMenu || avatarMenu.contains(e.target)) return;
    avatarMenu.toggleVisibility();
  });

  bar.appendChild(avatar);

  return bar;
}
