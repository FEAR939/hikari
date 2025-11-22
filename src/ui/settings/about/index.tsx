import { h } from "@lib/jsx/runtime";
import { createSignal, bind } from "@lib/jsx/reactive";

export default function AboutSettings() {
  const [version, setVersion, subscribeVersion] = createSignal<string>("");

  const page = (
    <div class="h-full w-full space-y-4">
      <div class="text-xl">About</div>
      {bind([version, setVersion, subscribeVersion], (value) => (
        <div class="text-sm text-neutral-500 leading-none">
          {`Hikari version: ${value}`}
        </div>
      ))}
    </div>
  ) as HTMLElement;

  (async () => {
    setVersion((await window.electronAPI?.getAppVersion()) || "");
  })();

  return page;
}
