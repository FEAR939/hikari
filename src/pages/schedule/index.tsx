import { h } from "../../lib/jsx/runtime";
import { router } from "../../lib/router";
import { currentSeason, currentYear } from "../../lib/anilist/util";
import { fetchSections } from "../../lib/anilist";
import {
  startOfWeek,
  startOfMonth,
  endOfWeek,
  endOfMonth,
  isToday,
  format,
} from "date-fns";

export default async function Schedule() {
  const now = new Date();
  const monthName = now.toLocaleString("en-US", { month: "long" });

  const firstDay = startOfWeek(startOfMonth(now), { weekStartsOn: 1 });
  const lastDay = endOfWeek(endOfMonth(now), { weekStartsOn: 1 });

  function listDays(firstDay: Date, lastDay: Date) {
    // create an array of days with start and end time for given day
    const days = [];
    // eslint-disable-next-line no-unmodified-loop-condition
    for (
      let start = new Date(firstDay);
      start <= lastDay;
      start.setDate(start.getDate() + 1)
    ) {
      days.push({ date: new Date(start), number: start.getDate() });
    }
    return days;
  }

  const dayList = listDays(firstDay, lastDay);

  const section = [
    {
      title: "Schedule",
      type: "schedule",
      params: {
        season: currentSeason,
        seasonYear: currentYear,
      },
    },
  ];

  const schedule = (await fetchSections(section))[0].data.filter(
    (v, i, a) => v != null && a.findIndex((s) => s?.id === v.id) === i,
  );

  const dayMap = Object.fromEntries(
    dayList.map((day) => [+day.date, { day, episodes: [] }]),
  );

  for (const media of schedule) {
    // dedupe airing lists
    const episodes = [...media.notaired.nodes, ...media.aired.nodes].filter(
      (v, i, a) =>
        v != null && a.findIndex((s) => s?.episode === v.episode) === i,
    ) as Array<{ a: number; e: number }>;
    for (const { airingAt, episode } of episodes) {
      const airTime = new Date(airingAt * 1000);
      airTime.setHours(0, 0, 0, 0);
      const day = dayMap[+airTime];
      if (day)
        day.episodes.push({
          ...media,
          episode,
          airTime: new Date(airingAt * 1000),
        });
    }
  }

  for (const { episodes } of Object.values(dayMap)) {
    episodes.sort((a, b) => +a.airTime - +b.airTime);
  }

  const scheduleMap = Object.values(dayMap);

  console.log(scheduleMap);

  const page = (
    <div class="relative h-full w-full px-4 md:px-6 pt-16 pb-4 space-y-4 overflow-y-scroll">
      <div class="grid grid-cols-7 border rounded-lg [&>*:not(:nth-child(7n+1)):nth-child(n+8)]:border-r [&>*:nth-last-child(n+8)]:border-b [&>*:nth-child(-n+8)]:border-b border-neutral-900 w-full max-w-[1800px]">
        <div class="col-span-full flex justify-between items-center p-4 border-neutral-900">
          <div class="text-center font-bold text-xl">{monthName}</div>
        </div>
        <div class="text-center py-2 border-neutral-900">Mon</div>
        <div class="text-center py-2 border-neutral-900">Tue</div>
        <div class="text-center py-2 border-neutral-900">Wed</div>
        <div class="text-center py-2 border-neutral-900">Thu</div>
        <div class="text-center py-2 border-neutral-900">Fri</div>
        <div class="text-center py-2 border-neutral-900">Sat</div>
        <div class="text-center py-2 border-neutral-900">Sun</div>
        {scheduleMap.map((day) => (
          <div class="border-neutral-900">
            <div class="relative flex flex-col text-xs py-3 h-24 lg:h-48">
              <div
                class={`w-6 h-6 flex items-center justify-center font-bold mx-3 text-white ${isToday(day.day.date) ? "bg-[rgb(61,180,242)] rounded-full" : ""}`}
              >
                {day.day.number}
              </div>
              {day.episodes.slice(0, 6).map((episode) => (
                <div
                  class={`flex items-center h-4 w-full group mt-1.5 px-3 ${+episode.airTime < Date.now() ? "opacity-30" : ""}`}
                >
                  <div class="font-medium text-nowrap text-ellipsis overflow-hidden pr-2">
                    {episode.title.english || episode.title.romaji}
                  </div>
                  <div class="ml-auto mr-1 text-nowrap">{episode.episode}</div>
                  <div class="text-neutral-400 group-select:text-neutral-200">
                    {format(episode.airTime, "HH:mm")}
                  </div>
                </div>
              ))}
              {day.episodes.length > 6 && (
                <div class="group">
                  <div class="text-neutral-500 w-full text-left px-3 mt-1.5">
                    + {day.episodes.length - 6} more...
                  </div>
                  <div class="absolute bottom-6 h-fit w-full bg-neutral-900 py-2 rounded-md group-hover:block hidden">
                    {day.episodes.slice(6).map((episode) => (
                      <div
                        class={`flex items-center h-4 w-full group mt-1.5 px-3 ${+episode.airTime < Date.now() ? "opacity-30" : ""}`}
                      >
                        <div class="font-medium text-nowrap text-ellipsis overflow-hidden pr-2">
                          {episode.title.english || episode.title.romaji}
                        </div>
                        <div class="ml-auto mr-1 text-nowrap">
                          {episode.episode}
                        </div>
                        <div class="text-neutral-400 group-select:text-neutral-200">
                          {format(episode.airTime, "HH:mm")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  ) as HTMLElement;

  router.container!.appendChild(page);
}
