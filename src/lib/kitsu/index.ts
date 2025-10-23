import { cache } from "../../services/cache";

interface KitsuAnime {
  id: string;
  type: string;
  attributes: {
    slug: string;
    synopsis: string;
    description: string;
    canonicalTitle: string;
    titles: {
      en?: string;
      en_us?: string;
      en_jp?: string;
      ja_jp?: string;
    };
    averageRating: string | null;
    userCount: number;
    favoritesCount: number;
    startDate: string | null;
    endDate: string | null;
    nextRelease: string | null;
    popularityRank: number | null;
    ratingRank: number | null;
    ageRating: string | null;
    ageRatingGuide: string | null;
    subtype: string;
    status: string;
    posterImage: {
      tiny: string;
      large: string;
      small: string;
      medium: string;
      original: string;
    } | null;
    coverImage: {
      tiny: string;
      large: string;
      small: string;
      original: string;
    } | null;
    episodeCount: number | null;
    episodeLength: number | null;
    totalLength: number | null;
    youtubeVideoId: string | null;
    showType: string;
    nsfw: boolean;
  };
  relationships?: {
    genres?: {
      data: Array<{ id: string; type: string }>;
    };
    categories?: {
      data: Array<{ id: string; type: string }>;
    };
    mediaRelationships?: {
      data: Array<{ id: string; type: string }>;
    };
    episodes?: {
      links?: {
        related?: string;
      };
    };
  };
}

interface KitsuCategory {
  id: string;
  type: "categories";
  attributes: {
    title: string;
    slug: string;
    description: string;
    nsfw: boolean;
  };
}

interface KitsuEpisode {
  id: string;
  type: "episodes";
  attributes: {
    createdAt: string;
    updatedAt: string;
    synopsis: string | null;
    description: string | null;
    titles: {
      en?: string;
      en_jp?: string;
      ja_jp?: string;
    };
    canonicalTitle: string | null;
    seasonNumber: number | null;
    number: number;
    relativeNumber: number | null;
    airdate: string | null;
    length: number | null;
    thumbnail: {
      original?: string;
      meta?: {
        dimensions?: {
          tiny?: { width: number; height: number };
          small?: { width: number; height: number };
          medium?: { width: number; height: number };
          large?: { width: number; height: number };
        };
      };
    } | null;
  };
}

interface KitsuMediaRelationship {
  id: string;
  type: "mediaRelationships";
  attributes: {
    role:
      | "sequel"
      | "prequel"
      | "alternative_setting"
      | "alternative_version"
      | "side_story"
      | "parent_story"
      | "summary"
      | "full_story"
      | "spinoff"
      | "adaptation"
      | "character"
      | "other";
  };
  relationships?: {
    destination?: {
      data: { id: string; type: string };
    };
  };
}

interface RelatedAnime {
  id: string;
  role: string;
  anime: KitsuAnime;
}

interface AnimeWithDetails {
  anime: KitsuAnime;
  genres: KitsuCategory[];
  relations: RelatedAnime[];
}

interface KitsuResponse<T> {
  data: T;
  included?: Array<
    KitsuAnime | KitsuCategory | KitsuMediaRelationship | KitsuEpisode
  >;
  meta?: {
    count?: number;
  };
  links?: {
    first?: string;
    next?: string;
    last?: string;
  };
}

type CategoryType = "trending" | "seasonal";

interface CategoryRequest {
  type: CategoryType;
  title: string;
  limit?: number;
}

interface CategoryResult {
  type: CategoryType;
  title: string;
  data: KitsuAnime[];
}

export class KitsuClient {
  private baseUrl = "https://kitsu.io/api/edge";
  private headers: HeadersInit;

  constructor() {
    this.headers = {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    };
  }

  /**
   * Fetch multiple categories at once with custom titles
   */
  async getCategories(
    categories: CategoryRequest[],
    defaultLimit: number = 20,
  ): Promise<CategoryResult[]> {
    const promises = categories.map(async (category) => {
      const limit = category.limit ?? defaultLimit;
      const data = await this.fetchCategory(category.type, limit);

      return {
        type: category.type,
        title: category.title,
        data,
      };
    });

    return Promise.all(promises);
  }

  /**
   * Internal method to fetch a specific category
   */
  private async fetchCategory(
    category: CategoryType,
    limit: number,
  ): Promise<KitsuAnime[]> {
    let url: string;

    switch (category) {
      case "trending":
        url = `${this.baseUrl}/trending/anime?limit=${limit}`;
        break;
      case "seasonal":
        const season = this.getCurrentSeason();
        const year = new Date().getFullYear();
        url = `${this.baseUrl}/anime?filter[season]=${season}&filter[seasonYear]=${year}&filter[subtype]=TV,ONA,OVA,special,movie&sort=averageRating&page[limit]=${limit}`;
        break;
      default:
        throw new Error(`Unknown category: ${category}`);
    }

    if (cache.get(url)) {
      return cache.get(url);
    }

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(
        `Kitsu API error: ${response.status} ${response.statusText}`,
      );
    }

