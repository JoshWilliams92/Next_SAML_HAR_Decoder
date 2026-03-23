import type { HarLog, HarEntry, HarSamlMatch } from "./types";

/**
 * Parse a HAR JSON string and extract all SAMLResponse values found in entries.
 * Returns an array of matches with context about where each was found.
 */
export function extractSamlFromHar(harJson: string): HarSamlMatch[] {
  let har: HarLog;
  try {
    har = JSON.parse(harJson);
  } catch {
    throw new Error("Invalid JSON — the file does not appear to be a valid HAR file.");
  }

  if (!har?.log?.entries || !Array.isArray(har.log.entries)) {
    throw new Error(
      "Invalid HAR format — expected a 'log.entries' array.",
    );
  }

  const matches: HarSamlMatch[] = [];

  for (const entry of har.log.entries) {
    findSamlInEntry(entry, matches);
  }

  return matches;
}

function findSamlInEntry(entry: HarEntry, matches: HarSamlMatch[]) {
  const { request } = entry;
  if (!request) return;

  const baseInfo = {
    url: request.url ?? "unknown",
    method: request.method ?? "unknown",
    timestamp: entry.startedDateTime ?? "",
  };

  // Check POST body params (form-encoded)
  if (request.postData?.params) {
    for (const param of request.postData.params) {
      if (param.name === "SAMLResponse" && param.value) {
        matches.push({
          ...baseInfo,
          samlResponse: param.value,
          source: "postData.params",
        });
      }
    }
  }

  // Check POST body text (raw body that might contain SAMLResponse=...)
  if (request.postData?.text && !request.postData.params?.length) {
    const match = request.postData.text.match(
      /SAMLResponse=([^&]+)/,
    );
    if (match) {
      try {
        matches.push({
          ...baseInfo,
          samlResponse: decodeURIComponent(match[1]),
          source: "postData.text",
        });
      } catch {
        // If URI decoding fails, use raw value
        matches.push({
          ...baseInfo,
          samlResponse: match[1],
          source: "postData.text",
        });
      }
    }
  }

  // Check query string parameters
  if (request.queryString) {
    for (const param of request.queryString) {
      if (param.name === "SAMLResponse" && param.value) {
        matches.push({
          ...baseInfo,
          samlResponse: param.value,
          source: "queryString",
        });
      }
    }
  }
}
