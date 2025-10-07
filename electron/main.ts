import { app, BrowserWindow, ipcMain, session } from "electron";
import electronUpdater from "electron-updater";
const { autoUpdater } = electronUpdater;
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const dirname = fileURLToPath(new URL(".", import.meta.url));

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    autoHideMenuBar: true,
    fullscreenable: true,
    title: "Hikari",
    icon: path.join(dirname, "../public/icons/icon.png"),
    backgroundColor: "#000000",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(dirname, "preload.ts"),
    },
  });

  win.loadFile(path.join(dirname, "../dist/index.html"));

  win.webContents.openDevTools();

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

  ipcMain.handle("get-local-media", (event, dirPath) => {
    try {
      const files = fs.readdirSync(dirPath);

      // Optional: Get full file info
      const fileInfo = files.map((file) => {
        const fullPath = path.join(dirPath, file);
        const stats = fs.statSync(fullPath);

        return {
          name: file,
          path: fullPath,
          isDirectory: stats.isDirectory(),
          size: stats.size,
          modified: stats.mtime,
        };
      });

      return fileInfo;
    } catch (error) {
      console.error("Error reading directory:", error);
      throw error;
    }
  });

  ipcMain.handle("get-app-version", () => {
    return app.getVersion();
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

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  autoUpdater.checkForUpdatesAndNotify();
  setInterval(
    () => {
      autoUpdater.checkForUpdatesAndNotify();
    },
    1000 * 60 * 30,
  ).unref(); // 30 mins
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
