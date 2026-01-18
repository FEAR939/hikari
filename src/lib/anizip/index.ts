export class Anizip {
  async getAnimeById(id: number) {
    const response = await fetch(`https://api.ani.zip/mappings?kitsu_id=${id}`);
    const data = await response.json();

    return data;
  }
}

export const anizip = new Anizip();
