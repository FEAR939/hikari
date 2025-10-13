import { router } from "./lib/router/index";
import { authService } from "./services/auth";
import { Client } from "./lib/api";

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

  interface Window {
    electronAPI?: {
      enterFullscreen: () => void;
      exitFullscreen: () => void;
      getLocalMedia: () => Promise<any>;
      loadExtensions: () => Promise<any>;
      installExtension: (url: string) => Promise<any>;
      removeExtension: (name: string) => Promise<any>;
    };
  }
}

let apiBaseUrl =
  localStorage.getItem("app_server_adress") !== null &&
  localStorage.getItem("app_server_adress")?.length !== 0
    ? localStorage.getItem("app_server_adress")!
    : "https://hikari.animenetwork.org";

console.log(apiBaseUrl);

let api = new Client(apiBaseUrl);

export const API = api;

async function main() {
  const root = document.getElementById("root")!;
  document.root = root;

  document.body.appendChild(topBar());

  router.route("/", Home);
  router.route("/anime", Anime);
  router.route("/player", Player);
  router.route("/search", Search);
  router.route("/settings", Settings);
  router.route("/auth", Auth);

  await authService.authenticate();

  router.navigate("/");
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
