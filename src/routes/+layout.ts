import { authClient } from "$lib/auth/auth";
import { initAPIClient } from "$lib/api";
import { get } from "svelte/store";
import { user, settings } from "$lib/stores";
import { toast } from "svelte-sonner";

export const prerender = false;

export const ssr = false;

export const trailingSlash = "always";

export const load = async () => {
  await settings.init();

  const apiClient = initAPIClient(get(settings).api_server);

  const { data: session, error } = await authClient.getSession();

  if (session && !error) {
    user.set(session.user);
  }

  return;
};
