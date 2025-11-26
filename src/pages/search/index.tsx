import { router } from "../../lib/router/index";
import { Card, CardSize } from "../../ui/card";
import { fetchSections } from "../../lib/anilist";
import { h } from "../../lib/jsx/runtime";
import { createSignal, bind } from "../../lib/jsx/reactive";
import { kitsu } from "../../lib/kitsu";
import DropdownMenu, { DropdownItem } from "@ui/dropdownMenu";

export default async function Search(query) {
  const [results, setResults, subscribeResults] = createSignal([]);
  let isSearching = false;
  const [filterOpen, setFilterOpen, subscribeFilterOpen] = createSignal(false);
  const [filters, setFilters, subscribeFilters] = createSignal({
    season: {
      label: "Season",
      value: "all",
      type: "string",
      possibleValues: ["all", "winter", "spring", "summer", "fall"],
    },
    seasonYear: {
      label: "Year",
      value: "all",
      type: "number",
    },
    status: {
      label: "Status",
      value: "all",
      type: "string",
      possibleValues: [
        "all",
        "current",
        "finished",
        "tba",
        "unreleased",
        "upcoming",
      ],
    },
  });
  let filterOpenTimeout: NodeJS.Timeout | null = null;

  const page = (
    <div class="relative h-full w-full p-4 pt-12 space-y-4">
      <div class="flex gap-2">
        <div class="rounded-2xl border border-[#222222] bg-[#1d1d1d] h-10 w-64 px-3 flex items-center overflow-hidden">
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
                let results = null;
                const hasFilters =
                  Object.values(filters()).findIndex(
                    (filter) => filter.value !== "all",
                  ) !== -1
                    ? true
                    : false;
                if (hasFilters) {
                  const params = {};
                  Object.entries(filters()).forEach(([key, value]) => {
                    if (value.value !== "all" && value.value !== "") {
                      params[key] = value.value;
                    }
                  });

                  results = await kitsu.advancedSearch({
                    text: e.target.value,
                    ...params,
                  });
                } else {
                  results = await kitsu.searchAnime(e.target.value);
                }

                isSearching = false;
                return setResults(results.data);
              }
            }}
          ></input>
        </div>
        <div class="position relative">
          <div
            class="size-10 rounded-2xl bg-[#1d1d1d] border border-[#222222] grid place-items-center cursor-pointer"
            onClick={() => {
              setFilterOpen(!filterOpen());
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="size-4"
            >
              <path
                d="M2 4.6C2 4.03995 2 3.75992 2.10899 3.54601C2.20487 3.35785 2.35785 3.20487 2.54601 3.10899C2.75992 3 3.03995 3 3.6 3H20.4C20.9601 3 21.2401 3 21.454 3.10899C21.6422 3.20487 21.7951 3.35785 21.891 3.54601C22 3.75992 22 4.03995 22 4.6V5.26939C22 5.53819 22 5.67259 21.9672 5.79756C21.938 5.90831 21.8901 6.01323 21.8255 6.10776C21.7526 6.21443 21.651 6.30245 21.4479 6.4785L15.0521 12.0215C14.849 12.1975 14.7474 12.2856 14.6745 12.3922C14.6099 12.4868 14.562 12.5917 14.5328 12.7024C14.5 12.8274 14.5 12.9618 14.5 13.2306V18.4584C14.5 18.6539 14.5 18.7517 14.4685 18.8363C14.4406 18.911 14.3953 18.9779 14.3363 19.0315C14.2695 19.0922 14.1787 19.1285 13.9971 19.2012L10.5971 20.5612C10.2296 20.7082 10.0458 20.7817 9.89827 20.751C9.76927 20.7242 9.65605 20.6476 9.58325 20.5377C9.5 20.4122 9.5 20.2142 9.5 19.8184V13.2306C9.5 12.9618 9.5 12.8274 9.46715 12.7024C9.43805 12.5917 9.39014 12.4868 9.32551 12.3922C9.25258 12.2856 9.15102 12.1975 8.94789 12.0215L2.55211 6.4785C2.34898 6.30245 2.24742 6.21443 2.17449 6.10776C2.10986 6.01323 2.06195 5.90831 2.03285 5.79756C2 5.67259 2 5.53819 2 5.26939V4.6Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div
            class="absolute z-10 left-0 top-12 w-64 h-fit max-h-sm rounded-2xl bg-[#1d1d1d] border border-[#222222] p-4 space-y-2 hidden opacity-0 transition-all duration-150 scale-75"
            ref={(el: HTMLElement) => {
              subscribeFilterOpen(() => {
                const state = filterOpen();

                if (!state) {
                  el.classList.add("opacity-0", "scale-75");
                  el.clientWidth;
                  filterOpenTimeout = setTimeout(() => {
                    el.classList.add("hidden");
                  }, 150);
                  return;
                }

                if (filterOpenTimeout) {
                  clearTimeout(filterOpenTimeout);
                }

                el.classList.remove("hidden");
                el.clientWidth;
                el.classList.remove("opacity-0", "scale-75");
              });
            }}
          >
            {Object.entries(filters()).map(([filterName, filter]) => {
              return (
                <div class="h-8 w-full flex items-center justify-between">
                  <div class="text-xs">{filter.label}</div>
                  {filter.type == "string" &&
                    filter.possibleValues !== undefined && (
                      <DropdownMenu
                        className="w-12"
                        onChange={(value) => {
                          const tempFilters = filters();
                          tempFilters[filterName].value = value;
                          setFilters(tempFilters);
                        }}
                      >
                        {filter.possibleValues.map((value) => (
                          <DropdownItem
                            value={value}
                          >{`${value.substring(0, 1).toUpperCase()}${value.substring(1)}`}</DropdownItem>
                        ))}
                      </DropdownMenu>
                    )}
                  {filter.type == "number" &&
                    filter.possibleValues == undefined && (
                      <input
                        type="number"
                        placeholder="All"
                        class="w-12 text-xs outline-hidden text-right pr-4 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        onChange={(e: any) => {
                          const tempFilters = filters();
                          tempFilters[filterName].value = e.target.value;
                          setFilters(tempFilters);
                        }}
                      />
                    )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {bind([results, setResults, subscribeResults], (value) => (
        <div class="relative h-full w-full grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-2 overflow-y-scroll">
          {(() => {
            if (value.length === 0 && !isSearching) {
              return (
                <div class="h-full col-span-full flex items-center justify-center">
                  <div class="w-full py-8 flex flex-col items-center justify-center space-y-1">
                    <div class="text-3xl">😕</div>
                    <div class="text-lg">No results found</div>
                    <div class="text-neutral-500 text-xs">
                      Try adjusting your search to find what you are looking
                      for.
                    </div>
                  </div>
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
