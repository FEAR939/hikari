import { router } from "../../lib/router/index";
import { h } from "../../lib/jsx/runtime";
import { createSignal, bind } from "../../lib/jsx/reactive";
import ClientSettings from "../../ui/settings/client/index";
import AccountSettings from "../../ui/settings/account/index";
import ExtensionSettings from "../../ui/settings/extensions/index";
import DeveloperSettings from "../../ui/settings/developer/index";

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
  {
    label: "Developer",
    handler: DeveloperSettings,
  },
];

export default async function Settings(query) {
  const [currSettings, setCurrSettings, subscribeCurrSettings] =
    createSignal(0);
  const page = (
    <div class="relative h-full w-full space-x-2 space-y-4">
      <div class="h-full w-full flex">
        <div class="h-full w-xs bg-neutral-950 border-r border-neutral-700/50 p-4 pt-12 space-y-2">
          <div class="text-xl">Settings</div>
          <div class="">
            {settingsTree.map((setting, index: number) =>
              bind(
                [currSettings, setCurrSettings, subscribeCurrSettings],
                (value) => (
                  <div
                    class={`w-full px-3 py-2 rounded-md ${value === index ? "bg-neutral-900" : ""} cursor-pointer`}
                    onClick={() => setCurrSettings(index)}
                  >
                    {setting.label}
                  </div>
                ),
              ),
            )}
          </div>
          <div class="absolute bottom-4 text-neutral-500 text-sm">
            {`Hikari version: ${await window.electronAPI?.getAppVersion()}`}
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
}
