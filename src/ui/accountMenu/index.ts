import { router } from "../../lib/router/index";
import { authService } from "../../services/auth";
import { accountAvatar } from "../accountAvatar/index";

export function accountMenu() {
  const menu = document.createElement("div");
  menu.className =
    "absolute z-5 top-8 right-0 h-fit w-64 p-2 opacity-0 hidden bg-black/75 backdrop-blur-md rounded-lg ring-1 ring-gray-700/50 shadow-lg space-y-1 scale-75 transition-all ease-in-out duration-150";
  menu.trigger = null;

  let menustate = false;

  menu.registerTrigger = (node) => {
    menu.trigger = node;
  };

  menu.toggleVisibility = () => {
    menustate = !menustate;

    if (menustate) menu.classList.remove("hidden");
    menu.offsetHeight;
    menu.classList.toggle("opacity-0");
    menu.classList.toggle("translate-y-2");
    menu.classList.toggle("scale-75");

    menu.addEventListener("transitionend", function handler() {
      if (!menustate) menu.classList.add("hidden");
      menu.removeEventListener("transitionend", handler);
    });
  };

  window.addEventListener("click", (e) => {
    if (
      !menustate ||
      menu.contains(e.target) ||
      menu.trigger.contains(e.target)
    )
      return;

    menu.toggleVisibility();
  });

  const accountArea = document.createElement("div");
  accountArea.className = "flex space-x-2 p-1 mb-4 items-center";

  const avatar = accountAvatar();

  accountArea.appendChild(avatar);

  const accountSide = document.createElement("div");
  accountSide.className = "h-8 flex flex-col justify-around";

  const usernickname = document.createElement("div");
  usernickname.className = "text-sm inline-block leading-none";
  usernickname.textContent = "Anonymous";

  accountSide.appendChild(usernickname);

  const useremail = document.createElement("div");
  useremail.className = "text-xs text-neutral-500 leading-none";
  useremail.textContent = "Sign up for more features!";

  accountSide.appendChild(useremail);

  authService.subscribe((user) => {
    if (user) {
      usernickname.textContent = user.username;
      useremail.textContent = user.email;
    } else {
      usernickname.textContent = "Anonymous";
      useremail.textContent = "Sign up for more features!";
    }
  });

  accountArea.appendChild(accountSide);
  menu.appendChild(accountArea);

  const settingsLink = document.createElement("div");
  settingsLink.className =
    "w-full px-2 py-1 rounded text-sm text-[#e0e0e0] flex items-center space-x-2 cursor-pointer hover:bg-[#fafafa]/15 hover:backdrop-blur-xl transition-all duration-100";
  settingsLink.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings-icon lucide-settings size-4"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>
    <span>Settings</span>
  `;

  menu.appendChild(settingsLink);

  settingsLink.addEventListener("click", () => {
    router.navigate("/settings");
  });

  let state = 0;

  const signButton = document.createElement("div");
  signButton.className =
    "w-full px-2 py-1 rounded text-sm text-[#e0e0e0] flex items-center space-x-2 cursor-pointer hover:bg-[#fafafa]/15 hover:backdrop-blur-xl transition-all duration-100";
  signButton.textContent = "Signup | Signin";

  menu.appendChild(signButton);

  signButton.addEventListener("click", () => {
    if (state == 0) return router.navigate("/auth");

    // else logout
    authService.logout();
  });

  signMode();

  authService.subscribe((user) => {
    if (!user) return signMode();

    signMode(user);
  });

  function signMode(user?) {
    if (!user) {
      signButton.textContent = "Signup | Signin";
      state = 0;
      return;
    }

    signButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out-icon lucide-log-out size-4"><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg>
      <span>Sign Out</span>
    `;
    state = 1;
  }

  return menu;
}
