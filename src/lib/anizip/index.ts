export interface Title {
  en: string;
  ja: string;
}

export interface Episode {
  episodeNumber: number;
  title: Title;
  airdate: string;
  runtime: number;
  overview: string;
  image: string;
  episode: string;
}

export type ImageType = "Banner" | "Poster" | "Fanart" | "Clearlogo";

export interface Image {
  coverType: ImageType;
  url: string;
}

export type Mapping = {
  titles: {
    en: string;
    ja: string;
  };
  episodes: {
    [key: number]: Episode;
  };
  episodeCount: number;
  image: Image[];
};

export async function getAnimeAnizip(id: number): Promise<Mapping> {
  const response = await fetch(`https://api.ani.zip/mappings?anilist_id=${id}`);
  const data = await response.json();

  return data;
}
