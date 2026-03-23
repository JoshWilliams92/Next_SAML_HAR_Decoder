"use client";

import { useState } from "react";
import type { SamlResponse, ValidationResult } from "@/lib/saml/types";
import XmlViewer from "./xml-viewer";
import AttributesTable from "./attributes-table";
import CertificateInfo from "./certificate-info";
import ValidationPanel from "./validation-panel";

interface DecodedViewerProps {
  xml: string;
  parsed: SamlResponse;
  validations: ValidationResult[];
}

const tabs = ["XML", "Attributes", "Certificates", "Validation"] as const;
type Tab = (typeof tabs)[number];

export default function DecodedViewer({
  xml,
  parsed,
  validations,
}: DecodedViewerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("XML");

  return (
    <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {/* Tab bar */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((tab) => {
          const isActive = tab === activeTab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {tab}
              {tab === "Validation" && validations.length > 0 && (
                <span className="ml-1.5 inline-flex items-center rounded-full bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                  {validations.filter((v) => v.severity === "fail").length > 0
                    ? `${validations.filter((v) => v.severity === "fail").length} issues`
                    : "OK"}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="p-4">
        {activeTab === "XML" && <XmlViewer xml={xml} />}
        {activeTab === "Attributes" && <AttributesTable parsed={parsed} />}
        {activeTab === "Certificates" && <CertificateInfo parsed={parsed} />}
        {activeTab === "Validation" && (
          <ValidationPanel validations={validations} />
        )}
      </div>
    </div>
  );
}
