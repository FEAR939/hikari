import { session } from "electron";

function UpsertKeyValue(
  obj: Record<string, string | string[]>,
  keyToChange: string,
  value: any,
) {
  const keyToChangeLower = keyToChange.toLowerCase();
  for (const key of Object.keys(obj)) {
    if (key.toLowerCase() === keyToChangeLower) {
      // Reassign old key
      obj[key] = value;
      // Done
      return;
    }
  }
  // Insert at end instead
  obj[keyToChange] = value;
}

export function handleWebRequests() {
  const requestOrigins = new Map();

  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    const { requestHeaders } = details;

    if (details.requestHeaders["Origin"] || details.requestHeaders["origin"]) {
      const origin =
        details.requestHeaders["Origin"] || details.requestHeaders["origin"];
      requestOrigins.set(details.id, origin);
    }

    if (
      !requestHeaders["Referer"] ||
      details.url.startsWith("hikari://hikari.app")
    ) {
      UpsertKeyValue(requestHeaders, "Referer", "hikari://hikari.app/");
      UpsertKeyValue(requestHeaders, "Origin", "hikari://hikari.app");
    }

    // UpsertKeyValue(requestHeaders, "Access-Control-Allow-Origin", ["*"]);
    callback({ requestHeaders });
  });

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    const { responseHeaders } = details;

    const origin = requestOrigins.get(details.id) || "*";

    UpsertKeyValue(responseHeaders!, "Access-Control-Allow-Origin", [origin]);
    UpsertKeyValue(responseHeaders!, "Access-Control-Allow-Headers", [
      "content-type",
      "authorization",
      "x-goog-api-key", // for youtube-nocookie.com
    ]);
    UpsertKeyValue(responseHeaders!, "Access-Control-Allow-Credentials", [
      "true",
    ]);

    // Clean up
    requestOrigins.delete(details.id);

    callback({
      responseHeaders,
    });
  });
}

// session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
//   const url = new URL(details.url);

//   if (details.url.startsWith("https://graphql.anilist.co")) {
//     details.requestHeaders.Referer = "https://anilist.co/";
//     details.requestHeaders.Origin = "https://anilist.co";
//     delete details.requestHeaders["User-Agent"];
//   } else if (
//     !details.requestHeaders["Referer"] ||
//     details.url.startsWith("hikari://hikari.app")
//   ) {
//     details.requestHeaders.Referer = "hikari://hikari.app/";
//     details.requestHeaders.Origin = "hikari://hikari.app";
//   }

//   callback({ cancel: false, requestHeaders: details.requestHeaders });
// });

// anilist.... forgot to set the cache header on their preflights..... pathetic.... this just wastes rate limits, this fixes it!
// session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
//   if (
//     details.url.startsWith("https://graphql.anilist.co") &&
//     details.method === "OPTIONS"
//   ) {
//     if (details.responseHeaders) {
//       if (
//         !details.responseHeaders["access-control-allow-origin"] ||
//         !details.responseHeaders["Access-Control-Allow-Origin"]
//       )
//         details.responseHeaders["access-control-allow-origin"] = ["*"];
//       details.responseHeaders["Cache-Control"] = ["public, max-age=86400"];
//       details.responseHeaders["access-control-max-age"] = ["86400"];
//     }
//   }

//   callback(details);
// });
