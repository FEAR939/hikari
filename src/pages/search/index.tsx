import { router } from "../../lib/router/index";
import { Card, CardSize } from "../../ui/card";
import { fetchSections } from "../../lib/anilist";
import { h } from "../../lib/jsx/runtime";
import { createSignal, bind } from "../../lib/jsx/reactive";

export default async function Search(query) {
  const [results, setResults, subscribeResults] = createSignal([]);

  const page = (
    <div class="relative h-full w-full p-4 pt-12 space-y-4 overflow-y-scroll">
      <div
        class="absolute z-10 top-2 left-4 size-8 flex items-center justify-center cursor-pointer"
        onclick={() => router.navigate("/")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-arrow-left-to-line-icon lucide-arrow-left-to-line"
        >
          <path d="M3 19V5" />
          <path d="m13 6-6 6 6 6" />
          <path d="M7 12h14" />
        </svg>
      </div>
      <div class="rounded-lg border-1 border-neutral-700/50 bg-neutral-950 h-10 w-64 px-3 flex items-center overflow-hidden">
        <div class="h-full flex items-center shrink-0 text-neutral-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-search-icon lucide-search size-4"
          >
            <path d="m21 21-4.34-4.34" />
            <circle cx="11" cy="11" r="8" />
          </svg>
        </div>
        <input
          class="p-2 h-8 border-none outline-none text-sm text-neutral-300 font-medium inline-block w-full leading-none placeholder:text-neutral-500 placeholder:text-sm placeholder:font-medium"
          placeholder="Search"
          onKeyUp={async (e) => {
            if (e.keyCode == 13) {
              const section = [
                {
                  type: "search",
                  params: {
                    search: e.target.value,
                  },
                },
              ];

              const results = await fetchSections(section);

              return setResults(results[0].data);
            }
          }}
        ></input>
      </div>
      {bind([results, setResults, subscribeResults], (value) => (
        <div class="h-fit w-full grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
          {value.length === 0 ? (
            <div>No results found</div>
          ) : (
            value.map((result) => (
              <Card
                item={result}
                options={{ label: true, size: CardSize.AUTO }}
              />
            ))
          )}
        </div>
      ))}
    </div>
  ) as HTMLElement;

  router.container!.appendChild(page);

  const resultContainer = document.createElement("div");
  resultContainer.className =
    "h-fit w-full grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4";

  page.appendChild(resultContainer);
}
