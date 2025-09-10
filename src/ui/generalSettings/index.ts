export default function GeneralSettings() {
  const page = document.createElement("div");
  page.className = "h-full w-full space-y-2 overflow-y-scroll";

  const settings = [
    {
      name: "Server Adress",
      type: "input",
      storageKey: "app_server_adress",
      newValue: null,
      default: "http://localhost:5000",
    },
  ];

  settings.map((setting) => {
    const settingNode = document.createElement("div");
    settingNode.className = "h-fit w-full p-4 bg-[#0d0d0d] rounded-xl";

    const settingLabel = document.createElement("div");
    settingLabel.className = "fold-sembild";
    settingLabel.textContent = setting.name;

    settingNode.appendChild(settingLabel);

    switch (setting.type) {
      case "input":
        const settingInput = document.createElement("input");
        settingInput.className =
          "w-full bg-[#0d0d0d] rounded-xl text-[#b1b1b1] outline-none border-none";
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
