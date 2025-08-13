import { getSearch } from "../../lib/anilist/index";

export default async function Search(query) {
  const page = document.createElement("div");
  page.className = "relative h-full w-full p-4 space-y-4 overflow-y-scroll";

  document.root.appendChild(page);

  const searchBar = document.createElement("input");
  searchBar.className =
    "px-4 py-2 rounded-xl bg-[#0c0c0c] text-white border-none outline-none";
  searchBar.placeholder = "Search...";

  page.appendChild(searchBar);

  searchBar.addEventListener("keyup", async (e) => {
    if (e.keyCode == 13) {
      const results = await getSearch(searchBar.value);
      return showSearch(results);
    }
  });

  const resultContainer = document.createElement("div");
  resultContainer.className = "grid grid-cols-1 gap-4";

  page.appendChild(resultContainer);

  function showSearch(results) {
    resultContainer.innerHTML = "";
    if (!results) return;

    results.map((result) => {
      const resultCard = document.createElement("div");
      resultCard.className = "bg-[#0c0c0c] rounded-xl p-4";
      resultCard.innerHTML = `
        <h2 class="text-white">${result.title.romaji}</h2>
      `;
      resultContainer.appendChild(resultCard);

      resultCard.addEventListener("click", () => {
        document.router.navigate(`/anime?id=${result.id}`);
      });
    });
  }
}
