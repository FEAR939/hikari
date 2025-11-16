import { h } from "../../../lib/jsx/runtime";
import { createSignal, bind } from "../../../lib/jsx/reactive";
import { Toggle } from "../../toggle";

interface ExtensionConfig {
  id: string;
  enabled: boolean;
}

interface Extension {
  id: string;
  name: string;
  version: string;
  type: string;
  github: string;
}

export default function ExtensionSettings() {
  const [extensions, setExtensions, subscribeExtensions] = createSignal([]);
  let extensionsConfig: ExtensionConfig[] = [];

  let installInput: HTMLInputElement;

  const page = (
    <div class="h-full w-full space-y-4">
      <div class="text-xl">Extension Settings</div>
      <div class="flex h-fit w-full space-x-2">
        <div class="flex items-center space-x-2 px-4 h-10 w-full text-neutral-500 border border-neutral-500 bg-neutral-800 rounded-md">
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
            class="lucide lucide-link2-icon lucide-link-2 size-4"
          >
            <path d="M9 17H7A5 5 0 0 1 7 7h2" />
            <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
            <line x1="8" x2="16" y1="12" y2="12" />
          </svg>
          <input
            ref={(el: HTMLInputElement) => (installInput = el)}
            type="text"
            placeholder="Extension URL from GitHub"
            class="w-full py-2 border-none outline-none leading-none"
          />
        </div>
        <div
          class="w-1/3 px-4 py-2 flex items-center justify-center text-black bg-neutral-200 hover:bg-neutral-400 rounded-md cursor-pointer space-x-2 transition-colors duration-150"
          onClick={async () => {
            const url = installInput.value;
            if (!url || !url.match(/https:\/\/github\.com\/.*\.git/)) return;
            if (!localStorage.getItem("extensions.config")) {
              localStorage.setItem("extensions.config", JSON.stringify([]));
            }
            console.log("Installing extension:", url);
            const extension = await window.electronAPI?.installExtension(url);
            const extensionsConfig = JSON.parse(
              localStorage.getItem("extensions.config") || "[]",
            );
            extensionsConfig.push({ id: extension.github, enabled: true });
            load_extensions();
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
            class="lucide lucide-download-icon lucide-download size-4"
          >
            <path d="M12 15V3" />
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="m7 10 5 5 5-5" />
          </svg>
          <div>Install Extension</div>
        </div>
      </div>
      {bind([extensions, setExtensions, subscribeExtensions], (value) => (
        <div class="w-full h-fit space-y-2 mt-4">
          {value.length > 0 ? (
            value.map((extension: Extension) => {
              let extensionConfig = extensionsConfig.find(
                (config) => config.id === extension.github,
              );

              function handleState(state: boolean) {
                extensionConfig!.enabled = state;
                localStorage.setItem(
                  "extensions.config",
                  JSON.stringify(extensionsConfig),
                );
              }

              return (
                <div class="relative p-4 h-fit rounded-lg bg-black/50">
                  <div class="flex items-center">
                    <img
                      src={`${extension.path}/icon.png`}
                      alt={extension.name}
                      class="size-8 mr-2"
                    />
                    <div>
                      <div class="leading-none">{extension.name}</div>
                    </div>
                  </div>
                  <div class="min-h-6 flex space-x-2 pt-4">
                    <div class="h-full flex items-center px-2 py-0.5 rounded bg-neutral-800/75">
                      {extension.version}
                    </div>
                    <div class="h-full flex items-center px-2 py-0.5 rounded bg-neutral-800/75">
                      {extension.type}
                    </div>
                  </div>
                  <div
                    class="absolute right-4 top-4 size-4 cursor-pointer text-red-500"
                    onClick={async () => {
                      await window.electronAPI?.removeExtension(extension.name);
                      load_extensions();
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
                      class="lucide lucide-trash2-icon lucide-trash-2 size-4"
                    >
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      <path d="M3 6h18" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </div>
                  <Toggle
                    callback={handleState}
                    className="absolute right-4 bottom-4"
                    initial={extensionConfig?.enabled ?? false}
                  ></Toggle>
                </div>
              );
            })
          ) : (
            <div class="w-full py-8 flex flex-col items-center justify-center space-y-1">
              <div class="text-3xl">😕</div>
              <div class="text-lg">No Extensions found</div>
              <div class="text-neutral-500 text-xs">
                Try installing extensions, they will be listed here afterwards.
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  ) as HTMLElement;

  async function load_extensions() {
    if (!localStorage.getItem("extensions.config")) {
      localStorage.setItem("extensions.config", JSON.stringify([]));
    }
    const extensions = await window.electronAPI?.loadExtensions();
    extensionsConfig = JSON.parse(
      localStorage.getItem("extensions.config") || "[]",
    );
    for (const extension of extensions) {
      let extensionConfig = extensionsConfig.find(
        (config) => config.id === extension.github,
      );
      if (!extensionConfig) {
        extensionConfig = {
          id: extension.github,
          enabled: true,
        };
        localStorage.setItem(
          "extensions.config",
          JSON.stringify([...extensionsConfig, extensionConfig]),
        );
      }
    }

    setExtensions(extensions);
  }

  load_extensions();

  return page;
}
