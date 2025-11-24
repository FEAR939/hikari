import { router } from "../lib/router";
import { API } from "../app";

type AuthState = {
  user: null | {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
    banner: string | null;
  };
};

class AuthService {
  state: AuthState = { user: null };
  listeners: ((user: AuthState["user"]) => void)[] = [];

  constructor() {
    this.state = { user: null };
  }

  getUser(): AuthState["user"] {
    return this.state.user;
  }

  setUser(user: AuthState["user"]) {
    this.state.user = user;
    this.listeners.forEach((listener) => listener(user));
  }

  subscribe(listener: (user: AuthState["user"]) => void) {
    this.listeners.push(listener);
  }

  async authenticate(tokens?: { accessToken: string; refreshToken: string }) {
    if (tokens) {
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
    }
    if (localStorage.getItem("accessToken") == null) return;

    let user = await this.access();

    if (!user) {
      console.warn("accessToken expired, trying to refresh");

      const refresh = await this.refreshToken();

      if (!refresh) return router.navigate("/auth");

      user = await this.access();
    }

    console.log("User: ", user);
    this.setUser(user);
  }

  async access() {
    try {
      const formData = new FormData();
      formData.append("accessToken", localStorage.getItem("accessToken")!);

      const response = await fetch(`${API.baseurl}/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!response.ok) return false;

      if (response.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        return false;
      }

      const user = await response.json();
      return user;
    } catch (error) {
      console.warn("Could not pull user data from server! -> ", error);
      return false;
    }
  }

  async refreshToken() {
    const formData = new FormData();
    formData.append("refreshToken", localStorage.getItem("refreshToken")!);

    const response = await fetch(`${API.baseurl}/auth/refresh`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const { accessToken, refreshToken } = await response.json();
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      return true;
    } else {
      console.warn("Failed to refresh token");
      return false;
    }
  }

  async logout() {
    const formdata = new FormData();
    formdata.append("refreshToken", localStorage.getItem("refreshToken")!);

    const response = await fetch(`${API.baseurl}/auth/logout`, {
      method: "POST",
      body: formdata,
    });

    if (!response.ok) {
      return console.error("Failed to logout");
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    this.setUser(null);
  }
}

export const authService = new AuthService();
