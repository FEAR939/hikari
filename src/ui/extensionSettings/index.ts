export default function ExtensionSettings() {
  const page = document.createElement("div");
  page.className = "h-full w-full space-y-2";

  const header = document.createElement("div");
  header.className = "text-l";
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
    "w-1/3 px-4 py-2 flex items-center justify-center text-black bg-white rounded-md cursor-pointer";
  installButton.textContent = "Install Extension";

  installButton.addEventListener("click", () => {
    const url = installInput.value;
    if (!url || !url.match(/https:\/\/github\.com\/.*\.git/)) return;

    console.log("Installing extension:", url);
    window.electronAPI.installExtension(url);
  });

  installRow.appendChild(installButton);

  const extensionList = document.createElement("div");
  extensionList.className = "w-full h-fit space-y-2 mt-4";

  page.appendChild(extensionList);

  async function load_extensions() {
    const extensions = await window.electronAPI.loadExtensions();

    extensions.map((extension) => {
      console.log(extension);

      const extensionItem = document.createElement("div");
      extensionItem.className =
        "p-4 border border-[#1a1a1a] rounded-md space-y-2";
      extensionItem.innerHTML = `
        <div>${extension.name}</div>
        <div class="w-fit px-2 py-1 bg-neutral-900 text-neutral-500 rounded">${extension.version}</div>
      `;

      extensionList.appendChild(extensionItem);
    });
  }

  load_extensions();

  return page;
}
