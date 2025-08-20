import { accountAvatar } from "../accountAvatar/index";
import { accountMenu } from "../accountMenu/index";

export function topBar() {
  const bar = document.createElement("div");
  bar.className =
    "absolute top-0 left-0 right-0 h-12 w-full px-4 flex items-center justify-end space-x-4";

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
