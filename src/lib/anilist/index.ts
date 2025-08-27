export async function getSeasonAnime() {
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
