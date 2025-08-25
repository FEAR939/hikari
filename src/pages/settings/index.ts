import { router } from "../../lib/router/index";

const settingsTree = [
  {
    label: "General",
    handler: () => {},
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
  page.className = "relative h-full w-full p-4 pt-12 space-y-4";

  document.root.appendChild(page);

  const pageback = document.createElement("div");
  pageback.className =
    "absolute z-10 top-2 left-4 size-8 flex items-center justify-center";
  pageback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left-short size-8" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"/>
  </svg>`;

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

    // option.addEventListener("click", item.handler);

    nav.appendChild(option);
  });

  page.appendChild(nav);
}
