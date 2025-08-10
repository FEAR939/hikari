const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  enterFullscreen: () => ipcRenderer.send("enter-fullscreen"),
  exitFullscreen: () => ipcRenderer.send("exit-fullscreen"),
});
