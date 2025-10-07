import { cache } from "../../services/cache";

export async function getSeasonAnime() {
  if (cache.get("anilist_seasonanime")) {
    return JSON.parse(cache.get("anilist_seasonanime") || "");
  }
  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `
      query {
        Page(page: 0, perPage: 30) {
          pageInfo {
            hasNextPage
            currentPage
          }
          media(season: SUMMER, seasonYear: ${new Date().getFullYear()}, type: ANIME, sort: POPULARITY_DESC) {
            id
            title {
              romaji
              english
              native
            }
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            season
            seasonYear
            episodes
            status
            genres
            averageScore
            coverImage {
              large
              medium
            }
            bannerImage
            description
          }
        }
      }
      `,
    }),
  });
  const data = await response.json();

  cache.set(
    "anilist_seasonanime",
    JSON.stringify(data.data.Page.media),
    60 * 60 * 1000,
  ); // 1 hour cache lifetime
  return data.data.Page.media;
}

export async function getAnime(id: number) {
  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `
      query {
        Media (id: ${id}, type: ANIME) {
          id
          idMal
          title {
            romaji
            english
            native
          }
          bannerImage
          coverImage {
            large
          }
          trailer {
            id
            site
            thumbnail
          }
          description
          genres
          format
          status
          duration
          episodes
          averageScore
          popularity
          siteUrl
          relations {
              edges {
                relationType
              }
              nodes {
                id
                type
                title {
                  romaji
                  english
                }
                coverImage {
                  large
                }
              }
            }
        }
      }
      `,
    }),
  });
  const data = await response.json();
  return data.data.Media;
}

export async function getSearch(searchString: string) {
  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `
      query {
      Page (page: 0, perPage: 10) {
          media (search: "${searchString}", type: ANIME) {
            id
            title {
              romaji
              english
            }
          }
        }
      }
      `,
    }),
  });
  const data = await response.json();
  return data.data.Page.media;
}

export async function getTrendingAnime() {
  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `
        query {
          Page(page: 0, perPage: 5) {
            media(type: ANIME, sort: TRENDING_DESC) {
              id
              title {
                romaji
                english
              }
              description
              bannerImage
              trailer {
                thumbnail
              }
            }
          }
        }`,
    }),
  });
  const data = await response.json();
  return data.data.Page.media;
}

export async function getMultipleAnime(ids) {
  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `
      query {
          ${ids
            .map(
              (id) => `id${id}: Media(id: ${id}) {
            id
            title {
              romaji
              english
            }
            coverImage {
              large
            }
          }`,
            )
            .join("\n")}
      }`,
    }),
  });

  const data = await response.json();
  return data.data;
}
