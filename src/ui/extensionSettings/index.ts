export default function ExtensionSettings() {
  const page = document.createElement("div");
  page.className = "h-full w-full space-y-2 overflow-y-scroll";

  const header = document.createElement("div");
  header.className = "text-l";
  header.textContent = "Extension Settings";

  page.appendChild(header);

  const settings = [];

  settings.map((setting) => {
    const settingNode = document.createElement("div");
    settingNode.className =
      "h-fit w-full p-4 space-y-2 bg-[#0d0d0d] rounded-lg";

    const settingLabel = document.createElement("div");
    settingLabel.className = "text-sm";
    settingLabel.textContent = setting.name;

    settingNode.appendChild(settingLabel);

    switch (setting.type) {
      case "input":
        const settingInput = document.createElement("input");
        settingInput.className =
          "w-full px-2 py-1 text-neutral-500 outline-1 outline-[#1a1a1a] bg-[#080808] rounded-md border-none";
        settingInput.value =
          localStorage.getItem(setting.storageKey) || setting.default;

        settingNode.appendChild(settingInput);

        settingInput.addEventListener("input", () => {
          setting.newValue = settingInput.value;
        });

        break;
    }

    page.appendChild(settingNode);
  });

  const saveButton = document.createElement("div");
  saveButton.className =
    "absolute px-4 py-2 bg-[#0d0d0d] rounded-md cursor-pointer";
  saveButton.textContent = "Save";

  saveButton.addEventListener("click", () => {
    settings.forEach((setting) => {
      if (!setting.newValue) return;
      localStorage.setItem(setting.storageKey, setting.newValue);
    });
  });

  page.appendChild(saveButton);

  return page;
}
