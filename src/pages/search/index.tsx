import { router } from "../../lib/router/index";
import { Card, CardSize } from "../../ui/card";
import { fetchSections } from "../../lib/anilist";
import { h } from "../../lib/jsx/runtime";
import { createSignal, bind } from "../../lib/jsx/reactive";
import { kitsu } from "../../lib/kitsu";

export default async function Search(query) {
  const [results, setResults, subscribeResults] = createSignal([]);
  let isSearching = false;

  const page = (
    <div class="relative h-full w-full p-4 pt-12 space-y-4 overflow-y-scroll">
      <div class="rounded-lg border border-neutral-700/50 bg-neutral-950 h-10 w-64 px-3 flex items-center overflow-hidden">
        <div class="h-full flex items-center shrink-0 text-neutral-700">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="size-4"
          >
            <path
              d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <input
          class="p-2 h-8 border-none outline-none text-sm text-neutral-300 font-medium inline-block w-full leading-none placeholder:text-neutral-500 placeholder:text-sm placeholder:font-medium"
          placeholder="Search"
          onKeyUp={async (e) => {
            if (e.keyCode == 13) {
              isSearching = true;
              setResults([]);
              const results = await kitsu.searchAnime(e.target.value);

              isSearching = false;
              return setResults(results.data);
            }
          }}
        ></input>
      </div>
      {bind([results, setResults, subscribeResults], (value) => (
        <div class="relative h-fit w-full grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-2">
          {(() => {
            if (value.length === 0 && !isSearching) {
              return (
                <div class="col-span-full mt-12 flex items-center justify-center">
                  No results found
                </div>
              );
            }
            if (value.length === 0 && isSearching) {
              return (
                <div class="col-span-full mt-12 flex items-center justify-center animate-pulse">
                  Searching...
                </div>
              );
            }
            return value.map((result) => (
              <Card
                item={result}
                options={{ label: true, size: CardSize.AUTO }}
              />
            ));
          })()}
        </div>
      ))}
    </div>
  ) as HTMLElement;

  router.container!.appendChild(page);
}
