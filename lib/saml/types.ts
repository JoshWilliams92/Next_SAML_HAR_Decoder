// ── Decode result types ──

export interface DecodeSuccess {
  ok: true;
  xml: string;
  doc: Document;
}

export interface DecodeError {
  ok: false;
  error: string;
  stage: "uri-decode" | "base64" | "xml-parse" | "not-saml";
}

export type DecodeResult = DecodeSuccess | DecodeError;

// ── Parsed SAML response types ──

export interface SamlAttribute {
  name: string;
  nameFormat?: string;
  values: string[];
}

export interface SamlConditions {
  notBefore?: string;
  notOnOrAfter?: string;
  audienceRestrictions: string[];
}

export interface SamlSubject {
  nameId?: string;
  nameIdFormat?: string;
  confirmationMethod?: string;
  inResponseTo?: string;
  recipient?: string;
  notOnOrAfter?: string;
}

export interface SamlAuthnStatement {
  authnInstant?: string;
  sessionIndex?: string;
  sessionNotOnOrAfter?: string;
  authnContextClassRef?: string;
}

export interface SamlSignature {
  present: boolean;
  signatureMethod?: string;
  digestMethod?: string;
  certificateBase64?: string;
}

export interface SamlResponse {
  /** Top-level response attributes */
  id?: string;
  issueInstant?: string;
  destination?: string;
  inResponseTo?: string;
  statusCode?: string;

  /** Issuer of the response */
  issuer?: string;

  /** Assertion-level data */
  assertionId?: string;
  assertionIssuer?: string;
  assertionIssueInstant?: string;

  subject?: SamlSubject;
  conditions?: SamlConditions;
  authnStatement?: SamlAuthnStatement;
  attributes: SamlAttribute[];
  signature?: SamlSignature;
  assertionSignature?: SamlSignature;
}

// ── Validation types ──

export type ValidationSeverity = "pass" | "fail" | "warn";

export interface ValidationResult {
  label: string;
  severity: ValidationSeverity;
  message: string;
}
