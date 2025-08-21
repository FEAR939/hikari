import { authService } from "../../services/AuthService";

export function accountAvatar() {
  const avatar = document.createElement("div");
  avatar.className = "relative size-8";

  const avatarContainer = document.createElement("div");
  avatarContainer.className = "absolute inset-0 cursor-pointer";

  avatar.appendChild(avatarContainer);

  handleAvatarImage();

  authService.subscribe((user) => {
    if (!user) handleAvatarImage();

    handleAvatarImage(user);
  });

  function handleAvatarImage(user?: User) {
    if (!user) {
      avatarContainer.innerHTML = `<svg fill="#c0c0c0" viewBox="0 0 32 32" id="icon" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <defs> <style> .cls-1 { fill: none; } </style> </defs> <path id="_inner-path_" data-name="&lt;inner-path&gt;" class="cls-1" d="M8.0071,24.93A4.9958,4.9958,0,0,1,13,20h6a4.9959,4.9959,0,0,1,4.9929,4.93,11.94,11.94,0,0,1-15.9858,0ZM20.5,12.5A4.5,4.5,0,1,1,16,8,4.5,4.5,0,0,1,20.5,12.5Z"></path> <path d="M26.7489,24.93A13.9893,13.9893,0,1,0,2,16a13.899,13.899,0,0,0,3.2511,8.93l-.02.0166c.07.0845.15.1567.2222.2392.09.1036.1864.2.28.3008.28.3033.5674.5952.87.87.0915.0831.1864.1612.28.2417.32.2759.6484.5372.99.7813.0441.0312.0832.0693.1276.1006v-.0127a13.9011,13.9011,0,0,0,16,0V27.48c.0444-.0313.0835-.0694.1276-.1006.3412-.2441.67-.5054.99-.7813.0936-.1006.1894-.1972.28-.3008.0719-.0825.1522-.1547.2222-.2392ZM16,8a4.5,4.5,0,1,1-4.5,4.5A4.5,4.5,0,0,1,16,8ZM8.0071,24.93A4.9957,4.9957,0,0,1,13,20h6a4.9958,4.9958,0,0,1,4.9929,4.93,11.94,11.94,0,0,1-15.9858,0Z"></path> <rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" class="cls-1" width="32" height="32"></rect> </g></svg>`;
      return;
    } else if (!user.avatar) {
      avatarContainer.innerHTML = `<div class="h-full w-full flex items-center justify-center bg-gray-300 rounded-full">${user.username.replaceAll(" ", "").substring(0, 2).toUpperCase()}</div>`;
      return;
    }

    avatarContainer.innerHTML = `<img src="${user.avatar}" alt="Avatar" class="absolute inset-0 w-full h-full object-cover object-center" />`;
  }

  return avatar;
}
