import { router } from "../../lib/router/index";
import { h } from "../../lib/jsx/runtime";
import { createSignal, bind } from "../../lib/jsx/reactive";
import ClientSettings from "../../ui/settings/client/index";
import AccountSettings from "../../ui/settings/account/index";
import ExtensionSettings from "../../ui/settings/extensions/index";

const settingsTree = [
  {
    label: "Account",
    handler: AccountSettings,
    default: true,
  },
  {
    label: "Client",
    handler: ClientSettings,
  },
  {
    label: "Extensions",
    handler: ExtensionSettings,
  },
];

export default async function Settings(query) {
  const [currSettings, setCurrSettings, subscribeCurrSettings] =
    createSignal(0);
  const page = (
    <div class="relative h-full w-full space-x-2 space-y-4">
      <div class="h-full w-full flex">
        <div class="h-full w-xs bg-neutral-950 border-r-1 border-neutral-700/50 p-4 pt-12 space-y-2">
          <div class="text-xl">Settings</div>
          <div class="">
            {settingsTree.map((setting, index: number) =>
              bind(
                [currSettings, setCurrSettings, subscribeCurrSettings],
                (value) => (
                  <div
                    class={`w-full px-3 py-2 rounded-md ${value === index ? "bg-neutral-900" : ""}`}
                    onClick={() => setCurrSettings(index)}
                  >
                    {setting.label}
                  </div>
                ),
              ),
            )}
          </div>
        </div>
        <div class="h-full w-full p-4 pt-12">
          {bind(
            [currSettings, setCurrSettings, subscribeCurrSettings],
            (value) => settingsTree[value].handler(),
          )}
        </div>
      </div>
    </div>
  ) as HTMLElement;

  router.container!.appendChild(page);

  // const page = document.createElement("div");
  // page.className = "relative h-full w-full p-4 pt-12 space-x-2 space-y-4";
  // router.container.appendChild(page);
  // const pageback = document.createElement("div");
  // pageback.className =
  //   "absolute z-10 top-2 left-4 size-8 flex items-center justify-center cursor-pointer";
  // pageback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left-to-line-icon lucide-arrow-left-to-line"><path d="M3 19V5"/><path d="m13 6-6 6 6 6"/><path d="M7 12h14"/></svg>`;
  // page.appendChild(pageback);
  // pageback.addEventListener("click", () => {
  //   router.navigate("/");
  // });
  // const header = document.createElement("div");
  // header.className = "h-fit w-full pb-4 border-b-1 border-[#1a1a1a]";
  // header.innerHTML = `
  //   <div class="text-xl">Settings</div>
  //   <div class="text-neutral-500">Manage your app settings, preferences, and more.</div>
  // `;
  // page.appendChild(header);
  // const row = document.createElement("div");
  // row.className = "flex h-full w-full gap-4";
  // page.appendChild(row);
  // const nav = document.createElement("div");
  // nav.className = "h-full w-64 overflow-y-scroll";
  // const content = document.createElement("div");
  // content.className = "h-full w-full overflow-y-hidden";
  // row.appendChild(nav);
  // row.appendChild(content);
  // settingsTree.map((item) => {
  //   const option = document.createElement("div");
  //   option.className =
  //     "w-full px-4 py-2 hover:bg-neutral-900 text-white rounded-md text-left cursor-pointer";
  //   option.textContent = item.label;
  //   option.addEventListener("click", () => {
  //     const tabPage = item.handler();
  //     content.innerHTML = "";
  //     content.appendChild(tabPage);
  //   });
  //   nav.appendChild(option);
  //   if (item.default) {
  //     const tabPage = item.handler();
  //     content.innerHTML = "";
  //     content.appendChild(tabPage);
  //   }
  // });
  // const versionArea = document.createElement("div");
  // versionArea.className =
  //   "absolute bottom-0 h-fit w-full p-4 text-neutral-500 text-sm";
  // versionArea.textContent = `Hikari ${await window.electronAPI?.getAppVersion()}`;
  // nav.appendChild(versionArea);
}
