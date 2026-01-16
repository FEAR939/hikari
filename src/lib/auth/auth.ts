import { createAuthClient } from "better-auth/svelte";

type AuthState = {
  user: null | {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
    banner: string | null;
  };
};

export const authClient = createAuthClient({
  baseURL: "https://hikari.animenetwork.org",
});
