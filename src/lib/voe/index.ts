export async function getMetadata(video_redirect: string) {
  function rot13(str: string) {
    return str.replace(/[a-zA-Z]/g, function (char) {
      const charCode = char.charCodeAt(0);
      // Check if it's an uppercase letter
      if (charCode >= 65 && charCode <= 90) {
        return String.fromCharCode(((charCode - 65 + 13) % 26) + 65);
      }
      // Check if it's a lowercase letter
      else if (charCode >= 97 && charCode <= 122) {
        return String.fromCharCode(((charCode - 97 + 13) % 26) + 97);
      }
      // Return unchanged if not a letter
      return char;
    });
  }

  function base64ToUtf8(base64Str: string) {
    try {
      // Decode Base64 to a binary string
      const binaryString = atob(base64Str);
      // Convert the binary string to a Uint8Array
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      // Use TextDecoder to decode the bytes as UTF-8
      const decoder = new TextDecoder("utf-8");
      return decoder.decode(bytes);
    } catch (e) {
      // Catch potential errors from atob (e.g., invalid characters)
      console.error("Base64 decoding error:", e);
      throw new Error(
        `Invalid Base64 string starting with: ${base64Str.substring(0, 10)}...`,
      );
    }
  }

  function shiftBack(str: string, shift: number) {
    let result = "";
    for (let i = 0; i < str.length; i++) {
      result += String.fromCharCode(str.charCodeAt(i) - shift);
    }
    return result;
  }

  let html = new DOMParser().parseFromString(
    await (await fetch(video_redirect)).text(),
    "text/html",
  );

  const redirectScript = Array.from(html.querySelectorAll("script")).find(
    (script) => script.text.includes("window.location.href"),
  );
  let redirectSource = redirectScript?.textContent;

  const indexStart = redirectSource?.indexOf("window.location.href = '");
  const indexEnd = redirectSource?.indexOf(";", indexStart);

  if (!indexStart || !indexEnd) throw new Error();
  redirectSource = redirectSource?.substring(indexStart + 24, indexEnd - 1);

  if (!redirectSource) throw new Error();

  const redirecthtml = new DOMParser().parseFromString(
    await (await fetch(redirectSource)).text(),
    "text/html",
  );

  const file_name = redirecthtml
    .querySelector(
      "html body div.container.mt-3.mb-5 div.paper.mt-5 div.row.gx-0.small div.col-8.px-3.py-2",
    )
    ?.textContent?.trim();
  const file_quality = redirecthtml
    .querySelector(
      "html body div.container.mt-3.mb-5 div.paper.mt-5 div.row.gx-0.small.bg-athens-gray div.col-8.px-3.py-2 div.mt-2 b",
    )
    ?.textContent?.trim();
  const file_size = redirecthtml
    .querySelector(
      "html body div.container.mt-3.mb-5 div.paper.mt-5 div.row.gx-0.small.bg-athens-gray div.col-8.px-3.py-2 div.mt-2",
    )
    ?.textContent?.trim()
    .match(/(\d+(?:\.\d+)?\s*[KMGT]?B)$/)?.[0];

  const htmlString = redirecthtml.querySelector(
    "script[type='application/json']",
  )?.innerHTML;

  if (!htmlString) throw new Error();

  const jsonString = JSON.parse(htmlString)[0];

  let sourceJson = null;

  try {
    const encryptedData = rot13(jsonString);

    // Use the specific sanitizeInput implementation
    const cleanedInput = encryptedData
      .replaceAll("@$", "")
      .replaceAll("^^", "")
      .replaceAll("~@", "")
      .replaceAll("%?", "")
      .replaceAll("*~", "")
      .replaceAll("!!", "")
      .replaceAll("#&", "");

    // First Base64 decode (assuming result might be UTF-8)
    const decodedFromBase64 = base64ToUtf8(cleanedInput);

    const shiftedBack = shiftBack(decodedFromBase64, 3);
    const reversedString = shiftedBack.split("").reverse().join("");

    // Second Base64 decode (final result likely UTF-8 JSON or text)
    const decoded = base64ToUtf8(reversedString);

    try {
      const parsedJson = JSON.parse(decoded);

      if ("direct_access_url" in parsedJson) {
        sourceJson = {
          mp4: parsedJson["direct_access_url"],
          name: file_name,
          quality: file_quality,
          size: file_size,
        };
        console.log("[+] Found direct .mp4 URL in JSON.");
      } else if ("source" in parsedJson) {
        sourceJson = {
          hls: parsedJson["source"],
          name: file_name,
          quality: file_quality,
          size: file_size,
        };
        console.log("[+] Found fallback .m3u8 URL in JSON.");
      } else {
        console.log(
          "[-] JSON found, but required keys ('direct_access_url' or 'source') are missing.",
        );
      }
    } catch (jsonError) {
      // Catch JSON parsing errors (SyntaxError)
      console.log(
        "[-] Decoded string is not valid JSON. Attempting fallback regex search...",
      );
      // console.log("Decoded string:", decoded); // Optional: Log for debugging

      // Regex searches on the decoded string
      const mp4Regex = /https?:\/\/[^\s"]+\.mp4[^\s"]*/;
      const m3u8Regex = /https?:\/\/[^\s"]+\.m3u8[^\s"]*/;

      const mp4Match = decoded.match(mp4Regex);
      const m3u8Match = decoded.match(m3u8Regex);

      if (mp4Match) {
        sourceJson = {
          mp4: mp4Match[0],
          name: file_name,
          quality: file_quality,
          size: file_size,
        }; // match[0] is the full matched URL
        console.log("[+] Found base64 encoded MP4 URL via regex.");
      } else if (m3u8Match) {
        sourceJson = {
          hls: m3u8Match[0],
          name: file_name,
          quality: file_quality,
          size: file_size,
        }; // match[0] is the full matched URL
        console.log("[+] Found base64 encoded HLS (m3u8) URL via regex.");
      } else {
        console.log(
          "[-] Fallback regex search failed to find .mp4 or .m3u8 URLs.",
        );
      }
    }
  } catch (e) {
    console.error(`[-] Error while decoding MKGMa string: ${e.message || e}`);
    // Optionally: console.error(e); // Log the full error stack
  }

  if (!sourceJson) {
    console.log("[-] Could not extract any source URL.");
  }

  return sourceJson;
}
