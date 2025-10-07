const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  enterFullscreen: () => ipcRenderer.send("enter-fullscreen"),
  exitFullscreen: () => ipcRenderer.send("exit-fullscreen"),
  getLocalMedia: (dirPath) => {
    const files = ipcRenderer.invoke("get-local-media", dirPath);
    return files;
  },
});
