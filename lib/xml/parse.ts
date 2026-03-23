export interface XmlParseSuccess {
  ok: true;
  doc: Document;
}

export interface XmlParseError {
  ok: false;
  error: string;
}

export type XmlParseResult = XmlParseSuccess | XmlParseError;

/**
 * Parse an XML string into a Document using the browser DOMParser.
 * Returns a typed result to avoid throwing on malformed XML.
 */
export function parseXml(xml: string): XmlParseResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");

  const parserError = doc.getElementsByTagName("parsererror");
  if (parserError.length > 0) {
    const message =
      parserError[0].textContent?.trim() || "Failed to parse XML";
    return { ok: false, error: message };
  }

  return { ok: true, doc };
}
