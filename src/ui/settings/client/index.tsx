import { h } from "../../../lib/jsx/runtime";
import { debounce } from "../../../lib/util";
import { API } from "../../../app";

interface Setting {
  name: string;
  description: string;
  type: "input";
  category: string;
  storageKey: string;
  onchange: (value: string) => void;
  newValue: string | null;
  default: string;
}

export default function ClientSettings() {
  const settings: Setting[] = [
    {
      name: "Local Media Path",
      description:
        "This is where the app creates the directories for the anime. Once the directory is created, you can start putting the episode files in it.\n\nNote: The name of the episode files is pretty much irrelevant but they must have an episode identifier in the filename. For example, *EP01* or *ep.01*",
      type: "input",
      category: "Media",
      storageKey: "app_local_media_path",
      onchange: (value) => {},
      newValue: null,
      default: "",
    },
    {
      name: "Server Adress",
      description:
        "This is the address of the API server, where the app will send requests to.\n\nNote: If the URL is invalid, the app will not be able to connect to the server.",
      type: "input",
      category: "API",
      storageKey: "app_server_adress",
      onchange: (value) => {
        API.baseurl = value;
      },
      newValue: null,
      default: "https://hikari.animenetwork.org",
    },
  ];

  const handleSettingChange = debounce((setting) => {
    localStorage.setItem(setting.storageKey, setting.newValue!);
    setting.onchange(setting.newValue!);
  }, 250);

  const page = (
    <div class="h-full w-full space-y-4 overflow-y-scroll">
      <div class="text-xl">Client Settings</div>
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
            {setting.type === "input" && (
              <input
                type="text"
                value={localStorage.getItem(setting.storageKey) || ""}
                placeholder={setting.default}
                onChange={(e) => {
                  setting.newValue = e.target.value;

                  handleSettingChange(setting);
                }}
                class="px-2 py-1 w-md bg-neutral-900 border-1 border-neutral-700 text-neutral-300 rounded leading-none text-sm placeholder:text-sm outline-none"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  ) as HTMLDivElement;

  // settings.map((setting) => {
  //   const settingNode = document.createElement("div");
  //   settingNode.className =
  //     "relative flex flex-col justify-center h-fit w-full space-y-2";

  //   const settingLabel = document.createElement("div");
  //   settingLabel.className = "text-sm";
  //   settingLabel.textContent = setting.name;

  //   settingNode.appendChild(settingLabel);

  //   const settingDescription = document.createElement("div");
  //   settingDescription.className = "text-sm text-neutral-500";
  //   settingDescription.textContent = setting.description;

  //   settingNode.appendChild(settingDescription);

  //   switch (setting.type) {
  //     case "input":
  //       const settingInput = document.createElement("input");
  //       settingInput.className =
  //         "absolute right-0 w-1/3 px-4 py-2 text-neutral-500 border-1 border-[#1a1a1a] bg-[#080808] rounded-md outline-none";
  //       settingInput.value =
  //         localStorage.getItem(setting.storageKey) || setting.default;

  //       settingNode.appendChild(settingInput);

  //       const handleSettingChange = debounce(() => {
  //         localStorage.setItem(setting.storageKey, setting.newValue);
  //         setting.onchange(setting.newValue);
  //       }, 250);

  //       settingInput.addEventListener("input", () => {
  //         setting.newValue = settingInput.value;
  //         handleSettingChange();
  //       });

  //       break;
  //   }

  //   page.appendChild(settingNode);
  // });

  return page;
}
