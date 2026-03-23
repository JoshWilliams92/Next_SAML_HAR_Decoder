import type {
  SamlResponse,
  SamlAttribute,
  SamlConditions,
  SamlSubject,
  SamlAuthnStatement,
  SamlSignature,
} from "./types";

// Common SAML / XML-DSig namespace URIs
const NS_SAMLP = "urn:oasis:names:tc:SAML:2.0:protocol";
const NS_SAML = "urn:oasis:names:tc:SAML:2.0:assertion";
const NS_DS = "http://www.w3.org/2000/09/xmldsig#";

/** Get the text content of the first element matching a namespace + local name */
function getText(
  parent: Element,
  ns: string,
  localName: string,
): string | undefined {
  const els = parent.getElementsByTagNameNS(ns, localName);
  return els.length > 0 ? (els[0].textContent?.trim() || undefined) : undefined;
}

/** Get an attribute from the first element matching a namespace + local name */
function getAttr(
  parent: Element,
  ns: string,
  localName: string,
  attrName: string,
): string | undefined {
  const els = parent.getElementsByTagNameNS(ns, localName);
  return els.length > 0
    ? (els[0].getAttribute(attrName) || undefined)
    : undefined;
}

function parseSignature(parent: Element): SamlSignature | undefined {
  const sigs = parent.getElementsByTagNameNS(NS_DS, "Signature");
  if (sigs.length === 0) return undefined;

  // Only inspect the *direct child* signature of this element
  let sig: Element | null = null;
  for (let i = 0; i < sigs.length; i++) {
    if (sigs[i].parentElement === parent) {
      sig = sigs[i];
      break;
    }
  }
  if (!sig) return undefined;

  const signatureMethod =
    sig
      .getElementsByTagNameNS(NS_DS, "SignatureMethod")[0]
      ?.getAttribute("Algorithm") || undefined;
  const digestMethod =
    sig
      .getElementsByTagNameNS(NS_DS, "DigestMethod")[0]
      ?.getAttribute("Algorithm") || undefined;
  const certEl = sig.getElementsByTagNameNS(NS_DS, "X509Certificate")[0];
  const certificateBase64 = certEl?.textContent?.replace(/\s+/g, "") || undefined;

  return { present: true, signatureMethod, digestMethod, certificateBase64 };
}

function parseSubject(assertion: Element): SamlSubject | undefined {
  const subjects = assertion.getElementsByTagNameNS(NS_SAML, "Subject");
  if (subjects.length === 0) return undefined;
  const subj = subjects[0];

  const nameId = getText(subj, NS_SAML, "NameID");
  const nameIdFormat =
    subj
      .getElementsByTagNameNS(NS_SAML, "NameID")[0]
      ?.getAttribute("Format") || undefined;

  const confEls = subj.getElementsByTagNameNS(
    NS_SAML,
    "SubjectConfirmationData",
  );
  let inResponseTo: string | undefined;
  let recipient: string | undefined;
  let notOnOrAfter: string | undefined;
  let confirmationMethod: string | undefined;

  if (confEls.length > 0) {
    const cd = confEls[0];
    inResponseTo = cd.getAttribute("InResponseTo") || undefined;
    recipient = cd.getAttribute("Recipient") || undefined;
    notOnOrAfter = cd.getAttribute("NotOnOrAfter") || undefined;
  }

  const scEls = subj.getElementsByTagNameNS(
    NS_SAML,
    "SubjectConfirmation",
  );
  if (scEls.length > 0) {
    confirmationMethod = scEls[0].getAttribute("Method") || undefined;
  }

  return { nameId, nameIdFormat, confirmationMethod, inResponseTo, recipient, notOnOrAfter };
}

function parseConditions(assertion: Element): SamlConditions | undefined {
  const condEls = assertion.getElementsByTagNameNS(NS_SAML, "Conditions");
  if (condEls.length === 0) return undefined;
  const cond = condEls[0];

  const notBefore = cond.getAttribute("NotBefore") || undefined;
  const notOnOrAfter = cond.getAttribute("NotOnOrAfter") || undefined;

  const audienceRestrictions: string[] = [];
  const arEls = cond.getElementsByTagNameNS(NS_SAML, "Audience");
  for (let i = 0; i < arEls.length; i++) {
    const text = arEls[i].textContent?.trim();
    if (text) audienceRestrictions.push(text);
  }

  return { notBefore, notOnOrAfter, audienceRestrictions };
}

function parseAuthnStatement(
  assertion: Element,
): SamlAuthnStatement | undefined {
  const stmts = assertion.getElementsByTagNameNS(NS_SAML, "AuthnStatement");
  if (stmts.length === 0) return undefined;
  const stmt = stmts[0];

  return {
    authnInstant: stmt.getAttribute("AuthnInstant") || undefined,
    sessionIndex: stmt.getAttribute("SessionIndex") || undefined,
    sessionNotOnOrAfter: stmt.getAttribute("SessionNotOnOrAfter") || undefined,
    authnContextClassRef: getText(stmt, NS_SAML, "AuthnContextClassRef"),
  };
}

function parseAttributes(assertion: Element): SamlAttribute[] {
  const attrs: SamlAttribute[] = [];
  const attrEls = assertion.getElementsByTagNameNS(NS_SAML, "Attribute");

  for (let i = 0; i < attrEls.length; i++) {
    const el = attrEls[i];
    const name = el.getAttribute("Name") || `Attribute ${i}`;
    const nameFormat = el.getAttribute("NameFormat") || undefined;

    const values: string[] = [];
    const valueEls = el.getElementsByTagNameNS(NS_SAML, "AttributeValue");
    for (let j = 0; j < valueEls.length; j++) {
      values.push(valueEls[j].textContent?.trim() || "");
    }

    attrs.push({ name, nameFormat, values });
  }

  return attrs;
}

/**
 * Parse a SAML XML Document into a structured SamlResponse object.
 */
export function parseSamlResponse(doc: Document): SamlResponse {
  const root = doc.documentElement;

  // Top-level response attributes (may be samlp:Response or saml:Assertion)
  const isResponse = root.localName === "Response";

  const response: SamlResponse = {
    id: root.getAttribute("ID") || undefined,
    issueInstant: root.getAttribute("IssueInstant") || undefined,
    destination: root.getAttribute("Destination") || undefined,
    inResponseTo: root.getAttribute("InResponseTo") || undefined,
    attributes: [],
  };

  // Response-level status
  if (isResponse) {
    response.statusCode = getAttr(root, NS_SAMLP, "StatusCode", "Value");
    response.issuer = getText(root, NS_SAML, "Issuer");
    response.signature = parseSignature(root);
  }

  // Find the Assertion element
  const assertions = root.getElementsByTagNameNS(NS_SAML, "Assertion");
  const assertion =
    assertions.length > 0 ? assertions[0] : (!isResponse ? root : null);

  if (assertion) {
    response.assertionId = assertion.getAttribute("ID") || undefined;
    response.assertionIssueInstant =
      assertion.getAttribute("IssueInstant") || undefined;
    response.assertionIssuer = getText(assertion, NS_SAML, "Issuer");
    response.subject = parseSubject(assertion);
    response.conditions = parseConditions(assertion);
    response.authnStatement = parseAuthnStatement(assertion);
    response.attributes = parseAttributes(assertion);
    response.assertionSignature = parseSignature(assertion);
  }

  // Fallback: if no response-level issuer, use assertion issuer
  if (!response.issuer && response.assertionIssuer) {
    response.issuer = response.assertionIssuer;
  }

  return response;
}
