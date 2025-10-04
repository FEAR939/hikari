import { app, BrowserWindow, ipcMain } from "electron";
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
