import { ipcMain, app, shell, clipboard } from "electron";
import fs from "fs";
import path from "path";
// @ts-ignore
import * as ffprobe from "ffprobe-static";
import childProcess from "child_process";
import { promisify } from "util";
import extensionManager from "./services/extension.manager/index.js";
import Store from "electron-store";

const exec = promisify(childProcess.exec);

let store = new Store();

async function getVideoMetadata(filePath: string) {
  const { stdout } = await exec(
    `"${ffprobe.path.replace("app.asar", "app.asar.unpacked")}" -v quiet -print_format json -show_format -show_streams -show_chapters "${filePath}"`,
  );
  const metadata = JSON.parse(stdout);
  return metadata;
}

export function handleIPC() {
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
      chapters: file_metadata.chapters.map((chapter: any) => ({
        title: chapter.tags.title,
        start_time: chapter.start_time,
        end_time: chapter.end_time,
      })),
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

  ipcMain.on("open-dir", (event, dirPath) => {
    shell.openPath(dirPath);
  });

  ipcMain.on("open-url", (event, url) => {
    shell.openExternal(url);
  });

  ipcMain.handle("read-file", async (event, filePath) => {
    try {
      const content = await fs.promises.readFile(filePath, "utf8");
      return content;
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return null;
    }
  });

  ipcMain.handle("read-file-binary", async (event, filePath) => {
    try {
      const content = await fs.promises.readFile(filePath);
      return content;
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return null;
    }
  });

  ipcMain.handle("store:get", (_, key) => {
    return store.get(key);
  });

  ipcMain.handle("store:set", (_, key, value) => {
    store.set(key, value);
  });

  ipcMain.handle("store:getAll", () => {
    return store.store;
  });

  ipcMain.on("clipboard-write-text", (event, text) => {
    clipboard.writeText(text);
  });
}
