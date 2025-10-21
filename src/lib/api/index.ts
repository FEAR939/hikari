import { authService } from "../../services/auth";

type AniListID = number;

type SET_Episode = {
  anilist_id: AniListID;
  episode: number;
  leftoff: number;
};

type GET_Episode = {
  anilist_id: AniListID;
  ident: number;
};

type LeftOffEntry = {
  id: number;
  user_id: number;
  anilist_id: AniListID;
  episode: number;
  leftoff: number;
  created_at: string;
};

export interface AnimeProgress {
  id: number;
  user_id: number;
  anilist_id: AniListID;
  episode: number;
  leftoff: number;
  created_at: string;
}

export interface Bookmark {
  anilist_id: AniListID;
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
    const user = authService.getUser();
    if (!user) return [];

    try {
      const response = await fetch(`${this.baseurl}/get-last-watched`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!response.ok || response.status !== 200) {
        throw new Error("Failed to fetch continue anime");
      }

      const data = await response.json();

      if (data.length === 0) {
        console.log("No continue anime found");
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
    formData.append("anilist_id", episode.anilist_id.toString());
    formData.append("episode", episode.episode.toString());
    formData.append("leftoff", episode.leftoff.toString());

    const response = await fetch(`${this.baseurl}/set-leftoff-at`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      console.error("Failed to update leftoff time");
    }
  }

  async getLeftoff(episode: GET_Episode): Promise<LeftOffEntry[]> {
    try {
      const formData = new FormData();
      formData.append("anilist_id", episode.anilist_id.toString());
      formData.append("episode_filter", `${episode.ident}-${episode.ident}`);

      const response = await fetch(`${this.baseurl}/get-leftoff-at`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        console.warn("Failed to get leftoff time");
        return [];
      }

      const data = await response.json();

      return data.map((entry: LeftOffEntry) => ({
        anilist_id: entry.anilist_id,
        episode: entry.episode,
        leftoff: entry.leftoff,
      }));
    } catch (error) {
      console.warn("Error getting leftoff time: ", error);
      return [];
    }
  }

  async getAnimeProgress(
    anilist_id: string,
    episode_start: number,
    episode_end: number,
  ): Promise<AnimeProgress[]> {
    const formData = new FormData();
    formData.append("anilist_id", anilist_id);
    formData.append("episode_filter", `${episode_start}-${episode_end}`);

    const response = await fetch(`${this.baseurl}/get-leftoff-at`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      console.error("Failed to fetch episode progress");
      return [];
    }

    const data = await response.json();
    return data;
  }

  async setBookmark(
    anilist_id: number,
    subscribe: boolean,
    notify: boolean,
    remove: boolean,
  ) {
    const formData = new FormData();
    formData.append("anilist_id", anilist_id.toString());
    formData.append("subscribed", subscribe.toString());
    formData.append("notifications", notify.toString());
    formData.append("remove", remove.toString());

    const response = await fetch(`${this.baseurl}/set-bookmark`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      console.warn("Failed to set bookmark");
      return false;
    }

    return true;
  }

  async getBookmarks(anilist_id?: number): Promise<BookmarkResponse> {
    const response = await fetch(`${this.baseurl}/get-bookmarks`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: (() => {
        if (!anilist_id) return null;
        const formData = new FormData();
        formData.append("anilist_id", anilist_id.toString());
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
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      console.error("Failed to upload avatar");
      return false;
    }

    const data = await response.json();

    return data.path;
  }
}
