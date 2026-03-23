"use client";

import { useState, useCallback } from "react";
import { extractSamlFromHar } from "@/lib/har/parse";
import type { HarSamlMatch } from "@/lib/har/types";

interface HarUploadProps {
  onSelectSamlResponse: (samlBase64: string) => void;
}

export default function HarUpload({ onSelectSamlResponse }: HarUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [matches, setMatches] = useState<HarSamlMatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      setMatches([]);
      setFileName(file.name);

      if (!file.name.endsWith(".har")) {
        setError("Please upload a .har file.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text !== "string") {
          setError("Failed to read file.");
          return;
        }
        try {
          const results = extractSamlFromHar(text);
          if (results.length === 0) {
            setError(
              "No SAMLResponse parameters found in this HAR file.",
            );
            return;
          }
          setMatches(results);
          // Auto-select if only one match
          if (results.length === 1) {
            onSelectSamlResponse(results[0].samlResponse);
          }
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to parse HAR file.",
          );
        }
      };
      reader.onerror = () => setError("Failed to read file.");
      reader.readAsText(file);
    },
    [onSelectSamlResponse],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950"
            : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500"
        }`}
      >
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Drag and drop a <span className="font-medium">.har</span> file here,
          or{" "}
          <label className="cursor-pointer font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            browse
            <input
              type="file"
              accept=".har"
              onChange={handleFileSelect}
              className="sr-only"
            />
          </label>
        </p>
        {fileName && !error && matches.length === 0 && (
          <p className="mt-2 text-xs text-zinc-400">Processing {fileName}...</p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Results list (when multiple matches) */}
      {matches.length > 1 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Found {matches.length} SAMLResponse entries — select one to decode:
          </p>
          <div className="space-y-2">
            {matches.map((match, i) => {
              let urlDisplay: string;
              try {
                const u = new URL(match.url);
                urlDisplay = u.pathname;
              } catch {
                urlDisplay = match.url;
              }
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectSamlResponse(match.samlResponse)}
                  className="w-full rounded-md border border-zinc-200 px-3 py-2 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  <p className="truncate font-mono text-xs text-zinc-800 dark:text-zinc-200">
                    {match.method} {urlDisplay}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    {match.timestamp} — via {match.source}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Single match auto-selected */}
      {matches.length === 1 && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Found 1 SAMLResponse — decoded automatically.
        </p>
      )}
    </div>
  );
}
