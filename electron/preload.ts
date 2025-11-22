import { contextBridge, ipcRenderer, app } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  quit: () => {
    ipcRenderer.send("quit");
  },
  windowMinimize: () => {
    ipcRenderer.send("minimize");
  },
  windowMaximized: (state: boolean) => {
    ipcRenderer.send("window-maximized", state);
  },
  onmaximized: (
    callback: (event: Electron.IpcRendererEvent, state: boolean) => void,
  ) => {
    ipcRenderer.on("window-maximized", callback);
  },
  onunmaximized: (
    callback: (event: Electron.IpcRendererEvent, state: boolean) => void,
  ) => {
    ipcRenderer.on("window-unmaximized", callback);
  },
  onUpdateAvailable: (callback: (version: string) => void) =>
    ipcRenderer.on("update-available", (event, version) => callback(version)),
  restartAndUpdate: () => ipcRenderer.send("restart-and-update"),
  openDevTools: () => ipcRenderer.send("open-devtools"),
  enterFullscreen: () => ipcRenderer.send("enter-fullscreen"),
  exitFullscreen: () => ipcRenderer.send("exit-fullscreen"),
  getLocalMedia: (dirPath: string, titles: string[]) => {
    const files = ipcRenderer.invoke("get-local-media", dirPath, titles);
    return files;
  },
  getLocalMediaMetadata: async (filePath: string) => {
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
  installExtension: async (url: string) => {
    const extension = await ipcRenderer.invoke("install-extension", url);
    return extension;
  },
  removeExtension: async (name: string) => {
    const extension = await ipcRenderer.invoke("remove-extension", name);
    return extension;
  },
  createLocalMediaDir: async (path: string) => {
    ipcRenderer.invoke("create-local-media-dir", path);
    return true;
  },
  getDir: async (path: string) => {
    const dir = await ipcRenderer.invoke("get-dir", path);
    return dir;
  },
  getDirSize: async (path: string) => {
    const size = await ipcRenderer.invoke("get-dir-size", path);
    return size;
  },
  openFolder: (path: string) => {
    ipcRenderer.send("open-dir", path);
    return true;
  },
});
