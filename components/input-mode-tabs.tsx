"use client";

type InputMode = "text" | "har";

interface InputModeTabsProps {
  activeMode: InputMode;
  onModeChange: (mode: InputMode) => void;
}

const tabs: { mode: InputMode; label: string }[] = [
  { mode: "text", label: "Paste SAML Response" },
  { mode: "har", label: "Upload HAR File" },
];

export default function InputModeTabs({
  activeMode,
  onModeChange,
}: InputModeTabsProps) {
  return (
    <div className="flex border-b border-zinc-200 dark:border-zinc-800">
      {tabs.map((tab) => {
        const isActive = tab.mode === activeMode;
        return (
          <button
            key={tab.mode}
            type="button"
            onClick={() => onModeChange(tab.mode)}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
