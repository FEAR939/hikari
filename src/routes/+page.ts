import { goto } from "$app/navigation";
import { redirect } from "@sveltejs/kit";

export function load({ route }) {
  window.electronAPI.navigate((path: string) => {
    goto(`/${path}`);
  });

  // if (route.id === "/") throw redirect(307, "/home");
}
