import { ipcMain, app, shell, clipboard } from "electron";
import { win } from "./main.js";
import fs from "fs";
import path from "path";
import os from "os";
import childProcess, { spawn } from "child_process";
import { promisify } from "util";
import extensionManager from "./services/extension.manager/index.js";
import Store from "electron-store";

const exec = promisify(childProcess.exec);
const execFile = promisify(childProcess.execFile);

let store = new Store();

async function getVideoMetadata(filePath: string) {
  const { stdout } = await exec(
    `ffprobe -v quiet -print_format json -show_format -show_streams -show_chapters "${filePath}"`,
  );
  const metadata = JSON.parse(stdout);
  return metadata;
}

function convertVideoCodec(
  filePath: string,
  codec: string,
  newFilePath: string,
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    let totalDuration = 0;

    const ffmpeg = spawn("ffmpeg", [
      "-i",
      filePath,
      "-acodec",
      codec,
      "-vcodec",
      "copy",
      "-stats_period",
      "0.5",
      newFilePath,
    ]);

    ffmpeg.stderr.setEncoding("utf8");

    ffmpeg.stderr.on("data", (data: string) => {
      // Parse total duration (appears once at start)
      const durationMatch = data.match(
        /Duration:\s*(\d{2}):(\d{2}):(\d{2})\.(\d{2})/,
      );
      if (durationMatch) {
        totalDuration =
          parseInt(durationMatch[1]) * 3600 +
          parseInt(durationMatch[2]) * 60 +
          parseInt(durationMatch[3]) +
          parseInt(durationMatch[4]) / 100;
      }

      // Parse current time progress (appears repeatedly)
      const timeMatch = data.match(/time=(\d{2}):(\d{2}):(\d{2})\.(\d{2})/);
      if (timeMatch) {
        const currentTime =
          parseInt(timeMatch[1]) * 3600 +
          parseInt(timeMatch[2]) * 60 +
          parseInt(timeMatch[3]) +
          parseInt(timeMatch[4]) / 100;

        const speedMatch = data.match(/speed=\s*([\d.]+)x/);
        const speed = speedMatch ? parseFloat(speedMatch[1]) : null;

        const percent =
          totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

        const eta =
          speed && speed > 0 && totalDuration > 0
            ? (totalDuration - currentTime) / speed
            : null;

        win.webContents.send("transcode-progress", {
          percent: Math.min(percent, 100),
          currentTime,
          totalDuration,
          speed,
          eta,
        });
      }
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        win.webContents.send("transcode-progress", {
          percent: 100,
          done: true,
        });
        resolve(true);
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on("error", reject);
  });
}

const cache = new Map<string, string>(); // "path:time" -> base64
const MAX_CACHE = 200;

function cacheKey(videoPath: string, time: number): string {
  // Round to nearest second — no need for sub-second precision
  return `${videoPath}:${Math.floor(time)}`;
}

async function getThumbnail(videoPath: string, time: number) {
  const key = cacheKey(videoPath, time);

  if (cache.has(key)) {
    return cache.get(key);
  }

  try {
    const tmpFile = path.join(os.tmpdir(), `thumb_${Date.now()}.jpg`);

    await execFile(
      "ffmpeg",
      [
        "-ss",
        String(Math.floor(time)),
        "-i",
        videoPath,
        "-vframes",
        "1",
        "-vf",
        "scale=480:-1",
        "-q:v",
        "5",
        "-y",
        tmpFile,
      ],
      {
        timeout: 5000,
      },
    );

    const buffer = await fs.promises.readFile(tmpFile);
    const base64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;

    // Cache it
    if (cache.size >= MAX_CACHE) {
      // Delete oldest entry
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey!);
    }
    cache.set(key, base64);

    // Clean up temp file (fire and forget)
    await fs.promises.unlink(tmpFile);

    return base64;
  } catch {
    return null;
  }
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

  ipcMain.handle(
    "convert-video-codec",
    async (event, filepath, codec, newfilepath) => {
      const conversion = await convertVideoCodec(filepath, codec, newfilepath);
      return conversion;
    },
  );

  ipcMain.handle("get-thumbnail", async (event, filePath, time) => {
    const thumbnail = await getThumbnail(filePath, time);
    return thumbnail;
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
