import { writable } from "svelte/store";
import type { MediaSource } from "../types";

export const user = writable<null | {}>(null);

export const showTopbar = writable(true);

export const showSettings = writable(false);
export const showSource = writable(false);
export const showFile = writable(false);
export const showTrailer = writable(false);

export const showPlayer = writable(false);

export const visibleEpisodes = writable<[]>([]);

export const sourceInitialIndex = writable(0);

export const currentAnime = writable<null | {}>(null);
export const currentAnimeAccentColor = writable<null | []>(null);

export const playerAnime = writable<null | {}>(null);
export const playerAnizip = writable<null | {}>(null);

export const playerEpisode = writable<null | {}>(null);

export const playerSources = writable<MediaSource[] | null>(null);

export const playerSourceIndex = writable<number | null>(null);

export const playerShowEpisodes = writable<boolean>(false);

export const fileSelectedPath = writable<string | null>(null);

export const defaultSettings = {
  api_server: "https://hikari.animenetwork.org",
  extensions: [],
  media_storage_path: undefined,
};

function createSettingsStore() {
  const { subscribe, set, update } = writable(defaultSettings);

  return {
    subscribe,

    async init() {
      if (window.electronStore) {
        const settings = await window.electronStore.getAll();
        set({ ...defaultSettings, ...settings });
      }
    },

    async setSetting(key: string, value: any) {
      if (window.electronStore) {
        await window.electronStore.set(key, value);
      }
      update((s) => ({ ...s, [key]: value }));
    },
  };
}

export const settings = createSettingsStore();
