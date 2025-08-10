import Home from "./pages/home/index";
import Anime from "./pages/anime/index";

const root = document.getElementById("root");
document.root = root;

class router {
  constructor() {
    this.routes = new Map();
  }

  route(path, handler) {
    this.routes.set(path, handler);
  }

  navigate(url) {
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

      root.innerHTML = "";
      handler(query);
    } else {
      console.error(`No route found for path: ${path}`);
    }
  }
}

const Router = new router();
document.router = Router;

Router.route("/", Home);
Router.route("/anime", Anime);

Router.navigate("/");
