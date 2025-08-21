import { router } from "../../lib/router/index";
import { authService } from "../../services/AuthService";
import { accountAvatar } from "../accountAvatar/index";

export function accountMenu() {
  const menu = document.createElement("div");
  menu.className =
    "absolute top-10 right-0 h-fit w-64 p-4 hidden bg-[#0d0d0d] rounded-xl space-y-4";

  menu.toggleVisibility = () => {
    menu.classList.toggle("hidden");
  };

  menu.appendChild(accountAvatar());

  let state = 0;

  const signButton = document.createElement("div");
  signButton.className =
    "w-full px-2 py-1 rounded-md bg-white text-black cursor-pointer";
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

    signButton.textContent = "Signout";
    state = 1;
  }

  return menu;
}
