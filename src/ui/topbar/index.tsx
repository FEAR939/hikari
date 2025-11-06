import { h } from "../../lib/jsx/runtime";
import { router } from "../../lib/router/index";
import { AccountAvatar } from "../accountAvatar/index";
import { accountMenu } from "../accountMenu/index";
import { createSignal, bind } from "../../lib/jsx/reactive";
import { Tooltip } from "../Tooltip";

export function TopBar() {
  const [hasUpdate, setHasUpdate, subscribeUpdate] = createSignal(false);
  let avatarRef: HTMLDivElement;

  // Listen for update availability
  window.electronAPI?.onUpdateAvailable(() => {
    setHasUpdate(true);
  });

  const avatar = AccountAvatar();
  const avatarMenu = accountMenu();

  // Setup avatar menu
  avatar.appendChild(avatarMenu);
  avatarMenu.registerTrigger(avatar);

  avatar.addEventListener("click", (e) => {
    if (e.target === avatarMenu || avatarMenu.contains(e.target as Node))
      return;
    avatarMenu.toggleVisibility();
  });

  return (
    <div class="absolute z-4 top-0 left-0 right-0 pr-36 h-12 w-full px-4 flex items-center justify-end space-x-4">
      <div class="ml-12 mb-auto w-full h-8 [app-region:drag]"></div>
      {/* Update Available Button */}
      {bind([hasUpdate, setHasUpdate, subscribeUpdate], (updateAvailable) => (
        <Tooltip
          content="Update available, click to restart and apply"
          position="bottom"
          delay={0}
        >
          <div
            class={`flex items-center justify-center size-5 text-green-500 cursor-pointer ${
              updateAvailable ? "" : "hidden"
            }`}
            onClick={() => {
              if (updateAvailable) {
                window.electronAPI?.restartAndUpdate();
              }
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
              class="lucide lucide-download size-5"
            >
              <path d="M12 15V3" />
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="m7 10 5 5 5-5" />
            </svg>
          </div>
        </Tooltip>
      ))}

      {/* Search Button */}
      <Tooltip content="Search" position="bottom" delay={300}>
        <div
          class="flex items-center justify-center size-5 rounded-full cursor-pointer"
          onClick={() => router.navigate("/search")}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="size-5"
          >
            <path
              d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </Tooltip>

      {/* Account Avatar */}
      {avatar}
    </div>
  );
}
