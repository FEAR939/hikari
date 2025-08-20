import { accountAvatar } from "../accountAvatar/index";

export function accountMenu() {
  const menu = document.createElement("div");
  menu.className =
    "absolute top-10 right-0 h-fit w-64 p-4 hidden bg-[#0d0d0d] rounded-xl space-y-4";

  menu.toggleVisibility = () => {
    menu.classList.toggle("hidden");
  };

  menu.appendChild(accountAvatar());

  const signButton = document.createElement("div");
  signButton.className =
    "w-full px-2 py-1 rounded-md bg-white text-black cursor-pointer";
  signButton.textContent = "Signup | Signin";

  menu.appendChild(signButton);

  signButton.addEventListener("click", () => {
    document.router.navigate("/auth");
  });

  return menu;
}
