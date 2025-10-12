// queries/anilist.ts
import { initGraphQLTada } from "gql.tada";
import type { introspection } from "./graphql-env.d.ts"; // You'll generate this

export const graphql = initGraphQLTada<{
  introspection: introspection;
}>();

export const GET_SEASON_ANIME = graphql(`
  query GetSeasonAnime(
    $season: MediaSeason!
    $seasonYear: Int!
    $page: Int!
    $perPage: Int!
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
        currentPage
      }
      media(
        season: $season
        seasonYear: $seasonYear
        type: ANIME
        sort: POPULARITY_DESC
      ) {
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
`);

export const GET_TRENDING_ANIME = graphql(`
  query GetTrendingAnime($page: Int!, $perPage: Int!) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, sort: TRENDING_DESC) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
          medium
        }
        description
        bannerImage
        trailer {
          thumbnail
        }
      }
    }
  }
`);

export const GET_SEARCH = graphql(`
  query SearchAnime($search: String!, $page: Int!, $perPage: Int!) {
    Page(page: $page, perPage: $perPage) {
      media(search: $search, type: ANIME) {
        id
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
`);

export const GET_ANIME = graphql(`
  query GetAnime($id: Int!) {
    Media(id: $id, type: ANIME) {
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
`);

// For multiple anime, use id_in parameter
export const GET_MULTIPLE_ANIME = graphql(`
  query GetMultipleAnime($ids: [Int]!) {
    Page {
      media(id_in: $ids, type: ANIME) {
        id
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
`);
