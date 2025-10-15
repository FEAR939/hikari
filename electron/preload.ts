const { contextBridge, ipcRenderer, app } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  enterFullscreen: () => ipcRenderer.send("enter-fullscreen"),
  exitFullscreen: () => ipcRenderer.send("exit-fullscreen"),
  getLocalMedia: (dirPath) => {
    const files = ipcRenderer.invoke("get-local-media", dirPath);
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
});
