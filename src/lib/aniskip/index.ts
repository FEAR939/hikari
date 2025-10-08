const API_URL = "https://api.aniskip.com/v1";

export async function getSkipTimes(malId: number, episode: number) {
  let req = await fetch(
    `${API_URL}/skip-times/${malId}/${episode}?types=op&types=ed`,
  );
  let data: any = await req.json();

  return data;
}
