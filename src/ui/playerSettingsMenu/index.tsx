import { h } from "../../lib/jsx/runtime";
import { createSignal, bind } from "../../lib/jsx/reactive";
import { Toggle } from "../toggle";

export function PlayerSettingsMenu() {
  const [isVisible, setIsVisible, subscribeIsVisible] = createSignal(false);
  const menu = bind([isVisible, setIsVisible, subscribeIsVisible], (value) => (
    <div
      class={`absolute right-4 bottom-16 h-36 w-65 bg-neutral-950/50 rounded-md shadow-md overflow-hidden ${value ? "block" : "hidden"}`}
    >
      <div class="flex items-center justify-between px-4 py-2 hover:bg-neutral-700">
        <div>Auto Skip</div>
        <Toggle callback={() => {}} initial={false} />
      </div>
    </div>
  )) as HTMLElement;

  menu.setVisibility = (state: boolean) => {
    setIsVisible(state);
  };

  return menu;
}
