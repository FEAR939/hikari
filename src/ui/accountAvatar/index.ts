import { authService } from "../../services/auth";
import { API } from "../../app";

export function accountAvatar() {
  const avatar = document.createElement("div");
  avatar.className = "relative size-8";

  const avatarContainer = document.createElement("div");
  avatarContainer.className =
    "absolute inset-0 flex items-center justify-center cursor-pointer";

  avatar.appendChild(avatarContainer);

  handleAvatarImage();

  authService.subscribe((user) => {
    if (!user) handleAvatarImage();

    handleAvatarImage(user);
  });

  function handleAvatarImage(user?: User) {
    if (!user) {
      avatarContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-icon lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
      return;
    } else if (user.avatar === null || user.avatar === "undefined") {
      avatarContainer.innerHTML = `<div class="h-full w-full flex items-center justify-center bg-gray-300 rounded-full">${user.username.replaceAll(" ", "").substring(0, 2).toUpperCase()}</div>`;
      return;
    }

    avatarContainer.innerHTML = `<img src="${API.baseurl}${user.avatar}" alt="Avatar" class="absolute inset-0 w-full h-full object-cover object-center rounded-full" />`;
  }

  const user = authService.getUser();
  if (!user) return avatar;

  handleAvatarImage(user);

  return avatar;
}
