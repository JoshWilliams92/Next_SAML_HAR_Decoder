"use client";

import { useState } from "react";
import { formatXml } from "@/lib/xml/format";

interface XmlViewerProps {
  xml: string;
}

export default function XmlViewer({ xml }: XmlViewerProps) {
  const [copied, setCopied] = useState(false);
  const formatted = formatXml(xml);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre className="max-h-[600px] overflow-auto rounded-md bg-zinc-50 p-4 font-mono text-sm leading-relaxed text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
        {formatted}
      </pre>
    </div>
  );
}
