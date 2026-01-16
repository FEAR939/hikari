import { protocol, session, net } from "electron";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { lookup } from "mime-types";
import { Readable } from "stream";
import { win } from "./main.js";

const dirname = fileURLToPath(new URL(".", import.meta.url));

const isDev = process.argv.includes("--dev");
const BUILD_DIR = path.join(dirname, "../build");

function getFilePath(pathname: string) {
  // Remove leading slash and decode URI components
  const decodedPath = decodeURIComponent(pathname.slice(1));
  let filePath = path.join(BUILD_DIR, decodedPath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(BUILD_DIR)) {
    return null;
  }

  // Check if file exists
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return filePath;
  }

  // Try adding .html extension
  if (fs.existsSync(filePath + ".html")) {
    return filePath + ".html";
  }

  // Try index.html in directory
  const indexPath = path.join(filePath, "index.html");
  if (fs.existsSync(indexPath)) {
    return indexPath;
  }

  // SPA fallback
  return path.join(BUILD_DIR, "index.html");
}

export function handleProtocol() {
  protocol.handle("hikari", async (request) => {
    const url = new URL(request.url);
    const filePath = getFilePath(url.pathname);
    if (!filePath) {
      return new Response("Not Found", { status: 404 });
    }
    return net.fetch(pathToFileURL(filePath).toString());
  });

  session.defaultSession.protocol.handle("mediaproxy", async (request) => {
    try {
      const requestUrl = new URL(request.url);
      const mediaUrl = requestUrl.searchParams.get("url");
      const headersParam = requestUrl.searchParams.get("headers");
      if (!mediaUrl) {
        return new Response("Bad Request: No URL provided", { status: 400 });
      }

      // Check if it's a local file path
      const isLocalFile =
        mediaUrl.startsWith("file://") ||
        mediaUrl.startsWith("/") ||
        /^[a-zA-Z]:[\\/]/.test(mediaUrl); // Windows absolute path

      if (isLocalFile) {
        // Handle local file
        let filePath = mediaUrl;

        // Convert file:// URL to path
        if (mediaUrl.startsWith("file://")) {
          filePath = decodeURIComponent(new URL(mediaUrl).pathname);
          // On Windows, remove leading slash from /C:/path
          if (process.platform === "win32" && filePath.startsWith("/")) {
            filePath = filePath.slice(1);
          }
        }

        // Get file stats
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;

        // Determine content type
        const mimeType = lookup(filePath) || "application/octet-stream";

        // Get range header
        const range = request.headers.get("range");

        const responseHeaders = new Headers();
        responseHeaders.set("Content-Type", mimeType);
        responseHeaders.set("Accept-Ranges", "bytes");
        responseHeaders.set("Last-Modified", stat.mtime.toUTCString());

        if (range) {
          // Parse range header
          const match = range.match(/bytes=(\d*)-(\d*)/);
          if (match) {
            const start = match[1] ? parseInt(match[1], 10) : 0;
            const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;

            if (start >= fileSize || end >= fileSize || start > end) {
              responseHeaders.set("Content-Range", `bytes */${fileSize}`);
              return new Response("Range Not Satisfiable", {
                status: 416,
                headers: responseHeaders,
              });
            }

            const chunkSize = end - start + 1;
            responseHeaders.set("Content-Length", String(chunkSize));
            responseHeaders.set(
              "Content-Range",
              `bytes ${start}-${end}/${fileSize}`,
            );

            const fileStream = fs.createReadStream(filePath, { start, end });
            const webStream = Readable.toWeb(fileStream) as ReadableStream;

            return new Response(webStream, {
              status: 206,
              headers: responseHeaders,
            });
          }
        }

        // No range requested, return full file
        responseHeaders.set("Content-Length", String(fileSize));
        const fileStream = fs.createReadStream(filePath);
        const webStream = Readable.toWeb(fileStream) as ReadableStream;

        return new Response(webStream, {
          status: 200,
          headers: responseHeaders,
        });
      }

      // Handle remote URL (existing logic)
      // Decode custom headers
      let customHeaders: Record<string, string> = {};
      if (headersParam) {
        try {
          const headersJson = Buffer.from(headersParam, "base64").toString(
            "utf-8",
          );
          customHeaders = JSON.parse(headersJson);
        } catch (e) {
          console.error("Failed to decode headers:", e);
        }
      }
      // Get range header
      const range = request.headers.get("range");
      // Prepare headers for the actual request
      const fetchHeaders = new Headers(customHeaders);
      if (range) {
        fetchHeaders.set("Range", range);
      }
      // Use Electron's net module which properly handles redirects and streams
      const response = await net.fetch(mediaUrl, {
        headers: fetchHeaders,
        method: "GET",
      });
      // Create new headers for the response
      const responseHeaders = new Headers();
      responseHeaders.set(
        "Content-Type",
        response.headers.get("content-type") || "video/mp4",
      );
      responseHeaders.set("Accept-Ranges", "bytes");
      if (response.headers.get("content-length")) {
        responseHeaders.set(
          "Content-Length",
          response.headers.get("content-length")!,
        );
      }
      if (response.headers.get("content-range")) {
        responseHeaders.set(
          "Content-Range",
          response.headers.get("content-range")!,
        );
      }
      if (response.headers.get("etag")) {
        responseHeaders.set("ETag", response.headers.get("etag")!);
      }
      if (response.headers.get("last-modified")) {
        responseHeaders.set(
          "Last-Modified",
          response.headers.get("last-modified")!,
        );
      }
      if (response.headers.get("cache-control")) {
        responseHeaders.set(
          "Cache-Control",
          response.headers.get("cache-control")!,
        );
      }
      // Return the response with the body stream
      return new Response(response.body, {
        status: response.status,
        headers: responseHeaders,
      });
    } catch (error) {
      console.error("Protocol handler error:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return new Response("Internal Server Error: " + errorMessage, {
        status: 500,
      });
    }
  });
}

export function handleProtocolUrl(url: string) {
  // Parse the URL and navigate accordingly
  // Example: hikari://hikari.app/page/something
  const urlPath = url.replace("hikari://hikari.app/", "");

  if (win) {
    // Send to renderer process or handle navigation
    win.webContents.send("navigate-to", urlPath);
  }
}
