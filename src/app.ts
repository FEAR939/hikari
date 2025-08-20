import Home from "./pages/home/index";
import Anime from "./pages/anime/index";
import Player from "./pages/player/index";
import Search from "./pages/search/index";
import Settings from "./pages/settings/index";
import Auth from "./pages/auth/index";
import { topBar } from "./ui/topbar";

const root = document.getElementById("root");
document.root = root;

class router {
  routes: Map<string, () => void>;
  constructor() {
    this.routes = new Map();
  }

  route(path: string, handler: () => void) {
    this.routes.set(path, handler);
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

      if (path == "/player") return handler(query);

      root.innerHTML = "";
      handler(query);
    } else {
      console.error(`No route found for path: ${path}`);
    }
  }
}

document.body.appendChild(topBar());

const Router: Router = new router();
document.router = Router;

Router.route("/", Home);
Router.route("/anime", Anime);
Router.route("/player", Player);
Router.route("/search", Search);
Router.route("/settings", Settings);
Router.route("/auth", Auth);

if (localStorage.getItem("token") !== null) {
  const response = await fetch("http://localhost:5000/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (response.ok) {
    const user = await response.json();
    console.log(user);
  } else {
    console.error("Failed to fetch user data");
  }
}

Router.navigate("/");
