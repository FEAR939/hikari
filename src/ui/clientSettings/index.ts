import { debounce } from "../../lib/util";

export default function ClientSettings() {
  const page = document.createElement("div");
  page.className = "h-full w-full space-y-2 overflow-y-scroll";

  const header = document.createElement("div");
  header.className = "text-l";
  header.textContent = "Client Settings";

  page.appendChild(header);

  const settings = [
    {
      name: "Local Media Path",
      type: "input",
      storageKey: "app_local_media_path",
      newValue: null,
      default: "",
    },
    {
      name: "Server Adress",
      type: "input",
      storageKey: "app_server_adress",
      newValue: null,
      default: "https://animenetwork.org:5000",
    },
  ];

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
          "w-full px-4 py-2 text-neutral-500 outline-1 outline-[#1a1a1a] bg-[#080808] rounded-md border-none";
        settingInput.value =
          localStorage.getItem(setting.storageKey) || setting.default;

        settingNode.appendChild(settingInput);

        const handleSettingChange = debounce(() => {
          localStorage.setItem(setting.storageKey, setting.newValue);
          console.log("key set");
        }, 250);

        settingInput.addEventListener("input", () => {
          setting.newValue = settingInput.value;
          handleSettingChange();
        });

        break;
    }

    page.appendChild(settingNode);
  });

  return page;
}
