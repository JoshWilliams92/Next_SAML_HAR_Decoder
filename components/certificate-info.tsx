"use client";

import { useState } from "react";
import type { SamlResponse, SamlSignature } from "@/lib/saml/types";

interface CertificateInfoProps {
  parsed: SamlResponse;
}

export default function CertificateInfo({ parsed }: CertificateInfoProps) {
  const certs: { label: string; sig: SamlSignature }[] = [];
  if (parsed.signature?.certificateBase64) {
    certs.push({ label: "Response Signature", sig: parsed.signature });
  }
  if (parsed.assertionSignature?.certificateBase64) {
    certs.push({
      label: "Assertion Signature",
      sig: parsed.assertionSignature,
    });
  }

  if (certs.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        No X.509 certificates found in the SAML response signatures.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {certs.map((cert, i) => (
        <CertBlock key={i} label={cert.label} sig={cert.sig} />
      ))}
    </div>
  );
}

function CertBlock({ label, sig }: { label: string; sig: SamlSignature }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const pem = sig.certificateBase64
    ? `-----BEGIN CERTIFICATE-----\n${(sig.certificateBase64.match(/.{1,64}/g) || []).join("\n")}\n-----END CERTIFICATE-----`
    : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pem);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-md border border-zinc-200 dark:border-zinc-700">
      <div className="bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
        <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {label}
        </h4>
      </div>
      <div className="space-y-2 px-3 py-3">
        {sig.signatureMethod && (
          <InfoRow
            label="Signature Algorithm"
            value={sig.signatureMethod.split("#").pop() || sig.signatureMethod}
          />
        )}
        {sig.digestMethod && (
          <InfoRow
            label="Digest Algorithm"
            value={sig.digestMethod.split("#").pop() || sig.digestMethod}
          />
        )}
        {sig.certificateBase64 && (
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {expanded ? "Hide" : "Show"} PEM Certificate
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            {expanded && (
              <pre className="mt-2 max-h-48 overflow-auto rounded bg-zinc-50 p-2 font-mono text-xs text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                {pem}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="font-medium text-zinc-500 dark:text-zinc-400">
        {label}:
      </span>
      <span className="font-mono text-zinc-800 dark:text-zinc-200">
        {value}
      </span>
    </div>
  );
}
