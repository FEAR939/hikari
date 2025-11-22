import { router } from "@lib/router/index";
import { h } from "@lib/jsx/runtime";
import { createSignal, bind } from "@lib/jsx/reactive";
import ClientSettings from "@ui/settings/client/index";
import AccountSettings from "@ui/settings/account/index";
import ExtensionSettings from "@ui/settings/extensions/index";
import DeveloperSettings from "@ui/settings/developer/index";
import AboutSettings from "@ui/settings/about/index";

const settingsTree = [
  {
    icon: () => (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="size-5"
      >
        <path
          d="M5.3163 19.4384C5.92462 18.0052 7.34492 17 9 17H15C16.6551 17 18.0754 18.0052 18.6837 19.4384M16 9.5C16 11.7091 14.2091 13.5 12 13.5C9.79086 13.5 8 11.7091 8 9.5C8 7.29086 9.79086 5.5 12 5.5C14.2091 5.5 16 7.29086 16 9.5ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
    label: "Account",
    handler: AccountSettings,
    default: true,
  },
  {
    icon: () => (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="size-5"
      >
        <path
          d="M5 21L5 15M5 15C6.10457 15 7 14.1046 7 13C7 11.8954 6.10457 11 5 11C3.89543 11 3 11.8954 3 13C3 14.1046 3.89543 15 5 15ZM5 7V3M12 21V15M12 7V3M12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7ZM19 21V17M19 17C20.1046 17 21 16.1046 21 15C21 13.8954 20.1046 13 19 13C17.8954 13 17 13.8954 17 15C17 16.1046 17.8954 17 19 17ZM19 9V3"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
    label: "Client",
    handler: ClientSettings,
  },
  {
    icon: () => (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="size-5"
      >
        <path
          d="M7.5 4.5C7.5 3.11929 8.61929 2 10 2C11.3807 2 12.5 3.11929 12.5 4.5V6H13.5C14.8978 6 15.5967 6 16.1481 6.22836C16.8831 6.53284 17.4672 7.11687 17.7716 7.85195C18 8.40326 18 9.10218 18 10.5H19.5C20.8807 10.5 22 11.6193 22 13C22 14.3807 20.8807 15.5 19.5 15.5H18V17.2C18 18.8802 18 19.7202 17.673 20.362C17.3854 20.9265 16.9265 21.3854 16.362 21.673C15.7202 22 14.8802 22 13.2 22H12.5V20.25C12.5 19.0074 11.4926 18 10.25 18C9.00736 18 8 19.0074 8 20.25V22H6.8C5.11984 22 4.27976 22 3.63803 21.673C3.07354 21.3854 2.6146 20.9265 2.32698 20.362C2 19.7202 2 18.8802 2 17.2V15.5H3.5C4.88071 15.5 6 14.3807 6 13C6 11.6193 4.88071 10.5 3.5 10.5H2C2 9.10218 2 8.40326 2.22836 7.85195C2.53284 7.11687 3.11687 6.53284 3.85195 6.22836C4.40326 6 5.10218 6 6.5 6H7.5V4.5Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
    label: "Extensions",
    handler: ExtensionSettings,
  },
  {
    icon: () => (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="size-5"
      >
        <path
          d="M15.5 15L18.5 12L15.5 9M8.5 9L5.5 12L8.5 15M13 7L11 17M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
    label: "Developer",
    handler: DeveloperSettings,
  },
  {
    icon: () => (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="size-5"
      >
        <path
          d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    ),
    label: "About",
    handler: AboutSettings,
  },
];

export default async function Settings(query) {
  const [currSettings, setCurrSettings, subscribeCurrSettings] =
    createSignal(0);
  const page = (
    <div class="fixed z-100 bg-black/50 inset-0 overflow-y-auto overscroll-contain flex items-center justify-center">
      <div class="absolute m-auto max-w-full w-[70rem] mx-2 shadow-3xl aspect-video bg-[#171717] backdrop-blur-xl border border-white/10 rounded-3xl flex">
        <div
          class="absolute right-6 top-6 size-6 flex items-center justify-center cursor-pointer text-neutral-500 hover:text-neutral-200 transition-colors duration-150"
          onClick={() => {
            page.remove();
            router.restorePreviousState();
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
            class="lucide lucide-x size-6"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </div>
        <div class="h-full w-xs p-6 space-y-2 border-r border-white/10">
          <div class="text-xl">Settings</div>
          <div class="space-y-4">
            {settingsTree.map((setting, index: number) =>
              bind(
                [currSettings, setCurrSettings, subscribeCurrSettings],
                (value) => (
                  <div
                    class={`flex items-center gap-2 w-full ${value === index ? "text-neutral-200" : "text-neutral-500"} hover:text-neutral-200 transition-colors duration-150 cursor-pointer`}
                    onClick={() => setCurrSettings(index)}
                  >
                    {setting.icon()}
                    <div class="h-3 leading-none">{setting.label}</div>
                  </div>
                ),
              ),
            )}
          </div>
        </div>
        <div class="h-full w-full p-6">
          {bind(
            [currSettings, setCurrSettings, subscribeCurrSettings],
            (value) => settingsTree[value].handler(),
          )}
        </div>
      </div>
    </div>
  ) as HTMLElement;

  router.container!.appendChild(page);
}
