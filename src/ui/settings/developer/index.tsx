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
      default: "Open",
    },
  ];

  const page = (
    <div class="h-full w-full space-y-4 overflow-y-scroll">
      <div class="text-xl">Developer Settings</div>
      {settings.map((setting) => (
        <div class="relative flex flex-col justify-center h-fit w-full bg-neutral-900 border-1 border-neutral-700/50 rounded-md overflow-hidden">
          <div class="px-3 py-2 text-sm border-b-1 border-neutral-700/50 text-neutral-400 space-x-2">
            <span class="text-blue-400">{setting.category}</span>
            <span>{setting.name}</span>
          </div>
          <div class="text-sm text-neutral-400 px-3 py-2 whitespace-pre-wrap">
            {setting.description}
          </div>
          <div class="px-1.5 pb-1.5 w-full">
            {setting.type === "button" && (
              <div
                class="px-2 py-1 w-fit text-sm bg-neutral-800 text-neutral-200 rounded cursor-pointer"
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
