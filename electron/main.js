import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "url";
import path from "path";

const dirname = fileURLToPath(new URL(".", import.meta.url));

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    autoHideMenuBar: true,
    fullscreenable: true,
    title: "Hikari",
    backgroundColor: "#000000",
    webPreferences: {
      preload: path.join(dirname, "preload.js"),
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
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
