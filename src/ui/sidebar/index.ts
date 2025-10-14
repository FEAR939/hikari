import { router } from "../../lib/router";

const navIconSize = "size-6";

const navs = [
  {
    id: "home",
    label: "Home",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house-icon lucide-house ${navIconSize}"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
    path: "/",
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-icon lucide-calendar ${navIconSize}"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`,
    path: "/schedule",
  },
  {
    id: "news",
    label: "News",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-newspaper-icon lucide-newspaper ${navIconSize}"><path d="M15 18h-5"/><path d="M18 14h-8"/><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="10" y="6" rx="1"/></svg>`,
    path: "/news",
  },
];

export function Sidebar() {
  const sidebar = document.createElement("div");
  sidebar.className =
    "relative z-4 h-full w-16 p-4 bg-[#080808] border-r-1 border-[#1a1a1a] space-y-4 flex flex-col items-center shrink-0";

  const appIcon = document.createElement("img");
  appIcon.src = "./icons/icon.png";
  appIcon.className = "size-8";

  sidebar.appendChild(appIcon);

  const navList = document.createElement("div");
  navList.className = "space-y-4";

  navs.forEach((nav) => {
    const navItem = document.createElement("div");
    navItem.className = "text-neutral-500 cursor-pointer";
    navItem.innerHTML = `
      ${nav.icon}
    `;
    navList.appendChild(navItem);

    router.subscribe((path) => {
      if (path === nav.path) {
        // navItem.classList.add("bg-neutral-900");
        navItem.classList.replace("text-neutral-500", "text-neutral-300");
      } else {
        // navItem.classList.remove("bg-neutral-900");
        navItem.classList.replace("text-neutral-300", "text-neutral-500");
      }
    });

    navItem.addEventListener("click", () => {
      router.navigate(nav.path);
    });
  });

  sidebar.appendChild(navList);

  return sidebar;
}
