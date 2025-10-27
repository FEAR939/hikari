import { router } from "./lib/router/index";
import { authService } from "./services/auth";
import { Client } from "./lib/api";

import Home from "./pages/home/index";
import Anime from "./pages/anime/index";
import Player from "./pages/player/index";
import Search from "./pages/search/index";
import Settings from "./pages/settings/index";
import Auth from "./pages/auth/index";
import News from "./pages/news/index";
import Schedule from "./pages/schedule";
import { TopBar } from "./ui/topbar";
import { Sidebar } from "./ui/sidebar";

declare global {
  interface Window {
    electronAPI?: {
      onUpdateAvailable: (callback: () => void) => void;
      restartAndUpdate: () => void;
      openDevTools: () => void;
      enterFullscreen: () => void;
      exitFullscreen: () => void;
      getLocalMedia: () => Promise<any>;
      getAppVersion: () => Promise<string>;
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

console.log("API Base URL: ", apiBaseUrl);

let api = new Client(apiBaseUrl);

export const API = api;

async function main() {
  const root = document.getElementById("root")!;

  const topbar = TopBar();
  root.appendChild(topbar);

  const sidebar = Sidebar();
  root.appendChild(sidebar);

  const content = document.createElement("div");
  content.className = "h-full w-full overflow-hidden";
  root.appendChild(content);

  router.container = content;

  router.route("/", Home);
  router.route("/anime", Anime);
  router.route("/player", Player);
  router.route("/search", Search);
  router.route("/settings", Settings);
  router.route("/auth", Auth);
  router.route("/news", News);
  router.route("/schedule", Schedule);

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
      "Proxy: window.ensureAndroidProxyReady is not defined. Network proxying may not work.",
    );

    main();
  }
}
