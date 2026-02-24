type AniListID = number;

type SET_Episode = {
  kitsu_id: AniListID;
  episode: number;
  leftoff: number;
};

type GET_Episode = {
  kitsu_id: AniListID;
  ident: number;
};

type LeftOffEntry = {
  id: number;
  user_id: number;
  kitsu_id: AniListID;
  episode: number;
  leftoff: number;
  created_at: string;
};

export interface AnimeProgress {
  id: number;
  user_id: number;
  kitsu_id: AniListID;
  episode: number;
  leftoff: number;
  created_at: string;
}

export interface Bookmark {
  kitsu_id: AniListID;
  subscribed: boolean;
  notifications: boolean;
}

export type BookmarkResponse = Bookmark[];

interface APIClient {
  baseurl: string;
}

export class Client implements APIClient {
  baseurl: string;

  constructor(baseurl: string) {
    this.baseurl = baseurl;
  }

  async getContinueAnime(): Promise<AniListID[]> {
    try {
      const response = await fetch(`${this.baseurl}/get-last-watched`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok || response.status !== 200) {
        throw new Error("Failed to fetch continue anime");
      }

      const data = await response.json();

      if (data.length === 0) {
        return [];
      }

      return data;
    } catch (error) {
      console.warn(error);
      return [];
    }
  }

  async setLeftoff(episode: SET_Episode): Promise<void> {
    const formData = new FormData();
    formData.append("kitsu_id", episode.kitsu_id.toString());
    formData.append("episode", episode.episode.toString());
    formData.append("leftoff", episode.leftoff.toString());

    const response = await fetch(`${this.baseurl}/set-leftoff-at`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      console.error("Failed to update leftoff time");
    }
  }

  async getLeftoff(episode: GET_Episode): Promise<LeftOffEntry[]> {
    try {
      const formData = new FormData();
      formData.append("kitsu_id", episode.kitsu_id.toString());
      formData.append("episode_filter", `${episode.ident}-${episode.ident}`);

      const response = await fetch(`${this.baseurl}/get-leftoff-at`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        console.warn("Failed to get leftoff time");
        return [];
      }

      const data = await response.json();

      if (data.error) {
        return [];
      }

      return data.map((entry: LeftOffEntry) => ({
        kitsu_id: entry.kitsu_id,
        episode: entry.episode,
        leftoff: entry.leftoff,
      }));
    } catch (error) {
      console.warn("Error getting leftoff time: ", error);
      return [];
    }
  }

  async getAnimeProgress(
    kitsu_id: string,
    episode_start: number,
    episode_end: number,
  ): Promise<AnimeProgress[]> {
    const formData = new FormData();
    formData.append("kitsu_id", kitsu_id);
    formData.append("episode_filter", `${episode_start}-${episode_end}`);

    const response = await fetch(`${this.baseurl}/get-leftoff-at`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      console.error("Failed to fetch episode progress");
      return [];
    }

    const data = await response.json();

    if (data.error) {
      return [];
    }

    return data;
  }

  async setBookmark(
    kitsu_id: number,
    subscribe: boolean,
    notify: boolean,
    remove: boolean,
  ): boolean {
    const formData = new FormData();
    formData.append("kitsu_id", kitsu_id.toString());
    formData.append("subscribed", subscribe.toString());
    formData.append("notifications", notify.toString());
    formData.append("remove", remove.toString());

    const response = await fetch(`${this.baseurl}/set-bookmark`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      console.warn("Failed to set bookmark");
      return false;
    }

    return true;
  }

  async getBookmarks(kitsu_id?: number): Promise<BookmarkResponse> {
    const response = await fetch(`${this.baseurl}/get-bookmarks`, {
      method: "POST",
      credentials: "include",
      body: (() => {
        if (!kitsu_id) return null;
        const formData = new FormData();
        formData.append("kitsu_id", kitsu_id.toString());
        return formData;
      })(),
    });

    if (!response.ok) {
      console.error("Failed to fetch bookmarks");
      return [];
    }

    const data = await response.json();
    return data;
  }

  async uploadAvatar(file: File): Promise<string | boolean> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "0");

    const response = await fetch(`${this.baseurl}/upload-photo`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      console.error("Failed to upload avatar");
      return false;
    }

    const data = await response.json();

    return data.path;
  }

  // Fetches only notifications NEWER than the sync point (for polling)
  async getNewNotifications(since?: string | null) {
    const params = new URLSearchParams();
    if (since) params.set("since", since);

    const response = await fetch(
      `${this.baseurl}/notifications/new?${params}`,
      {
        credentials: "include",
      },
    );
    return response.json();
  }

  // Fetches older notifications with cursor (for pagination in the panel)
  async getNotifications(limit: number, cursor?: string | null) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (cursor) params.set("cursor", cursor);

    const response = await fetch(`${this.baseurl}/notifications?${params}`, {
      credentials: "include",
    });
    return response.json();
  }

  async markNotificationsRead(syncPoint: string): Promise<boolean> {
    const formData = new FormData();
    formData.append("lastsync", syncPoint);

    const response = await fetch(`${this.baseurl}/mark-notifications-read`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      console.error("Failed to mark notifications as read");
      return false;
    }

    return true;
  }
}

let client: Client;

export function initAPIClient(baseUrl: string) {
  client = new Client(baseUrl);
  return client;
}

export function getAPIClient() {
  if (!client) {
    console.error("Client not initialized");
  }
  return client;
}
