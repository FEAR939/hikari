import {
  user,
  notifications,
  notificationsToDisplay,
  notificationsSyncPoint,
} from "$lib/stores";
import { writable } from "svelte/store";
import { getAPIClient } from "$lib/api";
import { get } from "svelte/store";
import { kitsu, getSeriesTitle } from "$lib/kitsu";
import { anizip } from "$lib/anizip";

const BATCH_SIZE = 10;
let nextCursor: string | null = null;

export const loading = writable(false);
export const hasMore = writable(true);

export function resetPagination() {
  nextCursor = null;
  hasMore.set(true);
  notificationsToDisplay.set([]);
}

export async function loadNextPage() {
  if (get(loading) || !get(hasMore)) return;
  loading.set(true);

  try {
    const API = getAPIClient();

    const result = await API.getNotifications(BATCH_SIZE, nextCursor);

    nextCursor = result.nextCursor;
    hasMore.set(result.nextCursor !== null);

    const enriched = await enrichNotifications(result.notifications);

    notificationsToDisplay.update((current) => {
      const existingIds = new Set(current.map((n) => n.id));
      const newOnly = enriched.filter((n) => !existingIds.has(n.id));

      return [...current, ...newOnly];
    });
  } finally {
    loading.set(false);
  }
}

export async function fetchNotifications() {
  if (!get(user)) return;
  const API = getAPIClient();
  const result = await API.getNotifications(BATCH_SIZE, nextCursor);

  nextCursor = result.nextCursor;
  hasMore = result.nextCursor !== null;
  notificationsSyncPoint.set(result.syncedAt);

  notifications.update((current) => [...current, ...result.notifications]);
}

export function isLoading() {
  return loading;
}

export function canLoadMore() {
  return hasMore;
}

async function processLatestBatch() {
  const allNotifications = get(notifications);
  const alreadyDisplayed = get(notificationsToDisplay).length;
  const currentBatch = allNotifications.slice(alreadyDisplayed);

  if (currentBatch.length === 0) return;

  const enriched = await enrichNotifications(currentBatch);

  notificationsToDisplay.update((current) => [...current, ...enriched]);
}

async function enrichNotifications(batch: any[]) {
  const episodeNotifications = batch.filter((n) => n.type === "episode.aired");
  const uniqueKitsuIds = [
    ...new Set(episodeNotifications.map((n) => n.kitsu_id)),
  ];

  if (uniqueKitsuIds.length === 0) return batch;

  const kitsuQueries = uniqueKitsuIds.map((id) => ({
    kitsu_id: id,
    episode: episodeNotifications.find((n) => n.kitsu_id === id).episode_number,
  }));

  const [kitsuResults, anizipResults] = await Promise.all([
    Promise.all(
      kitsuQueries.map((q) => kitsu.getAnimeAndEpisodesByNumber([q])),
    ),
    Promise.all(
      uniqueKitsuIds.map(async (id) => ({
        kitsu_id: id,
        data: await anizip.getAnimeById(id),
      })),
    ),
  ]);

  const kitsuMap = new Map();
  for (const result of kitsuResults) {
    const entry = result[0];
    kitsuMap.set(entry.anime.anime.id, entry);
  }

  const anizipMap = new Map();
  for (const result of anizipResults) {
    anizipMap.set(result.kitsu_id, result.data);
  }

  return batch.map((notification) => {
    if (notification.type === "episode.aired") {
      const kitsuData = kitsuMap.get(notification.kitsu_id);
      const anizipData = anizipMap.get(notification.kitsu_id);
      const title = getSeriesTitle(kitsuData.anime.anime);
      const kitsuImage = kitsuData.episode.attributes.thumbnail?.original;
      const anizipImage =
        anizipData?.episodes?.[String(notification.episode_number)]?.image;

      notification.title = `${title} episode ${notification.episode_number} just aired!`;
      notification.image_url = anizipImage || kitsuImage || "";
    }
    return notification;
  });
}

export async function markNotificationsRead() {
  const syncPoint = get(notificationsSyncPoint);
  if (!syncPoint) return;

  const API = getAPIClient();
  await API.markNotificationsRead(syncPoint);

  notifications.update((current) =>
    current.map((notification) => ({
      ...notification,
      read: true,
    })),
  );
}
