export async function getAnimeAnizip(id: number) {
  const response = await fetch(`https://api.ani.zip/mappings?anilist_id=${id}`);
  const data = await response.json();

  return data;
}
