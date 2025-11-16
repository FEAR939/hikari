import { router } from "../../lib/router/index";
import { authService } from "../../services/auth";
import { AccountAvatar } from "../accountAvatar/index";
import { h } from "../../lib/jsx/runtime";
import { createSignal, bind } from "../../lib/jsx/reactive";

export function accountMenu() {
  const [user, setUser, subscribeUser] = createSignal<null | {
    username: string;
    email: string;
  }>(null);
  const menu = (
    <div class="absolute z-5 top-8 right-0 translate-x-1/2 h-fit w-64 p-1 opacity-0 hidden bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl space-y-1 scale-75 transition-all ease-in-out duration-150">
      <div class="flex space-x-2 p-1 pb-2 mb-2 items-center border-b border-white/10">
        <AccountAvatar />
        {bind([user, setUser, subscribeUser], (value) => (
          <div class="h-8 flex flex-col justify-around">
            <div class="text-sm inline-block leading-none">
              {value?.username || "Anonymous"}
            </div>
            <div class="text-xs text-neutral-500 leading-none">
              {value?.email || "No email"}
            </div>
          </div>
        ))}
      </div>
      <div
        class="w-full px-3 py-2 rounded-md text-sm text-neutral-500 flex items-center space-x-2 cursor-pointer hover:bg-neutral-950/75 hover:text-neutral-300 transition-all duration-100"
        onclick={() => {
          router.navigate("/settings", { intoContainer: false });
          menu.toggleVisibility();
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-settings-icon lucide-settings size-4"
        >
          <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span class="leading-none">Settings</span>
      </div>
      <div
        class="w-full px-3 py-2 rounded-md text-sm text-neutral-500 flex items-center space-x-2 cursor-pointer hover:bg-neutral-950/75 hover:text-neutral-300 transition-all duration-100"
        onclick={() => {
          menu.toggleVisibility();
          if (user() === null) return router.navigate("/auth");

          // else logout
          authService.logout();
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-log-out-icon lucide-log-out size-4"
        >
          <path d="m16 17 5-5-5-5" />
          <path d="M21 12H9" />
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        </svg>
        {bind([user, setUser, subscribeUser], (value) => (
          <span class="leading-none">
            {value ? "Logout" : "Sign In or Register"}
          </span>
        ))}
      </div>
    </div>
  ) as HTMLElement;

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

  authService.subscribe((user) => {
    if (user) {
      setUser(user);
    } else {
      setUser(null);
    }
  });

  return menu;
}
