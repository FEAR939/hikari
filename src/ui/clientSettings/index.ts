import { debounce } from "../../lib/util";
import { API } from "../../app";

export default function ClientSettings() {
  const page = document.createElement("div");
  page.className = "h-full w-full space-y-4 overflow-y-scroll";

  const header = document.createElement("div");
  header.className = "text-xl";
  header.textContent = "Client Settings";

  page.appendChild(header);

  const settings = [
    {
      name: "Local Media Path",
      description: "Path to the local media directory",
      type: "input",
      storageKey: "app_local_media_path",
      onchange: (value) => {},
      newValue: null,
      default: "",
    },
    {
      name: "Server Adress",
      description: "Address of the server",
      type: "input",
      storageKey: "app_server_adress",
      onchange: (value) => {
        API.baseurl = value;
      },
      newValue: null,
      default: "https://hikari.animenetwork.org",
    },
  ];

  settings.map((setting) => {
    const settingNode = document.createElement("div");
    settingNode.className =
      "relative flex flex-col justify-center h-fit w-full space-y-2";

    const settingLabel = document.createElement("div");
    settingLabel.className = "text-sm";
    settingLabel.textContent = setting.name;

    settingNode.appendChild(settingLabel);

    const settingDescription = document.createElement("div");
    settingDescription.className = "text-sm text-neutral-500";
    settingDescription.textContent = setting.description;

    settingNode.appendChild(settingDescription);

    switch (setting.type) {
      case "input":
        const settingInput = document.createElement("input");
        settingInput.className =
          "absolute right-0 w-1/3 px-4 py-2 text-neutral-500 border-1 border-[#1a1a1a] bg-[#080808] rounded-md outline-none";
        settingInput.value =
          localStorage.getItem(setting.storageKey) || setting.default;

        settingNode.appendChild(settingInput);

        const handleSettingChange = debounce(() => {
          localStorage.setItem(setting.storageKey, setting.newValue);
          setting.onchange(setting.newValue);
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
