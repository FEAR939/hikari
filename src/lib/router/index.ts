class Router {
  routes: Map<string, (([]: any) => any) | Promise<any>>;
  constructor() {
    this.routes = new Map();
  }

  route(path: string, handler: ([]: any) => any | Promise<any>) {
    this.routes.set(path, handler);
  }

  removeRoute(path: string) {
    this.routes.delete(path);
  }

  navigate(url: string) {
    const urlObj = new URL(url, window.location.origin);
    const path = urlObj.pathname;
    const searchParams = urlObj.searchParams;

    const handler = this.routes.get(path);
    if (handler) {
      const query = {};
      for (const [key, value] of searchParams.entries()) {
        // Handle multiple values for the same key
        if (query[key]) {
          // Convert to array if multiple values exist
          if (Array.isArray(query[key])) {
            query[key].push(value);
          } else {
            query[key] = [query[key], value];
          }
        } else {
          query[key] = value;
        }
      }

      if (
        path == "/player" ||
        path == "/anime/updateEpisodeProgress" ||
        path == "/anime/episodes/sourcePanel"
      ) {
        return handler(query);
      }

      root.innerHTML = "";
      handler(query);
    } else {
      console.error(`No route found for path: ${path}`);
    }
  }
}

export const router = new Router();
