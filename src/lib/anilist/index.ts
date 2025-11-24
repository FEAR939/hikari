// services/graphql-client.ts
import { Client, cacheExchange, fetchExchange } from "urql";

export const anilistClient = new Client({
  url: "https://graphql.anilist.co",
  exchanges: [cacheExchange, fetchExchange],
  requestPolicy: "cache-first", // Uses cache when available
  fetch: (url, options) => {
    return fetch(url, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options?.headers,
      },
    });
  },
});

import { cache } from "../../services/cache";
import {
  GET_SEASON_ANIME,
  GET_TRENDING_ANIME,
  GET_SEARCH,
  GET_MULTIPLE_ANIME,
  GET_ANIME,
  GET_SCHEDULE,
} from "./queries";
import type { ResultOf, VariablesOf } from "gql.tada";

export type SectionConfig =
  | {
      type: "seasonal";
      title?: string;
      params?: { season?: MediaSeason; seasonYear?: number; perPage?: number };
    }
  | { type: "trending"; title?: string; params?: { perPage?: number } }
  | { type: "continue"; title?: string; params: { ids: number[] } }
  | {
      type: "search";
      title?: string;
      params: { search: string; perPage?: number };
    }
  | { type: "anime"; title?: string; params: { id: number } }
  | {
      type: "schedule";
      title?: string;
      params?: { season?: MediaSeason; seasonYear?: number };
    };

type MediaSeason = "WINTER" | "SPRING" | "SUMMER" | "FALL";

export async function fetchSections(sections: SectionConfig[]) {
  const queries = sections.map(async (section) => {
    const cacheKey = `anilist_${section.type}_${JSON.stringify(section.params || {})}`;

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      return {
        type: section.type,
        title: section.title,
        data: JSON.parse(cached),
        error: null,
        fromCache: true,
      };
    }

    let result;

    switch (section.type) {
      case "seasonal": {
        const season = section.params?.season || getCurrentSeason();
        const seasonYear =
          section.params?.seasonYear || new Date().getFullYear();
        result = await anilistClient.query(GET_SEASON_ANIME, {
          season,
          seasonYear,
          page: 0,
          perPage: section.params?.perPage || 30,
        });
        break;
      }

      case "trending": {
        result = await anilistClient.query(GET_TRENDING_ANIME, {
          page: 0,
          perPage: section.params?.perPage || 5,
        });
        break;
      }

      case "continue": {
        if (!section.params.ids.length) {
          return {
            type: section.type,
            data: [],
            error: null,
            fromCache: false,
          };
        }
        result = await anilistClient.query(GET_MULTIPLE_ANIME, {
          ids: section.params.ids,
          perPage: 50,
        });
        break;
      }

      case "search": {
        result = await anilistClient.query(GET_SEARCH, {
          search: section.params.search,
          page: 0,
          perPage: section.params?.perPage || 10,
        });
        break;
      }

      case "anime": {
        result = await anilistClient.query(GET_ANIME, {
          id: section.params.id,
        });
        break;
      }

      case "schedule": {
        const season = section.params?.season || getCurrentSeason();
        const seasonYear =
          section.params?.seasonYear || new Date().getFullYear();
        result = await anilistClient.query(GET_SCHEDULE, {
          season,
          seasonYear,
        });
        break;
      }
    }

    const data =
      result.data?.Page?.media ||
      result.data?.Page ||
      result.data?.Media ||
      null;

    // Cache successful results
    if (data && !result.error) {
      cache.set(cacheKey, JSON.stringify(data), 60 * 60 * 1000); // 1 hour
    }

    return {
      type: section.type,
      title: section.title,
      data,
      error: result.error,
      fromCache: false,
    };
  });

  return await Promise.all(queries);
}

function getCurrentSeason(): MediaSeason {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "SPRING";
  if (month >= 6 && month <= 8) return "SUMMER";
  if (month >= 9 && month <= 11) return "FALL";
  return "WINTER";
}

// Helper for dynamic compound searches (like your searchCompound)
export async function searchCompound(
  titles: Array<{ title: string; year?: number }>,
) {
  const searches = titles.map(async ({ title, year }) => {
    const result = await anilistClient.query(GET_SEARCH, {
      search: title,
      page: 0,
      perPage: 10,
    });

    if (!result.data?.Page?.media?.length) return null;

    // Filter by year if provided
    const media = year
      ? result.data.Page.media.find((m) => m?.seasonYear === year)
      : result.data.Page.media[0];

    return media;
  });

  return await Promise.all(searches);
}
