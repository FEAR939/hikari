import { app, BrowserWindow, ipcMain, session } from "electron";
import electronUpdater from "electron-updater";
const { autoUpdater } = electronUpdater;
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import extensionManager from "./services/extensionManager";
import * as ffprobe from "ffprobe-static";
import childProcess from "child_process";
import { promisify } from "util";
const exec = promisify(childProcess.exec);

async function getVideoMetadata(filePath: string) {
  const { stdout } = await exec(
    `"${ffprobe.path.replace("app.asar", "app.asar.unpacked")}" -v quiet -print_format json -show_format -show_streams "${filePath}"`,
  );
  const metadata = JSON.parse(stdout);
  return metadata;
}

const dirname = fileURLToPath(new URL(".", import.meta.url));

let hasUpdate = false;

let win: BrowserWindow;

console.log(path.join(dirname, "preload.ts"));

function createWindow() {
  win = new BrowserWindow({
    width: 1600,
    height: 900,
    titleBarStyle: "hidden",
    ...(process.platform !== "darwin"
      ? {
          titleBarOverlay: {
            color: "rgba(0, 0, 0, 0)",
            symbolColor: "#ffffff",
            height: 48,
          },
        }
      : {}),
    autoHideMenuBar: true,
    fullscreenable: true,
    title: "Hikari",
    icon: path.join(dirname, "../public/icons/icon.png"),
    backgroundColor: "#000000",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(dirname, "preload.js"),
    },
  });

  win.loadFile(path.join(dirname, "../dist/index.html"));

  ipcMain.on("window-controls-visible", (event, visible: boolean) => {
    if (win) {
      win.setWindowButtonVisibility(visible);
    }
  });

  ipcMain.on("open-devtools", () => {
    if (win) {
      win.webContents.openDevTools();
    }
  });

  ipcMain.on("restart-and-update", () => {
    if (win && hasUpdate) {
      autoUpdater.quitAndInstall(true, true);
    }
  });

  autoUpdater.on("update-available", () => {
    autoUpdater.downloadUpdate();
  });

  autoUpdater.on("update-downloaded", () => {
    win.webContents.send("update-available");
  });

  ipcMain.on("enter-fullscreen", () => {
    if (win) {
      win.setFullScreen(true);
    }
  });

  ipcMain.on("exit-fullscreen", () => {
    if (win) {
      win.setFullScreen(false);
    }
  });

  ipcMain.handle("get-local-media", async (event, dirPath) => {
    try {
      const exists = fs.existsSync(dirPath);
      if (!exists) {
        console.warn("Directory does not exist:", dirPath);
        return [];
      }

      const files = fs.readdirSync(dirPath);

      // Optional: Get full file info
      const fileInfo = [];
      for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stats = fs.statSync(fullPath);

        fileInfo.push({
          name: file,
          path: fullPath,
          isDirectory: stats.isDirectory(),
          size: stats.size,
          modified: stats.mtime,
        });
      }

      return fileInfo;
    } catch (error) {
      console.error("Error reading directory:", error);
      throw error;
    }
  });

  ipcMain.handle("get-local-media-metadata", async (event, filepath) => {
    const file_metadata = await getVideoMetadata(filepath);
    const video_metadata = file_metadata.streams.find(
      (stream: any) => stream.codec_type === "video",
    );
    const audio_metadata = file_metadata.streams.find(
      (stream: any) => stream.codec_type === "audio",
    );

    const metadata = {
      height: video_metadata.height,
      width: video_metadata.width,
      duration: video_metadata.duration,
      video_codec: video_metadata.codec_name,
      audio_codec: audio_metadata.codec_name,
      bitrate: video_metadata.bit_rate,
      bitdepth: video_metadata.bits_per_raw_sample,
    };

    return metadata;
  });

  ipcMain.handle("get-app-version", () => {
    return app.getVersion();
  });

  ipcMain.handle("load-extensions", async () => {
    const extensions = await extensionManager.loadExtensions();
    return extensions;
  });

  ipcMain.handle("install-extension", async (event, url) => {
    const extensionZIP = await extensionManager.downloadFromGitHub(url);
    const extension = await extensionManager.installExtension(extensionZIP);
    return extension;
  });

  ipcMain.handle("remove-extension", async (event, name) => {
    const extension = await extensionManager.removeExtension(name);
    return extension;
  });

  ipcMain.handle("create-local-media-dir", async (event, path) => {
    fs.mkdirSync(path);
  });

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    if (details.url.startsWith("https://graphql.anilist.co")) {
      details.requestHeaders.Referer = "https://anilist.co/";
      details.requestHeaders.Origin = "https://anilist.co";
      delete details.requestHeaders["User-Agent"];
    }
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  // anilist.... forgot to set the cache header on their preflights..... pathetic.... this just wastes rate limits, this fixes it!
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    if (
      details.url.startsWith("https://graphql.anilist.co") &&
      details.method === "OPTIONS"
    ) {
      if (details.responseHeaders) {
        if (
          !details.responseHeaders["access-control-allow-origin"] ||
          !details.responseHeaders["Access-Control-Allow-Origin"]
        )
          details.responseHeaders["access-control-allow-origin"] = ["*"];
        details.responseHeaders["Cache-Control"] = ["public, max-age=86400"];
        details.responseHeaders["access-control-max-age"] = ["86400"];
      }
    }

    callback(details);
  });
}

app.whenReady().then(async () => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  const updaterResult = await autoUpdater.checkForUpdates();
  if (updaterResult !== null && updaterResult.isUpdateAvailable && !hasUpdate) {
    hasUpdate = true;
  }
  setInterval(
    async () => {
      const updaterResult = await autoUpdater.checkForUpdates();
      if (
        updaterResult !== null &&
        updaterResult.isUpdateAvailable &&
        !hasUpdate
      ) {
        hasUpdate = true;
      }
    },
    1000 * 60 * 30,
  ).unref(); // 30 mins
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
