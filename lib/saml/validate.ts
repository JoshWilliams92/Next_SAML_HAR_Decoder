import type { SamlResponse, ValidationResult } from "./types";

/**
 * Run validation checks against a parsed SAML response.
 * Returns an array of pass/fail/warn results.
 */
export function validateSamlResponse(
  saml: SamlResponse,
  now = new Date(),
): ValidationResult[] {
  const results: ValidationResult[] = [];

  // ── Status code ──
  if (saml.statusCode) {
    const isSuccess = saml.statusCode.endsWith(":Success");
    results.push({
      label: "Status Code",
      severity: isSuccess ? "pass" : "fail",
      message: isSuccess
        ? `Success (${saml.statusCode})`
        : `Non-success status: ${saml.statusCode}`,
    });
  }

  // ── Conditions: NotBefore ──
  if (saml.conditions?.notBefore) {
    const notBefore = new Date(saml.conditions.notBefore);
    const valid = now >= notBefore;
    results.push({
      label: "Not Before",
      severity: valid ? "pass" : "fail",
      message: valid
        ? `Valid — assertion is active since ${saml.conditions.notBefore}`
        : `Not yet valid — assertion starts at ${saml.conditions.notBefore}`,
    });
  }

  // ── Conditions: NotOnOrAfter ──
  if (saml.conditions?.notOnOrAfter) {
    const notOnOrAfter = new Date(saml.conditions.notOnOrAfter);
    const valid = now < notOnOrAfter;
    results.push({
      label: "Not On Or After",
      severity: valid ? "pass" : "warn",
      message: valid
        ? `Valid — assertion expires at ${saml.conditions.notOnOrAfter}`
        : `Expired — assertion expired at ${saml.conditions.notOnOrAfter}`,
    });
  }

  // ── Subject NotOnOrAfter ──
  if (saml.subject?.notOnOrAfter) {
    const subjectExpiry = new Date(saml.subject.notOnOrAfter);
    const valid = now < subjectExpiry;
    results.push({
      label: "Subject Confirmation Expiry",
      severity: valid ? "pass" : "warn",
      message: valid
        ? `Valid — subject confirmation expires at ${saml.subject.notOnOrAfter}`
        : `Expired — subject confirmation expired at ${saml.subject.notOnOrAfter}`,
    });
  }

  // ── Session NotOnOrAfter ──
  if (saml.authnStatement?.sessionNotOnOrAfter) {
    const sessionExpiry = new Date(saml.authnStatement.sessionNotOnOrAfter);
    const valid = now < sessionExpiry;
    results.push({
      label: "Session Expiry",
      severity: valid ? "pass" : "warn",
      message: valid
        ? `Valid — session expires at ${saml.authnStatement.sessionNotOnOrAfter}`
        : `Expired — session expired at ${saml.authnStatement.sessionNotOnOrAfter}`,
    });
  }

  // ── Audience restriction ──
  const audiences = saml.conditions?.audienceRestrictions ?? [];
  results.push({
    label: "Audience Restriction",
    severity: audiences.length > 0 ? "pass" : "warn",
    message:
      audiences.length > 0
        ? `Present — ${audiences.join(", ")}`
        : "No audience restriction found",
  });

  // ── Response signature ──
  results.push({
    label: "Response Signature",
    severity: saml.signature?.present ? "pass" : "warn",
    message: saml.signature?.present
      ? `Present${saml.signature.signatureMethod ? ` (${saml.signature.signatureMethod.split("#").pop()})` : ""}`
      : "No signature on Response element",
  });

  // ── Assertion signature ──
  results.push({
    label: "Assertion Signature",
    severity: saml.assertionSignature?.present ? "pass" : "warn",
    message: saml.assertionSignature?.present
      ? `Present${saml.assertionSignature.signatureMethod ? ` (${saml.assertionSignature.signatureMethod.split("#").pop()})` : ""}`
      : "No signature on Assertion element",
  });

  // ── X.509 Certificate DER validation ──
  const sigWithCert = saml.assertionSignature ?? saml.signature;
  if (sigWithCert?.present && sigWithCert.certificateBase64) {
    try {
      const raw = atob(sigWithCert.certificateBase64);
      const isValidDer = raw.charCodeAt(0) === 0x30 && raw.length > 128;
      results.push({
        label: "X.509 Certificate",
        severity: isValidDer ? "pass" : "fail",
        message: isValidDer
          ? `Valid DER-encoded certificate (${raw.length} bytes)`
          : "Certificate data is not valid DER-encoded X.509 — signature cannot be trusted",
      });
    } catch {
      results.push({
        label: "X.509 Certificate",
        severity: "fail",
        message: "Certificate data is not valid Base64",
      });
    }
  } else if (sigWithCert?.present && !sigWithCert.certificateBase64) {
    results.push({
      label: "X.509 Certificate",
      severity: "warn",
      message: "Signature present but no X.509 certificate embedded in KeyInfo",
    });
  }

  // ── Subject / NameID ──
  results.push({
    label: "NameID",
    severity: saml.subject?.nameId ? "pass" : "warn",
    message: saml.subject?.nameId
      ? `Present — ${saml.subject.nameId}`
      : "No NameID found in Subject",
  });

  // ── Issuer ──
  results.push({
    label: "Issuer",
    severity: saml.issuer ? "pass" : "warn",
    message: saml.issuer ? `Present — ${saml.issuer}` : "No Issuer found",
  });

  return results;
}
