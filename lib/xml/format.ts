/**
 * Pretty-print an XML string with consistent indentation.
 * Uses the browser DOMParser + recursive serialization.
 */
export function formatXml(xml: string, indent = "  "): string {
  // Remove existing whitespace between tags so we can re-indent cleanly
  const cleaned = xml.replace(/(>)\s*(<)/g, "$1\n$2").trim();
  const lines = cleaned.split("\n");

  let depth = 0;
  const result: string[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Closing tag (e.g. </Foo>) — decrease depth before printing
    const isClosing = /^<\//.test(line);
    // Self-closing tag (e.g. <Foo />) — don't change depth
    const isSelfClosing = /\/>$/.test(line);
    // Opening tag (e.g. <Foo>) — increase depth after printing
    const isOpening = /^<[^/!?]/.test(line) && !isSelfClosing;

    if (isClosing) {
      depth = Math.max(0, depth - 1);
    }

    result.push(indent.repeat(depth) + line);

    if (isOpening) {
      depth++;
    }
  }

  return result.join("\n");
}
