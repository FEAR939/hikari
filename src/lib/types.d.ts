export interface LocalMediaFile {
  name: string;
  path: string;
  size: number;
}

export interface LocalMediaMetadata {
  duration?: number;
  width?: number;
  height?: number;
}

export interface Extension {
  id: string;
  name: string;
  version: string;
  type: string;
  github: string;
  path: string;
  icon: string;
  main: string;
}

export interface MediaHoster {
  label: string;
}

export interface MediaSource {
  type: "local" | "external";
  from: "This Device" | string;
  icon: "/icon.png" | string;
  file_name: string;
  file_url: string;
  file_size: string;
  file_quality: string;
  headers?: Record<string, string>;
}

export interface DirEntry {
  name: string;
  path: string;
  isDirectory: boolean;
}

export interface AppSettings {
  [key: string]: any;
}

export interface ElectronAPI {
  quit: () => void;
  windowMinimize: () => void;
  windowMaximized: (state: boolean) => void;
  onmaximized: (
    callback: (event: Electron.IpcRendererEvent, state: boolean) => void,
  ) => void;
  onunmaximized: (
    callback: (event: Electron.IpcRendererEvent, state: boolean) => void,
  ) => void;
  onUpdateAvailable: (callback: (version: string) => void) => void;
  onUpdateDownloaded: (callback: (version: string) => void) => void;
  openDevTools: () => void;
  enterFullscreen: () => void;
  exitFullscreen: () => void;
  getLocalMedia: (
    dirPath: string,
    titles: string[],
  ) => Promise<LocalMediaFile[]>;
  getLocalMediaMetadata: (filePath: string) => Promise<LocalMediaMetadata>;
  getAppVersion: () => Promise<string>;
  loadExtensions: () => Promise<Extension[]>;
  installExtension: (url: string) => Promise<Extension>;
  removeExtension: (name: string) => Promise<boolean>;
  createLocalMediaDir: (path: string) => Promise<boolean>;
  getDir: (path: string) => Promise<DirEntry[]>;
  getDirSize: (path: string) => Promise<number>;
  openFolder: (path: string) => boolean;
  openUrl: (url: string) => boolean;
  readFile: (filePath: string) => Promise<string | null>;
  readFileBinary: (filePath: string) => Promise<Uint8Array | null>;
  navigate: (callback: (path: string) => void) => void;
  clipboardWriteText: (text: string) => void;
}

export interface ElectronStore {
  get: <T = any>(key: string) => Promise<T>;
  set: <T = any>(key: string, value: T) => Promise<void>;
  getAll: () => Promise<AppSettings>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    electronStore: ElectronStore;
  }
}

export {};
