const { contextBridge, ipcRenderer, app } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  quit: () => {
    ipcRenderer.send("quit");
  },
  windowMinimize: () => {
    ipcRenderer.send("minimize");
  },
  windowMaximized: (state) => {
    ipcRenderer.send("window-maximized", state);
  },
  onmaximized: (callback) => {
    ipcRenderer.on("window-maximized", callback);
  },
  onunmaximized: (callback) => {
    ipcRenderer.on("window-unmaximized", callback);
  },
  onUpdateAvailable: (callback) =>
    ipcRenderer.on("update-available", () => callback()),
  restartAndUpdate: () => ipcRenderer.send("restart-and-update"),
  openDevTools: () => ipcRenderer.send("open-devtools"),
  enterFullscreen: () => ipcRenderer.send("enter-fullscreen"),
  exitFullscreen: () => ipcRenderer.send("exit-fullscreen"),
  getLocalMedia: (dirPath, titles) => {
    const files = ipcRenderer.invoke("get-local-media", dirPath, titles);
    return files;
  },
  getLocalMediaMetadata: async (filePath) => {
    const metadata = await ipcRenderer.invoke(
      "get-local-media-metadata",
      filePath,
    );
    return metadata;
  },
  getAppVersion: async () => {
    const version = await ipcRenderer.invoke("get-app-version");
    return version;
  },
  loadExtensions: async () => {
    const extensions = await ipcRenderer.invoke("load-extensions");
    return extensions;
  },
  installExtension: async (url) => {
    const extension = await ipcRenderer.invoke("install-extension", url);
    return extension;
  },
  removeExtension: async (name) => {
    const extension = await ipcRenderer.invoke("remove-extension", name);
    return extension;
  },
  createLocalMediaDir: async (path) => {
    ipcRenderer.invoke("create-local-media-dir", path);
    return true;
  },
  getDir: async (path) => {
    const dir = await ipcRenderer.invoke("get-dir", path);
    return dir;
  },
  getDirSize: async (path) => {
    const size = await ipcRenderer.invoke("get-dir-size", path);
    return size;
  },
});
