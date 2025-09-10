import { router } from "./lib/router/index";
import { authService } from "./services/auth";

import Home from "./pages/home/index";
import Anime from "./pages/anime/index";
import Player from "./pages/player/index";
import Search from "./pages/search/index";
import Settings from "./pages/settings/index";
import Auth from "./pages/auth/index";
import { topBar } from "./ui/topbar";

declare global {
  interface Document {
    root: HTMLElement;
  }
}

function main() {
  const root = document.getElementById("root")!;
  document.root = root;

  document.body.appendChild(topBar());

  if (localStorage.getItem("app_server_adress") === null) {
    localStorage.setItem("app_server_adress", "http://localhost:5000");
  }

  router.route("/", Home);
  router.route("/anime", Anime);
  router.route("/player", Player);
  router.route("/search", Search);
  router.route("/settings", Settings);
  router.route("/auth", Auth);

  router.navigate("/");

  authService.authenticate();
}

window.addEventListener("DOMContentLoaded", () => {
  initProxy();
});

function initProxy() {
  if (typeof window.ensureAndroidProxyReady === "function") {
    window.ensureAndroidProxyReady().then(() => {
      main();
    });
  } else {
    console.warn(
      "initializeApp: window.ensureAndroidProxyReady is not defined. Network proxying may not work.",
    );

    console.log(
      "initializeApp: Proceeding without proxy. If you are on android expect CORS issues for external fetches, otherwise you are likely on desktop so just ignore this.",
    );

    main();
  }
}
