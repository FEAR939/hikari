import { goto } from "$app/navigation";
import { redirect } from "@sveltejs/kit";

export function load({ route }) {
  window.electronAPI.navigate((path: string) => {
    console.log("Navigate to:", path);
    goto(`/${path}`);
  });

  // if (route.id === "/") throw redirect(307, "/home");
}
