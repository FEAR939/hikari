import { router } from "../lib/router";

type AuthState = { user: null | { id: string; email: string } };

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
      console.error("accessToken expired, trying to refresh");

      const refresh = await this.refreshToken();

      if (!refresh) return router.navigate("/auth");

      user = await this.authenticate();
    }

    console.log(user);
    this.setUser(user);
  }

  async access() {
    try {
      const formData = new FormData();
      formData.append("accessToken", localStorage.getItem("accessToken")!);

      const response = await fetch(
        `${localStorage.getItem("app_server_adress")}/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );

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

    const response = await fetch(
      `${localStorage.getItem("app_server_adress")}/auth/refresh`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (response.ok) {
      const { accessToken, refreshToken } = await response.json();
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      return true;
    } else {
      console.error("Failed to refresh token");
      return false;
    }
  }

  async logout() {
    const formdata = new FormData();
    formdata.append("refreshToken", localStorage.getItem("refreshToken")!);

    const response = await fetch(
      `${localStorage.getItem("app_server_adress")}/auth/logout`,
      {
        method: "POST",
        body: formdata,
      },
    );

    if (!response.ok) {
      return console.error("Failed to logout");
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    this.setUser(null);
  }
}

export const authService = new AuthService();
