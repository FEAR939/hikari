import { router } from "../../lib/router/index";
import GeneralSettings from "../../ui/generalSettings/index";

const settingsTree = [
  {
    label: "General",
    handler: GeneralSettings,
  },
  {
    label: "Account ",
    handler: () => {},
  },
  {
    label: "Extensions ",
    handler: () => {},
  },
];

export default async function Settings(query) {
  const page = document.createElement("div");
  page.className = "relative h-full w-full p-4 pt-12 space-x-2 space-y-4 flex";

  document.root.appendChild(page);

  const pageback = document.createElement("div");
  pageback.className =
    "absolute z-10 top-2 left-4 size-8 flex items-center justify-center cursor-pointer";
  pageback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left-to-line-icon lucide-arrow-left-to-line"><path d="M3 19V5"/><path d="m13 6-6 6 6 6"/><path d="M7 12h14"/></svg>`;

  page.appendChild(pageback);

  pageback.addEventListener("click", () => {
    router.navigate("/");
  });

  const nav = document.createElement("div");
  nav.className = "h-full w-64 overflow-y-scroll space-y-4";

  settingsTree.map((item) => {
    const option = document.createElement("div");
    option.className =
      "w-full px-4 py-2 bg-[#0d0d0d] text-white rounded-md text-left cursor-pointer";
    option.textContent = item.label;

    option.addEventListener("click", () => {
      const tabPage = item.handler();
      content.innerHTML = "";
      content.appendChild(tabPage);
    });

    nav.appendChild(option);
  });

  const content = document.createElement("div");
  content.className = "h-full w-full overflow-y-hidden";

  page.appendChild(nav);
  page.appendChild(content);
}
