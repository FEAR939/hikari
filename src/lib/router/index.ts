class Router {
  routes: Map<string, (([]: any) => any) | Promise<any>>;
  subscribers: Array<(path: string) => void>;
  container: HTMLElement | undefined;
  previousPath: string | undefined;

  constructor() {
    this.routes = new Map();
    this.subscribers = [];
    this.container = undefined;
    this.previousPath = undefined;
  }

  route(path: string, handler: ([]: any) => any | Promise<any>) {
    this.routes.set(path, handler);
  }

  removeRoute(path: string) {
    this.routes.delete(path);
  }

  subscribe(callback: (path: string) => void) {
    this.subscribers.push(callback);
  }

  restorePreviousState() {
    console.debug(this.previousPath);
    this.subscribers.forEach((subscriber) =>
      subscriber(this.previousPath || ""),
    );
  }

  navigate(url: string, options?: { intoContainer?: boolean }) {
    if (!this.container) {
      throw new Error("Router container is not initialized");
    }

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

      this.subscribers.forEach((subscriber) => subscriber(path));

      if (
        path == "/player" ||
        path == "/anime/updateEpisodeProgress" ||
        path == "/anime/episodes/sourcePanel"
      ) {
        return handler(query);
      }
      if (
        options !== undefined &&
        options.intoContainer !== undefined &&
        !options.intoContainer
      ) {
        return handler(query);
      }

      this.container.innerHTML = "";
      this.previousPath = path;
      handler(query);
    } else {
      console.error(`No route found for path: ${path}`);
    }
  }
}

export const router = new Router();
