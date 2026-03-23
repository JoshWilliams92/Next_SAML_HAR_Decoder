import type { DecodeResult } from "./types";
import { parseXml } from "@/lib/xml/parse";

/**
 * Decode a Base64-encoded (optionally URI-encoded) SAML response into XML.
 *
 * Pipeline: URI-decode → Base64-decode → XML-parse → SAML root check.
 * All processing happens in the browser — no data leaves the client.
 */
export function decodeSamlResponse(input: string): DecodeResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Input is empty", stage: "base64" };
  }

  // Step 1: URI-decode (handles SAMLResponse values that are URL-encoded)
  let uriDecoded: string;
  try {
    uriDecoded = decodeURIComponent(trimmed);
  } catch {
    // If URI decode fails, treat the raw input as Base64 directly
    uriDecoded = trimmed;
  }

  // Step 2: Base64-decode → UTF-8 string
  let xml: string;
  try {
    const binaryString = atob(uriDecoded);
    // Convert binary string to UTF-8 via TextDecoder
    const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
    xml = new TextDecoder("utf-8").decode(bytes);
  } catch {
    return {
      ok: false,
      error:
        "Input is not valid Base64. Paste the raw Base64-encoded SAMLResponse value.",
      stage: "base64",
    };
  }

  // Step 3: Parse as XML
  const parsed = parseXml(xml);
  if (!parsed.ok) {
    return {
      ok: false,
      error: `Decoded value is not valid XML: ${parsed.error}`,
      stage: "xml-parse",
    };
  }

  // Step 4: Verify it looks like a SAML response or assertion
  const root = parsed.doc.documentElement;
  const rootLocal = root.localName.toLowerCase();
  const isSaml =
    rootLocal === "response" ||
    rootLocal === "assertion" ||
    rootLocal === "authnrequest" ||
    rootLocal === "logoutrequest" ||
    rootLocal === "logoutresponse";

  if (!isSaml) {
    return {
      ok: false,
      error: `Decoded XML root element <${root.localName}> is not a recognized SAML element.`,
      stage: "not-saml",
    };
  }

  return { ok: true, xml, doc: parsed.doc };
}
