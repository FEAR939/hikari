import { h } from "@lib/jsx/runtime";
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
import Files from "./pages/files";
import { TopBar } from "./ui/topbar";
import { Sidebar } from "./ui/sidebar";
import WindowControls from "./ui/windowControls";
import { Toast } from "@ui/toast";

declare global {
  interface Window {
    electronAPI?: {
      quit: () => void;
      windowMinimize: () => void;
      windowMaximized: (state: boolean) => void;
      onmaximized: (callback: () => void) => void;
      onunmaximized: (callback: () => void) => void;
      onUpdateAvailable: (callback: () => void) => void;
      restartAndUpdate: () => void;
      openDevTools: () => void;
      enterFullscreen: () => void;
      exitFullscreen: () => void;
      getLocalMedia: () => Promise<any>;
      createLocalMediaDir: (path: string) => Promise<void>;
      getDir: (path: string) => Promise<string[]>;
      getDirSize: (path: string) => Promise<number>;
      openFolder: (path: string) => void;
      openUrl: (url: string) => void;
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

console.debug("API Base URL: ", apiBaseUrl);

let api = new Client(apiBaseUrl);

export const API = api;
export const windowControls = WindowControls();

async function main() {
  const root = document.getElementById("root")!;

  root.appendChild(windowControls);

  const topbar = TopBar();
  root.appendChild(topbar);

  const sidebar = Sidebar();
  root.appendChild(sidebar);

  const content = document.createElement("div");
  content.className = "h-full w-full overflow-hidden";
  root.appendChild(content);

  router.container = content;

  const toastContainer = document.createElement("div");
  toastContainer.className = "fixed bottom-2 right-2 z-50 w-full max-w-md";
  root.appendChild(toastContainer);

  router.route("/", Home);
  router.route("/anime", Anime);
  router.route("/player", Player);
  router.route("/search", Search);
  router.route("/settings", Settings);
  router.route("/auth", Auth);
  router.route("/news", News);
  router.route("/schedule", Schedule);
  router.route("/files", Files);

  await authService.authenticate();

  router.navigate("/");

  let hasUpdate = false;

  // Listen for update availability
  window.electronAPI?.onUpdateAvailable((version: string) => {
    hasUpdate = true;

    const updateToast = (
      <Toast className="bg-[#020c1d] text-[#577fcc] border-[#020e2e]">
        <div>A new version(v{version || "N/A"}) is now available.</div>
        <div
          class="underline cursor-pointer"
          onClick={() => window.electronAPI?.restartAndUpdate()}
        >
          Update for the latest features and improvements.
        </div>
      </Toast>
    );

    toastContainer.appendChild(updateToast);
  });
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
