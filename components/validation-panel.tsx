"use client";

import type { ValidationResult, ValidationSeverity } from "@/lib/saml/types";

interface ValidationPanelProps {
  validations: ValidationResult[];
}

const severityConfig: Record<
  ValidationSeverity,
  { icon: string; bg: string; text: string; border: string }
> = {
  pass: {
    icon: "✓",
    bg: "bg-green-50 dark:bg-green-950",
    text: "text-green-700 dark:text-green-300",
    border: "border-green-200 dark:border-green-800",
  },
  fail: {
    icon: "✕",
    bg: "bg-red-50 dark:bg-red-950",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-800",
  },
  warn: {
    icon: "⚠",
    bg: "bg-yellow-50 dark:bg-yellow-950",
    text: "text-yellow-700 dark:text-yellow-300",
    border: "border-yellow-200 dark:border-yellow-800",
  },
};

export default function ValidationPanel({
  validations,
}: ValidationPanelProps) {
  if (validations.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No validation checks available.
      </p>
    );
  }

  const failCount = validations.filter((v) => v.severity === "fail").length;
  const warnCount = validations.filter((v) => v.severity === "warn").length;
  const passCount = validations.filter((v) => v.severity === "pass").length;

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="flex gap-4 text-sm">
        <span className="text-green-600 dark:text-green-400">
          {passCount} passed
        </span>
        {warnCount > 0 && (
          <span className="text-yellow-600 dark:text-yellow-400">
            {warnCount} warnings
          </span>
        )}
        {failCount > 0 && (
          <span className="text-red-600 dark:text-red-400">
            {failCount} failed
          </span>
        )}
      </div>

      {/* Check list */}
      <div className="space-y-2">
        {validations.map((v, i) => {
          const config = severityConfig[v.severity];
          return (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-md border px-3 py-2 ${config.bg} ${config.border}`}
            >
              <span
                className={`mt-0.5 flex-shrink-0 text-sm font-bold ${config.text}`}
              >
                {config.icon}
              </span>
              <div className="min-w-0">
                <p
                  className={`text-sm font-medium ${config.text}`}
                >
                  {v.label}
                </p>
                <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                  {v.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
