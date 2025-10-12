import { router } from "../../lib/router/index";
import { Card, CardSize } from "../../ui/card";
import { fetchSections } from "../../lib/anilist";

export default async function Search(query) {
  const page = document.createElement("div");
  page.className =
    "relative h-full w-full p-4 pt-12 space-y-4 overflow-y-scroll";

  document.root.appendChild(page);

  const pageback = document.createElement("div");
  pageback.className =
    "absolute z-10 top-2 left-4 size-8 flex items-center justify-center cursor-pointer";
  pageback.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left-to-line-icon lucide-arrow-left-to-line"><path d="M3 19V5"/><path d="m13 6-6 6 6 6"/><path d="M7 12h14"/></svg>`;

  page.appendChild(pageback);

  pageback.addEventListener("click", () => {
    router.navigate("/");
  });

  const searchBar = document.createElement("input");
  searchBar.className =
    "px-4 py-2 rounded-xl bg-[#0c0c0c] text-white border-none outline-none";
  searchBar.placeholder = "Search...";

  page.appendChild(searchBar);

  searchBar.addEventListener("keyup", async (e) => {
    if (e.keyCode == 13) {
      const section = [
        {
          type: "search",
          params: {
            search: searchBar.value,
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
