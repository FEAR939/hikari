import { app, BrowserWindow, ipcMain, session, protocol, net } from "electron";
import electronUpdater from "electron-updater";
const { autoUpdater } = electronUpdater;
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import extensionManager from "./services/extension.manager/index.js";
import * as ffprobe from "ffprobe-static";
import childProcess from "child_process";
import { promisify } from "util";

protocol.registerSchemesAsPrivileged([
  {
    scheme: "mediaproxy",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true, // This is crucial for video seeking!
      corsEnabled: true,
    },
  },
]);

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

function createWindow() {
  win = new BrowserWindow({
    width: 1600,
    height: 900,
    titleBarStyle: "hidden",
    autoHideMenuBar: true,
    fullscreenable: true,
    title: "Hikari",
    icon: path.join(dirname, "../public/icons/icon.png"),
    backgroundColor: "#000000",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: true,
      preload: path.join(dirname, "preload.js"),
    },
  });

  !app.isPackaged ? win.webContents.openDevTools() : null;
  console.log(path.join(dirname, "preload.js"));

  !app.isPackaged
    ? win.loadURL("http://localhost:5173")
    : win.loadFile(path.join(dirname, "../dist/index.html"));

  ipcMain.on("minimize", () => {
    win.minimize();
  });

  ipcMain.on("quit", () => {
    app.quit();
  });

  ipcMain.on("window-maximized", (event, state) => {
    state ? win.maximize() : win.unmaximize();
  });

  win.on("maximize", () => {
    win.webContents.send("window-maximized");
  });

  win.on("unmaximize", () => {
    win.webContents.send("window-unmaximized");
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

  ipcMain.handle(
    "get-local-media",
    async (event, dirPath: string, titles: string[]) => {
      try {
        const baseDirExists = fs.existsSync(dirPath);
        if (!baseDirExists) {
          console.warn("Directory does not exist:", dirPath);
          return [];
        }

        const existsDirs = titles.map((title: string) =>
          fs.existsSync(path.join(dirPath, title)),
        );

        const existsIndex = existsDirs.findIndex((exists) => exists);

        if (existsIndex === -1) {
          console.warn("No existing directory found");
          return [];
        }

        const selectedTitle = titles[existsIndex];
        if (!selectedTitle) {
          console.warn("Selected title is undefined");
          return [];
        }

        const finalPath = path.join(dirPath, selectedTitle);

        const files = fs.readdirSync(finalPath);

        // Optional: Get full file info
        const fileInfo = [];
        for (const file of files) {
          const fullPath = path.join(finalPath, file);
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
    },
  );

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

  ipcMain.handle("get-dir", async (event, path) => {
    const dir = await fs.promises.readdir(path);
    return dir;
  });

  ipcMain.handle("get-dir-size", async (event, dirPath) => {
    const dirSize = async (dir: string): Promise<number> => {
      const files = await fs.promises.readdir(dir, { withFileTypes: true });

      const paths = files.map(async (file) => {
        const filepath = path.join(dir, file.name);

        if (file.isDirectory()) return await dirSize(filepath);

        if (file.isFile()) {
          const { size } = await fs.promises.stat(filepath);

          return size;
        }

        return 0;
      });

      return (await Promise.all(paths))
        .flat(Infinity)
        .reduce((i, size) => i + size, 0);
    };

    const size = await dirSize(dirPath);
    return size;
  });

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    const url = new URL(details.url);

    if (details.url.startsWith("https://graphql.anilist.co")) {
      details.requestHeaders.Referer = "https://anilist.co/";
      details.requestHeaders.Origin = "https://anilist.co";
      delete details.requestHeaders["User-Agent"];
    } else if (
      !details.requestHeaders["Referer"] ||
      details.url.startsWith("https://hikari.app")
    ) {
      details.requestHeaders.Referer = "https://hikari.app/";
      details.requestHeaders.Origin = "https://hikari.app";
    }

    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  win.webContents.on("frame-created", (_, { frame }) => {
    frame?.once("dom-ready", () => {
      if (frame.url.startsWith("https://www.youtube-nocookie.com")) {
        frame.executeJavaScript(/* js */ `
              new MutationObserver(() => {
                if (document.querySelector('div.ytp-error-content-wrap-subreason a[href*="www.youtube"]')) location.reload()
              }).observe(document.body, { childList: true, subtree: true })
            `);
      }
    });
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

app.once("ready", async () => {
  session.defaultSession.protocol.handle("mediaproxy", async (request) => {
    try {
      const requestUrl = new URL(request.url);
      const mediaUrl = requestUrl.searchParams.get("url");
      const headersParam = requestUrl.searchParams.get("headers");

      if (!mediaUrl) {
        return new Response("Bad Request: No URL provided", { status: 400 });
      }

      // Decode custom headers
      let customHeaders = {};
      if (headersParam) {
        try {
          const headersJson = Buffer.from(headersParam, "base64").toString(
            "utf-8",
          );
          customHeaders = JSON.parse(JSON.parse(headersJson)); // Stupid? yes... but works...
        } catch (e) {
          console.error("Failed to decode headers:", e);
        }
      }

      // Get range header
      const range = request.headers.get("range");

      // Prepare headers for the actual request
      const fetchHeaders = new Headers(customHeaders);
      if (range) {
        fetchHeaders.set("Range", range);
      }

      // Use Electron's net module which properly handles redirects and streams
      const response = await net.fetch(mediaUrl, {
        headers: fetchHeaders,
        method: "GET",
      });

      // Create new headers for the response
      const responseHeaders = new Headers();
      responseHeaders.set(
        "Content-Type",
        response.headers.get("content-type") || "video/mp4",
      );
      responseHeaders.set("Accept-Ranges", "bytes");

      if (response.headers.get("content-length")) {
        responseHeaders.set(
          "Content-Length",
          response.headers.get("content-length")!,
        );
      }
      if (response.headers.get("content-range")) {
        responseHeaders.set(
          "Content-Range",
          response.headers.get("content-range")!,
        );
      }
      if (response.headers.get("etag")) {
        responseHeaders.set("ETag", response.headers.get("etag")!);
      }
      if (response.headers.get("last-modified")) {
        responseHeaders.set(
          "Last-Modified",
          response.headers.get("last-modified")!,
        );
      }
      if (response.headers.get("cache-control")) {
        responseHeaders.set(
          "Cache-Control",
          response.headers.get("cache-control")!,
        );
      }

      // Return the response with the body stream
      return new Response(response.body, {
        status: response.status,
        headers: responseHeaders,
      });
    } catch (error) {
      console.error("Protocol handler error:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return new Response("Internal Server Error: " + errorMessage, {
        status: 500,
      });
    }
  });

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
