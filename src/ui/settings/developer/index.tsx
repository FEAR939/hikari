import { h } from "../../../lib/jsx/runtime";

export default function DeveloperSettings() {
  const settings = [
    {
      name: "Open Developer Tools",
      description: "Open the developer tools.",
      type: "button",
      category: "Debug",
      storageKey: null,
      onchange: null,
      onclick: () => {
        window.electronAPI?.openDevTools();
      },
      newValue: null,
      default: "Open Devtools",
    },
  ];

  const page = (
    <div class="h-full w-full space-y-4 overflow-y-scroll">
      <div class="text-xl">Developer Settings</div>
      {settings.map((setting) => (
        <div class="bg-neutral-950/75 border border-white/10 rounded-lg h-fit w-full p-4 flex gap-2">
          <div class="h-fit w-full space-y-1">
            <div class="text-neutral-200 text-sm">{setting.name}</div>
            <div class="text-neutral-500 text-xs">{setting.description}</div>
          </div>
          <div class="flex items-center">
            {setting.type === "button" && (
              <div
                class="px-4 py-2 w-fit text-sm bg-neutral-200 hover:bg-neutral-400 text-black rounded cursor-pointer transition-colors duration-150 text-nowrap"
                onClick={() => {
                  setting.onclick?.();
                }}
              >
                {setting.default}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  ) as HTMLDivElement;

  return page;
}
