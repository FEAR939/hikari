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
      name: "Media on this device",
      description:
        "This is where the app creates the directories for the anime. Once the directory is created, you can start putting the episode files in it. The name of the episode files is pretty much irrelevant but they must have an episode identifier in the filename. For example, *EP01* or *ep.01*",
      type: "input",
      category: "Media",
      storageKey: "app_local_media_path",
      onchange: (value) => {},
      newValue: null,
      default: "",
    },
    {
      name: "API Server",
      description:
        "This is the address of the API server, where the app will send requests to. If the URL is invalid, the app will not be able to connect to the server.",
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
        <div class="bg-neutral-950/50 rounded-lg h-fit w-full p-4 flex gap-2">
          <div class="h-fit w-full space-y-1">
            <div class="text-neutral-200 text-sm">{setting.name}</div>
            <div class="text-neutral-500 text-xs">{setting.description}</div>
          </div>
          <div class="flex items-center">
            {setting.type === "input" && (
              <input
                type="text"
                value={localStorage.getItem(setting.storageKey) || ""}
                placeholder={setting.default}
                onChange={(e) => {
                  setting.newValue = e.target.value;

                  handleSettingChange(setting);
                }}
                class="px-4 py-2 h-fit w-64 bg-neutral-900 border border-neutral-700 text-neutral-300 rounded leading-none text-sm placeholder:text-sm outline-none"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  ) as HTMLDivElement;

  return page;
}
