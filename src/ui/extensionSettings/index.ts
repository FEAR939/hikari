import { Toggle } from "../toggle";

export default function ExtensionSettings() {
  const page = document.createElement("div");
  page.className = "h-full w-full space-y-2";

  const header = document.createElement("div");
  header.className = "text-xl";
  header.textContent = "Extension Settings";

  page.appendChild(header);

  const installRow = document.createElement("div");
  installRow.className = "flex h-fit w-full space-x-2";

  page.appendChild(installRow);

  const installInput = document.createElement("input");
  installInput.className =
    "w-full px-4 py-2 text-neutral-500 border-1 border-[#1a1a1a] bg-[#080808] rounded-md outline-none";
  installInput.placeholder = "Extension URL";

  installRow.appendChild(installInput);

  const installButton = document.createElement("div");
  installButton.className =
    "w-1/3 px-4 py-2 flex items-center justify-center text-black bg-neutral-200 rounded-md cursor-pointer space-x-2";
  installButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download-icon lucide-download size-4"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>
    <div>Install Extension</div>
  `;

  installButton.addEventListener("click", async () => {
    const url = installInput.value;
    if (!url || !url.match(/https:\/\/github\.com\/.*\.git/)) return;

    if (!localStorage.getItem("extensions.config")) {
      localStorage.setItem("extensions.config", JSON.stringify([]));
    }

    console.log("Installing extension:", url);
    const extension = await window.electronAPI.installExtension(url);
    const extensionsConfig = JSON.parse(
      localStorage.getItem("extensions.config") || "[]",
    );
    extensionsConfig.push({ id: extension.github, enabled: true });

    load_extensions();
  });

  installRow.appendChild(installButton);

  const extensionList = document.createElement("div");
  extensionList.className = "w-full h-fit space-y-2 mt-4";

  page.appendChild(extensionList);

  async function load_extensions() {
    if (!localStorage.getItem("extensions.config")) {
      localStorage.setItem("extensions.config", JSON.stringify([]));
    }
    extensionList.innerHTML = "";
    const extensions = await window.electronAPI.loadExtensions();
    const extensionsConfig = JSON.parse(
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
      const extensionItem = document.createElement("div");
      extensionItem.className =
        "relative p-4 border border-[#1a1a1a] rounded-lg space-y-2";

      const extensionName = document.createElement("div");
      extensionName.textContent = extension.name;

      extensionItem.appendChild(extensionName);

      const extensionRemove = document.createElement("div");
      extensionRemove.className =
        "absolute right-4 top-4 size-4 cursor-pointer text-red-500";
      extensionRemove.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2-icon lucide-trash-2 size-4"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`;

      extensionItem.appendChild(extensionRemove);

      extensionRemove.addEventListener("click", async () => {
        await window.electronAPI?.removeExtension(extension.name);

        extensionsConfig.splice(
          extensionsConfig.findIndex((ext) => ext.name === extension.name),
          1,
        );
        localStorage.setItem(
          "extensions.config",
          JSON.stringify(extensionsConfig),
        );

        load_extensions();
      });

      const extensionMetaRow = document.createElement("div");
      extensionMetaRow.className = "h-fit flex space-x-2 mb-0";

      const extensionVersion = document.createElement("div");
      extensionVersion.className =
        "w-fit px-2 py-1 bg-neutral-900 text-neutral-500 rounded";
      extensionVersion.textContent = extension.version;

      extensionMetaRow.appendChild(extensionVersion);

      const extensionType = document.createElement("div");
      extensionType.className =
        "w-fit px-2 py-1 bg-neutral-900 text-neutral-500 rounded";
      extensionType.textContent = extension.type;

      extensionMetaRow.appendChild(extensionType);

      extensionItem.appendChild(extensionMetaRow);

      function handleState(state) {
        extensionConfig.enabled = state;
        localStorage.setItem(
          "extensions.config",
          JSON.stringify(extensionsConfig),
        );
      }

      const enable = Toggle(handleState);
      enable.classList.add("absolute", "right-4", "bottom-4");
      enable.setState(extensionConfig.enabled);

      extensionItem.appendChild(enable);

      extensionList.appendChild(extensionItem);
    }
  }

  load_extensions();

  return page;
}
