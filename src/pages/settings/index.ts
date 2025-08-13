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
  page.className = "relative h-full w-full p-4 space-y-4";

  document.root.appendChild(page);

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
