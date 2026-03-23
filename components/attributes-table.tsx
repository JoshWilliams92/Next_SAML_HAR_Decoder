"use client";

import type { SamlResponse } from "@/lib/saml/types";

interface AttributesTableProps {
  parsed: SamlResponse;
}

export default function AttributesTable({ parsed }: AttributesTableProps) {
  return (
    <div className="space-y-6">
      {/* Summary fields */}
      <div className="grid gap-3 sm:grid-cols-2">
        <SummaryField label="Issuer" value={parsed.issuer} />
        <SummaryField label="NameID" value={parsed.subject?.nameId} />
        <SummaryField
          label="NameID Format"
          value={parsed.subject?.nameIdFormat}
        />
        <SummaryField label="Status" value={parsed.statusCode} />
        <SummaryField label="Destination" value={parsed.destination} />
        <SummaryField label="InResponseTo" value={parsed.inResponseTo} />
        <SummaryField label="Issue Instant" value={parsed.issueInstant} />
        <SummaryField
          label="Session Index"
          value={parsed.authnStatement?.sessionIndex}
        />
        <SummaryField
          label="AuthnContext"
          value={parsed.authnStatement?.authnContextClassRef}
        />
        <SummaryField
          label="Confirmation Method"
          value={parsed.subject?.confirmationMethod}
        />
      </div>

      {/* Attributes table */}
      {parsed.attributes.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Attributes ({parsed.attributes.length})
          </h3>
          <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
                  <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">
                    Value(s)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {parsed.attributes.map((attr, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 font-mono text-xs text-zinc-700 dark:text-zinc-300">
                      {attr.name}
                    </td>
                    <td className="px-3 py-2 text-zinc-900 dark:text-zinc-100">
                      {attr.values.length === 1 ? (
                        <span className="font-mono text-xs">
                          {attr.values[0]}
                        </span>
                      ) : (
                        <ul className="list-inside list-disc">
                          {attr.values.map((val, j) => (
                            <li key={j} className="font-mono text-xs">
                              {val}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {parsed.attributes.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No SAML attributes found in this response.
        </p>
      )}
    </div>
  );
}

function SummaryField({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) {
  if (!value) return null;
  return (
    <div className="rounded-md bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
      <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd className="mt-0.5 break-all font-mono text-xs text-zinc-800 dark:text-zinc-200">
        {value}
      </dd>
    </div>
  );
}
