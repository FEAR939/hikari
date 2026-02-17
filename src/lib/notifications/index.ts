import { user, notifications } from "$lib/stores";
import { getAPIClient } from "$lib/api";

export async function get_notifications() {
  let temp_notas = [];
  if (!user) return notifications.set(temp_notas);

  let API = getAPIClient();

  const serverNotifications = await API.getNotifications();
  temp_notas = [...temp_notas, ...serverNotifications];

  notifications.set(temp_notas);
}
