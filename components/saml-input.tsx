"use client";

import { useState } from "react";

interface SamlInputProps {
  onDecode: (value: string) => void;
  onReset: () => void;
}

export default function SamlInput({ onDecode, onReset }: SamlInputProps) {
  const [value, setValue] = useState("");

  const handleDecode = () => {
    if (value.trim()) {
      onDecode(value);
    }
  };

  const handleClear = () => {
    setValue("");
    onReset();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleDecode();
    }
  };

  return (
    <div className="space-y-3">
      <textarea
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
        rows={8}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Paste a Base64-encoded SAMLResponse here..."
        spellCheck={false}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Ctrl+Enter to decode
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleDecode}
            disabled={!value.trim()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Decode
          </button>
        </div>
      </div>
    </div>
  );
}
