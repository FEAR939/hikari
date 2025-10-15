import { Toggle } from "../../toggle";

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

  const installInputBox = document.createElement("div");
  installInputBox.className =
    "flex items-center space-x-2 px-4 h-10 w-full text-neutral-500 border-1 border-[#1a1a1a] bg-[#080808] rounded-md";
  installInputBox.placeholder = "Extension URL";

  installRow.appendChild(installInputBox);

  const installInputIcon = document.createElement("div");
  installInputIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link2-icon lucide-link-2 size-4"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/></svg>`;

  const installInput = document.createElement("input");
  installInput.className = "w-full py-2 border-none outline-none leading-none";
  installInput.placeholder = "Extension URL from GitHub";

  installInputBox.appendChild(installInputIcon);
  installInputBox.appendChild(installInput);

  installRow.appendChild(installInputBox);

  const installButton = document.createElement("div");
  installButton.className =
    "w-1/3 px-4 py-2 flex items-center justify-center text-black bg-gradient-to-tr from-pink-500 to-rose-500 rounded-md cursor-pointer space-x-2";
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
        "relative p-4 bg-neutral-950 border-1 border-white/[0.08] rounded-lg space-y-2";

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
