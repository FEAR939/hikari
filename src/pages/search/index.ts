import { router } from "../../lib/router/index";
import { Card, CardSize } from "../../ui/card";
import { fetchSections } from "../../lib/anilist";

export default async function Search(query) {
  const page = document.createElement("div");
  page.className =
    "relative h-full w-full p-4 pt-12 space-y-4 overflow-y-scroll";

  router.container.appendChild(page);

  const pageback = document.createElement("div");
  pageback.className =
    "absolute z-10 top-2 left-4 size-8 flex items-center justify-center cursor-pointer";
  pageback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left-to-line-icon lucide-arrow-left-to-line"><path d="M3 19V5"/><path d="m13 6-6 6 6 6"/><path d="M7 12h14"/></svg>`;

  page.appendChild(pageback);

  pageback.addEventListener("click", () => {
    router.navigate("/");
  });

  const searchBar = document.createElement("div");
  searchBar.className =
    "rounded-lg border-1 border-[#1a1a1a] bg-neutral-950 h-10 w-64 px-3 flex items-center overflow-hidden";

  const searchBarIcon = document.createElement("div");
  searchBarIcon.className = "h-full flex items-center shrink-0";
  searchBarIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-icon lucide-search size-4"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>`;

  searchBar.appendChild(searchBarIcon);

  const searchBarInput = document.createElement("input");
  searchBarInput.className =
    "p-2 border-none outline-none text-sm inline-block w-full leading-none placeholder:text-neutral-500 placeholder:text-sm placeholder:text-weight-normal";
  searchBarInput.placeholder = "Search";

  searchBar.appendChild(searchBarInput);

  page.appendChild(searchBar);

  searchBarInput.addEventListener("keyup", async (e) => {
    if (e.keyCode == 13) {
      const section = [
        {
          type: "search",
          params: {
            search: searchBarInput.value,
          },
        },
      ];

      const results = await fetchSections(section);

      console.log(results);
      return showSearch(results[0].data);
    }
  });

  const resultContainer = document.createElement("div");
  resultContainer.className =
    "h-fit w-full grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4";

  page.appendChild(resultContainer);

  function showSearch(results) {
    resultContainer.innerHTML = "";
    if (!results) return;

    results.map((result) => {
      const resultCard = Card(result, { label: true, size: CardSize.AUTO });
      resultContainer.appendChild(resultCard);
    });
  }
}
