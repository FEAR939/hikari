import {
  app,
  BrowserWindow,
  ipcMain,
  session,
  protocol,
  net,
  shell,
} from "electron";
import electronUpdater from "electron-updater";
const { autoUpdater } = electronUpdater;
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import { handleIPC } from "./ipc.js";
import { handleWebRequests } from "./webrequest.js";
import { handleProtocol, handleProtocolUrl } from "./protocol.js";

protocol.registerSchemesAsPrivileged([
  {
    scheme: "hikari",
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      bypassCSP: true,
      stream: true,
      codeCache: true,
      corsEnabled: true,
    },
  },
]);

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

// Set your app as the default protocol client
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient("hikari", process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient("hikari");
}

const dirname = fileURLToPath(new URL(".", import.meta.url));

const isDev = process.argv.includes("--dev");
const BUILD_DIR = path.join(dirname, "../build");

let hasUpdate = false;

export let win: BrowserWindow;

function createWindow() {
  win = new BrowserWindow({
    width: 1600,
    height: 900,
    titleBarStyle: "hidden",
    autoHideMenuBar: true,
    fullscreenable: true,
    title: "Hikari",
    icon: path.join(dirname, "../static/icon.png"),
    backgroundColor: "#000",
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: true,
      preload: path.join(dirname, "preload.js"),
    },
  });

  !app.isPackaged ? win.webContents.openDevTools() : null;

  if (isDev) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadURL("hikari://hikari.app");
  }

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

  autoUpdater.on("update-available", (e) => {
    win.webContents.send("update-available", e.version);
    autoUpdater.downloadUpdate();
  });

  autoUpdater.on("update-downloaded", (e) => {
    win.webContents.send("update-downloaded", e.version);
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

  handleIPC();

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

  handleWebRequests();
}

app.on("open-url", (event, url) => {
  event.preventDefault();
  // Handle the URL
  console.log("Protocol URL:", url);
  // You can parse the URL and navigate in your app
  handleProtocolUrl(url);
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, focus our window instead
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }

    // The commandLine is an array of strings in which the last element is the deep link url
    const url = commandLine.find((arg) => arg.startsWith("hikari://"));
    if (url) {
      handleProtocolUrl(url);
    }
  });
}

app.once("ready", async () => {
  handleProtocol();

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
