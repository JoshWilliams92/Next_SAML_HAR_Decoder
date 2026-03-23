"use client";

import { useState, useCallback } from "react";
import { decodeSamlResponse } from "@/lib/saml/decode";
import { parseSamlResponse } from "@/lib/saml/parse";
import { validateSamlResponse } from "@/lib/saml/validate";
import type {
  DecodeResult,
  SamlResponse,
  ValidationResult,
} from "@/lib/saml/types";
import InputModeTabs from "./input-mode-tabs";
import SamlInput from "./saml-input";
import HarUpload from "./har-upload";
import DecodedViewer from "./decoded-viewer";

type InputMode = "text" | "har";

interface DecodedState {
  result: DecodeResult;
  xml: string;
  parsed: SamlResponse | null;
  validations: ValidationResult[];
}

export default function SamlDecoderApp() {
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [decoded, setDecoded] = useState<DecodedState | null>(null);

  const handleDecode = useCallback((rawBase64: string) => {
    const result = decodeSamlResponse(rawBase64);

    if (result.ok) {
      const parsed = parseSamlResponse(result.doc);
      const validations = validateSamlResponse(parsed);
      setDecoded({ result, xml: result.xml, parsed, validations });
    } else {
      setDecoded({ result, xml: "", parsed: null, validations: [] });
    }
  }, []);

  const handleReset = useCallback(() => {
    setDecoded(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Input section */}
      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <InputModeTabs activeMode={inputMode} onModeChange={setInputMode} />
        <div className="p-4">
          {inputMode === "text" ? (
            <SamlInput onDecode={handleDecode} onReset={handleReset} />
          ) : (
            <HarUpload onSelectSamlResponse={handleDecode} />
          )}
        </div>
      </div>

      {/* Output section */}
      {decoded && (
        <>
          {decoded.result.ok ? (
            <DecodedViewer
              xml={decoded.xml}
              parsed={decoded.parsed!}
              validations={decoded.validations}
            />
          ) : (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
              role="alert"
            >
              <p className="font-semibold">Decode Error</p>
              <p className="mt-1">{decoded.result.error}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
