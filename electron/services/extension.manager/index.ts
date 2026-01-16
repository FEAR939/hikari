import { app } from "electron";
import fs from "fs-extra";
import path from "path";
import JSZip, { JSZipObject } from "jszip";

class ExtensionManager {
  extensionsDir: string;
  metadataPath: string;

  constructor(extensionsDir: string) {
    this.extensionsDir = extensionsDir;
    this.metadataPath = path.join(extensionsDir, "metadata.json");
    fs.ensureDirSync(extensionsDir);
  }

  async downloadFromGitHub(repoUrl: string, branch = "main") {
    const zipUrl = `${repoUrl.replace(".git", "")}/archive/refs/heads/${branch}.zip`;
    const tempPath = path.join(this.extensionsDir, "temp.zip");

    const response = await fetch(zipUrl);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    await fs.writeFile(tempPath, Buffer.from(buffer));

    return tempPath;
  }

  async installExtension(zipPath: string) {
    // Read the zip file
    const zipData = await fs.readFile(zipPath);
    const zip = await JSZip.loadAsync(zipData);

    // Find manifest.json
    let manifestFile = null;
    let manifestPath = null;

    zip.forEach((relativePath, file) => {
      if (relativePath.endsWith("manifest.json")) {
        manifestFile = file;
        manifestPath = relativePath;
      }
    });

    if (!manifestFile) {
      throw new Error("No manifest.json found in extension");
    }

    // Read and parse manifest
    const manifestContent = await (manifestFile as JSZipObject).async("string");
    const manifest = JSON.parse(manifestContent);

    // Determine the root folder in the zip (GitHub adds a folder like "repo-name-branch/")
    const rootFolder = manifestPath!.split("/")[0];

    // Extract all files
    const extensionPath = path.join(this.extensionsDir, manifest.name);
    await fs.ensureDir(extensionPath);

    const filePromises: Promise<void>[] = [];

    zip.forEach((relativePath, file) => {
      // Skip if it's a directory
      if (file.dir) return;

      // Remove the root folder from the path
      const cleanPath = relativePath.replace(rootFolder + "/", "");
      if (!cleanPath) return;

      const filePath = path.join(extensionPath, cleanPath);

      filePromises.push(
        file.async("nodebuffer").then(async (content) => {
          await fs.ensureDir(path.dirname(filePath));
          await fs.writeFile(filePath, content);
        }),
      );
    });

    await Promise.all(filePromises);

    // Clean up temp file
    await fs.unlink(zipPath);

    return manifest;
  }

  async loadExtensions() {
    const extensions = [];
    const dirs = await fs.readdir(this.extensionsDir);

    for (const dir of dirs) {
      const manifestPath = path.join(this.extensionsDir, dir, "manifest.json");
      if (await fs.pathExists(manifestPath)) {
        const manifest = await fs.readJson(manifestPath);
        extensions.push({
          ...manifest,
          path: path.join(this.extensionsDir, dir),
        });
      }
    }

    return extensions;
  }

  async removeExtension(extensionName: string) {
    const extensionPath = path.join(this.extensionsDir, extensionName);
    await fs.remove(extensionPath);

    return true;
  }
}

const instance = new ExtensionManager(
  path.join(app.getPath("userData"), "extensions"),
);

export default instance;
