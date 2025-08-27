export interface Chapter {
  start: number;
  end: number;
  text: string;
}

interface Interval {
  startTime: number;
  endTime: number;
}

interface Result {
  interval: Interval;
  skipType: string;
  skipId: string;
  episodeLength: number;
}

interface AniSkip {
  found: boolean;
  results: Result[];
  message: string;
  statusCode: number;
}

export async function getAnimeChapters(
  idMal: number,
  episode: number,
  duration: number,
): Promise<Chapter[]> {
  const resAccurate = await fetch(
    `https://api.aniskip.com/v2/skip-times/${idMal}/${episode}/?episodeLength=${duration}&types=op&types=ed&types=recap`,
  );
  const jsonAccurate = (await resAccurate.json()) as AniSkip;

  const resRough = await fetch(
    `https://api.aniskip.com/v2/skip-times/${idMal}/${episode}/?episodeLength=0&types=op&types=ed&types=recap`,
  );
  const jsonRough = (await resRough.json()) as AniSkip;

  const map: Record<string, Result> = {};
  for (const result of [...jsonAccurate.results, ...jsonRough.results]) {
    if (!(result.skipType in map)) map[result.skipType] = result;
  }

  const results = Object.values(map);
  if (!results.length) return [];

  const chapters = results.map((result) => {
    const diff = duration - result.episodeLength;
    return {
      start: Math.max(0, (result.interval.startTime + diff) * 1000),
      end: Math.min(
        duration * 1000,
        Math.max(0, (result.interval.endTime + diff) * 1000),
      ),
      text: result.skipType.toUpperCase(),
    };
  });
  const ed = chapters.find(({ text }) => text === "ED");
  const recap = chapters.find(({ text }) => text === "RECAP");
  if (recap) recap.text = "Recap";

  chapters.sort((a, b) => a.start - b.start);
  if ((chapters[0]!.start | 0) !== 0) {
    chapters.unshift({
      start: 0,
      end: chapters[0]!.start,
      text: chapters[0]!.text === "OP" ? "Intro" : "Episode",
    });
  }
  if (ed) {
    if ((ed.end | 0) + 5000 - duration * 1000 < 0) {
      chapters.push({ start: ed.end, end: duration * 1000, text: "Preview" });
    }
  } else if (
    (chapters[chapters.length - 1]!.end | 0) + 5000 - duration * 1000 <
    0
  ) {
    chapters.push({
      start: chapters[chapters.length - 1]!.end,
      end: duration * 1000,
      text: "Episode",
    });
  }

  for (let i = 0, len = chapters.length - 2; i <= len; ++i) {
    const current = chapters[i];
    const next = chapters[i + 1];
    if ((current!.end | 0) !== (next!.start | 0)) {
      chapters.push({
        start: current!.end,
        end: next!.start,
        text: "Episode",
      });
    }
  }

  chapters.sort((a, b) => a.start - b.start);

  return chapters;
}
