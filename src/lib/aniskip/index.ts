const API_URL = "https://api.aniskip.com/v1";

export type SkipType = "op" | "ed";

export interface Interval {
  start_time: number;
  end_time: number;
}

export interface SkipResult {
  interval: Interval;
  skip_type: SkipType;
  skip_id: string;
  episode_length: number;
}

export interface SkipResponse {
  found: boolean;
  results: SkipResult[];
}

export async function getSkipTimes(
  malId: number,
  episode: number,
): Promise<SkipResponse> {
  let req = await fetch(
    `${API_URL}/skip-times/${malId}/${episode}?types=op&types=ed`,
  );
  let data: any = await req.json();

  return data;
}
