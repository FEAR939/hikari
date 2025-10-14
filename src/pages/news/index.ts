import { router } from "../../lib/router";

export default async function News(query) {
  const page = document.createElement("div");
  page.className =
    "relative h-full w-full px-4 md:px-12 pb-4 space-y-4 overflow-y-scroll";

  router.container.appendChild(page);

  const pageback = document.createElement("div");
  pageback.className =
    "absolute z-10 top-2 left-4 size-8 flex items-center justify-center cursor-pointer";
  pageback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left-to-line-icon lucide-arrow-left-to-line"><path d="M3 19V5"/><path d="m13 6-6 6 6 6"/><path d="M7 12h14"/></svg>`;

  page.appendChild(pageback);

  pageback.addEventListener("click", () => {
    router.removeRoute("/anime/updateEpisodeProgress");
    router.navigate("/");
  });
}
