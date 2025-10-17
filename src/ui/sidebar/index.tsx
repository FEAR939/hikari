import { router } from "../../lib/router";
import { h } from "../../lib/jsx/runtime";
import { createSignal, bind } from "../../lib/jsx/reactive";

const navIconSize = "size-6";

const navs = [
  {
    id: "home",
    label: "Home",
    icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 640 640"
        class="size-6"
      >
        <path
          fill="currentColor"
          d="M341.8 72.6C329.5 61.2 310.5 61.2 298.3 72.6L74.3 280.6C64.7 289.6 61.5 303.5 66.3 315.7C71.1 327.9 82.8 336 96 336L112 336L112 512C112 547.3 140.7 576 176 576L464 576C499.3 576 528 547.3 528 512L528 336L544 336C557.2 336 569 327.9 573.8 315.7C578.6 303.5 575.4 289.5 565.8 280.6L341.8 72.6zM304 384L336 384C362.5 384 384 405.5 384 432L384 528L256 528L256 432C256 405.5 277.5 384 304 384z"
        />
      </svg>
    ),
    path: "/",
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 640 640"
        class="size-6"
      >
        <path
          fill="currentColor"
          d="M224 64C206.3 64 192 78.3 192 96L192 128L160 128C124.7 128 96 156.7 96 192L96 240L544 240L544 192C544 156.7 515.3 128 480 128L448 128L448 96C448 78.3 433.7 64 416 64C398.3 64 384 78.3 384 96L384 128L256 128L256 96C256 78.3 241.7 64 224 64zM96 288L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 288L96 288z"
        />
      </svg>
    ),
    path: "/schedule",
  },
  {
    id: "news",
    label: "News",
    icon: () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 640 640"
        class="size-6"
      >
        <path
          fill="currentColor"
          d="M64 480L64 184C64 170.7 74.7 160 88 160C101.3 160 112 170.7 112 184L112 472C112 485.3 122.7 496 136 496C149.3 496 160 485.3 160 472L160 160C160 124.7 188.7 96 224 96L512 96C547.3 96 576 124.7 576 160L576 480C576 515.3 547.3 544 512 544L128 544C92.7 544 64 515.3 64 480zM224 192L224 256C224 273.7 238.3 288 256 288L320 288C337.7 288 352 273.7 352 256L352 192C352 174.3 337.7 160 320 160L256 160C238.3 160 224 174.3 224 192zM248 432C234.7 432 224 442.7 224 456C224 469.3 234.7 480 248 480L488 480C501.3 480 512 469.3 512 456C512 442.7 501.3 432 488 432L248 432zM224 360C224 373.3 234.7 384 248 384L488 384C501.3 384 512 373.3 512 360C512 346.7 501.3 336 488 336L248 336C234.7 336 224 346.7 224 360zM424 240C410.7 240 400 250.7 400 264C400 277.3 410.7 288 424 288L488 288C501.3 288 512 277.3 512 264C512 250.7 501.3 240 488 240L424 240z"
        />
      </svg>
    ),
    path: "/news",
  },
];

export function Sidebar() {
  const [active, setActive, subscribeActive] = createSignal("");

  router.subscribe((path) => setActive(path));

  return (
    <div class="relative z-4 h-full w-16 p-4 bg-[#080808] border-r-1 border-[#1a1a1a] space-y-4 flex flex-col items-center shrink-0">
      <img src="./icons/icon.png" class="size-8"></img>
      <div class="space-y-4">
        {navs.map((nav) =>
          bind([active, setActive, subscribeActive], (value) => (
            <div
              class={`cursor-pointer ${active() === nav.path ? "text-white" : "text-neutral-500"}`}
              onClick={() => router.navigate(nav.path)}
            >
              {nav.icon()}
            </div>
          )),
        )}
      </div>
    </div>
  );
}