    const json: KitsuResponse<KitsuAnime[]> = await response.json();

    cache.set(url, json.data, 1000 * 60 * 60 * 6); // Cache for 6 hours

    return json.data;
  }

  /**
   * Get a specific anime by ID with full details (genres, relations, and episodes)
   * @param id - Kitsu anime ID
   * @param episodeLimit - Maximum number of episodes to fetch (default: 2000)
   */
  async getAnimeById(
    id: string,
    episodeLimit: number = 2000,
  ): Promise<AnimeWithDetails> {
    // Step 1: Get anime with categories and mediaRelationships
    const url = `${this.baseUrl}/anime/${id}?include=categories,mediaRelationships.destination`;

    if (cache.get(url)) {
      return cache.get(url);
    }

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Anime with ID ${id} not found`);
      }
      throw new Error(
        `Kitsu API error: ${response.status} ${response.statusText}`,
      );
    }

    const json: KitsuResponse<KitsuAnime> = await response.json();

    if (json.data.attributes.episodeCount === null) {
      const episodeCount = await this.getEpisodeCount(json.data.id);
      json.data.attributes.episodeCount = episodeCount;
    }

    // Extract genres (categories) from included data
    const genres: KitsuCategory[] = [];
    const relationshipMap = new Map<string, KitsuMediaRelationship>();
    const relatedAnimeMap = new Map<string, KitsuAnime>();

    if (json.included) {
      for (const item of json.included) {
        if (item.type === "categories") {
          genres.push(item as KitsuCategory);
        } else if (item.type === "mediaRelationships") {
          relationshipMap.set(item.id, item as KitsuMediaRelationship);
        } else if (item.type === "anime") {
          relatedAnimeMap.set(item.id, item as KitsuAnime);
        }
      }
    }

    // Build relations array
    const relations: RelatedAnime[] = [];

    if (json.data.relationships?.mediaRelationships?.data) {
      for (const relData of json.data.relationships.mediaRelationships.data) {
        const relationship = relationshipMap.get(relData.id);

        if (relationship?.relationships?.destination?.data) {
          const destinationId = relationship.relationships.destination.data.id;
          const relatedAnime = relatedAnimeMap.get(destinationId);

          if (relatedAnime) {
            relations.push({
              id: relatedAnime.id,
              role: relationship.attributes.role,
              anime: relatedAnime,
            });
          }
        }
      }
    }

    cache.set(
      url,
      {
        anime: json.data,
        genres,
        relations,
      },
      1000 * 60 * 60 * 1,
    ); // Cache for 1 hour

    return {
      anime: json.data,
      genres,
      relations,
    };
  }

  /**
   * Get specific range of episodes
   * @param animeId - Kitsu anime ID
   * @param start - Start episode number
   * @param end - End episode number
   */
  async getEpisodesPagination(
    animeId: string,
    page: number,
    limit: number,
  ): Promise<KitsuEpisode[]> {
    const url = `${this.baseUrl}/episodes?filter[mediaId]=${animeId}&page[limit]=${limit}&page[offset]=${page * limit}`;

    if (cache.get(url)) {
      return cache.get(url);
    }

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch episodes: ${response.status}`);
    }

    const json: KitsuResponse<KitsuEpisode[]> = await response.json();

    cache.set(url, json.data || [], 1000 * 60 * 60 * 0.5); // Cache for 30 minutes

    return json.data || [];
  }

  /**
   * Get episodeCount by anime ID
   * @param animeId - Kitsu anime ID
   */
  async getEpisodeCount(animeId: string): Promise<number> {
    const url = `${this.baseUrl}/episodes?filter[mediaId]=${animeId}&page[limit]=1&page[offset]=0`;

    if (cache.get(url)) {
      return cache.get(url);
    }

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch episodes: ${response.status}`);
    }

    const json: KitsuResponse<number> = await response.json();

    cache.set(url, json.meta || 0, 1000 * 60 * 60 * 0.5); // Cache for 30 minutes

    return json.meta!.count || 0;
  }

  /**
   * Search for anime by text query
   */
  async searchAnime(
    query: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ data: KitsuAnime[]; total?: number }> {
    const params = new URLSearchParams({
      "filter[text]": query,
      "page[limit]": limit.toString(),
      "page[offset]": offset.toString(),
    });

    const url = `${this.baseUrl}/anime?${params.toString()}`;

    if (cache.get(url)) {
      return cache.get(url);
    }

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(
        `Kitsu API error: ${response.status} ${response.statusText}`,
      );
    }

    const json: KitsuResponse<KitsuAnime[]> = await response.json();

    cache.set(
      url,
      {
        data: json.data,
        total: json.meta?.count,
      },
      1000 * 60 * 60 * 0.5,
    ); // Cache for 30 minutes

    return {
      data: json.data,
      total: json.meta?.count,
    };
  }

  /**
   * Get current anime season
   */
  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;

    if (month >= 1 && month <= 3) return "winter";
    if (month >= 4 && month <= 6) return "spring";
    if (month >= 7 && month <= 9) return "summer";
    return "fall";
  }

  /**
   * Advanced search with filters
   */
  async advancedSearch(options: {
    text?: string;
    season?: string;
    seasonYear?: number;
    status?: "current" | "finished" | "tba" | "unreleased" | "upcoming";
    ageRating?: string;
    limit?: number;
    offset?: number;
    sort?: string;
  }): Promise<{ data: KitsuAnime[]; total?: number }> {
    const params = new URLSearchParams();

    if (options.text) params.append("filter[text]", options.text);
    if (options.season) params.append("filter[season]", options.season);
    if (options.seasonYear)
      params.append("filter[seasonYear]", options.seasonYear.toString());
    if (options.status) params.append("filter[status]", options.status);
    if (options.ageRating)
      params.append("filter[ageRating]", options.ageRating);
    if (options.sort) params.append("sort", options.sort);

    params.append("page[limit]", (options.limit || 20).toString());
    params.append("page[offset]", (options.offset || 0).toString());

    const url = `${this.baseUrl}/anime?${params.toString()}`;

    if (cache.get(url)) {
      return cache.get(url);
    }

    const response = await fetch(url, { headers: this.headers });

    if (!response.ok) {
      throw new Error(
        `Kitsu API error: ${response.status} ${response.statusText}`,
      );
    }

    const json: KitsuResponse<KitsuAnime[]> = await response.json();

    cache.set(
      url,
      {
        data: json.data,
        total: json.meta?.count,
      },
      1000 * 60 * 60 * 0.5,
    ); // Cache for 30 minutes

    return {
      data: json.data,
      total: json.meta?.count,
    };
  }

  /**
   * Get multiple anime by their IDs
   * @param ids - Array of Kitsu anime IDs
   * @param includeDetails - Whether to include full details (genres, relations, episodes)
   */
  async getAnimeByIds(
    ids: string[],
    includeDetails: boolean = false,
  ): Promise<KitsuAnime[] | AnimeWithDetails[]> {
    if (ids.length === 0) {
      return [];
    }

    // Kitsu API supports filtering by multiple IDs using comma-separated values
    // Maximum of 10 IDs per request (API limitation)
    const batchSize = 10;
    const batches: string[][] = [];

    for (let i = 0; i < ids.length; i += batchSize) {
      batches.push(ids.slice(i, i + batchSize));
    }

    if (includeDetails) {
      // Fetch full details for each anime individually (slower but complete)
      const promises = ids.map((id) => this.getAnimeById(id));
      return Promise.all(promises);
    } else {
      // Fetch basic info in batches (faster)
      const allAnime: KitsuAnime[] = [];

      for (const batch of batches) {
        const idsParam = batch.join(",");
        const url = `${this.baseUrl}/anime?filter[id]=${idsParam}`;

        const cacheKey = `batch:${idsParam}`;
        if (cache.get(cacheKey)) {
          allAnime.push(...cache.get(cacheKey));
          continue;
        }

        const response = await fetch(url, { headers: this.headers });

        if (!response.ok) {
          console.warn(
            `Failed to fetch batch: ${response.status} ${response.statusText}`,
          );
          continue;
        }

        const json: KitsuResponse<KitsuAnime[]> = await response.json();

        if (json.data) {
          allAnime.push(...json.data);
          cache.set(cacheKey, json.data, 1000 * 60 * 60 * 1); // Cache for 1 hour
        }
      }

      // Maintain original order
      const animeMap = new Map(allAnime.map((anime) => [anime.id, anime]));
      return ids.map((id) => animeMap.get(id)).filter(Boolean) as KitsuAnime[];
    }
  }

  /**
   * Get multiple anime by their IDs with parallel requests (faster)
   * @param ids - Array of Kitsu anime IDs
   */
  async getAnimeByIdsParallel(ids: string[]): Promise<KitsuAnime[]> {
    if (ids.length === 0) {
      return [];
    }

    const promises = ids.map(async (id) => {
      try {
        const url = `${this.baseUrl}/anime/${id}`;

        if (cache.get(url)) {
          return cache.get(url);
        }

        const response = await fetch(url, { headers: this.headers });

        if (!response.ok) {
          console.warn(`Failed to fetch anime ${id}: ${response.status}`);
          return null;
        }

        const json: KitsuResponse<KitsuAnime> = await response.json();
        cache.set(url, json.data, 1000 * 60 * 60 * 1); // Cache for 1 hour

        return json.data;
      } catch (error) {
        console.error(`Error fetching anime ${id}:`, error);
        return null;
      }
    });

    const results = await Promise.all(promises);
    return results.filter(Boolean) as KitsuAnime[];
  }
}

// Export singleton instance
export const kitsu = new KitsuClient();

// Export types
export type {
  KitsuAnime,
  KitsuCategory,
  KitsuEpisode,
  KitsuMediaRelationship,
  RelatedAnime,
  AnimeWithDetails,
  CategoryResult,
  CategoryRequest,
};
