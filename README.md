# 🔐 HAR SAML Decoder

A privacy-first web tool for decoding and inspecting SAML 2.0 responses from HAR files or raw Base64 input. All processing happens entirely in the browser — no data ever leaves your machine.

## Demo

https://github.com/user-attachments/assets/Recording%202026-03-23%20203715.mp4

## Features

- **HAR File Upload** — Drag-and-drop a `.har` file and automatically extract `SAMLResponse` parameters
- **Raw Base64 Input** — Paste a Base64-encoded SAML response directly
- **XML Pretty-Print** — Formatted, syntax-highlighted SAML XML with one-click copy
- **Attribute Extraction** — Parsed table of all SAML attributes, NameID, Issuer, and conditions
- **Certificate Inspection** — X.509 certificate details with PEM export and DER validation
- **Validation Panel** — Traffic-light pass/warn/fail checks for timestamps, signatures, audience, and more
- **100% Client-Side** — Zero server calls; all decoding, parsing, and validation run in the browser
- **IDP Agnostic** — Works with Okta, Azure AD, ADFS, Ping, OneLogin, Shibboleth, and any SAML 2.0 provider

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4
- **SAML Parsing:** DOMParser + namespace-aware XML traversal
- **Architecture:** Server Components shell, single Client Component boundary

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/JoshWilliams92/har-saml-decoder.git
cd har-saml-decoder
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

For production build:

```bash
pnpm build
pnpm start
```

## Project Structure

```
har-saml-decoder/
├── app/
│   ├── layout.tsx           # Root layout (Geist fonts, metadata)
│   ├── page.tsx             # Landing page (Server Component)
│   └── globals.css          # Tailwind imports
├── components/
│   ├── saml-decoder-app.tsx # Main client orchestrator
│   ├── saml-input.tsx       # Base64 textarea input
│   ├── input-mode-tabs.tsx  # Text / HAR mode switcher
│   ├── har-upload.tsx       # Drag-and-drop HAR file upload
│   ├── decoded-viewer.tsx   # Tabbed output (XML, Attributes, Certs, Validation)
│   ├── xml-viewer.tsx       # Pretty-printed XML with copy
│   ├── attributes-table.tsx # Parsed SAML attributes grid
│   ├── certificate-info.tsx # X.509 certificate details + PEM
│   └── validation-panel.tsx # Pass/warn/fail validation results
├── lib/
│   ├── saml/
│   │   ├── types.ts         # TypeScript interfaces
│   │   ├── decode.ts        # Base64 → XML decode pipeline
│   │   ├── parse.ts         # XML → structured SAML data
│   │   └── validate.ts      # SAML validation checks
│   ├── har/
│   │   ├── types.ts         # HAR 1.2 type definitions
│   │   └── parse.ts         # SAMLResponse extraction from HAR
│   └── xml/
│       ├── parse.ts         # DOMParser wrapper
│       └── format.ts        # XML pretty-printer
├── public/
│   ├── assets/
│   │   └── Recording 2026-03-23 203715.mp4  # Demo video
│   └── demo/
│       ├── signed-sample.har       # Cryptographically signed SAML (real X.509)
│       ├── unsigned-sample.har     # Multi-entry SSO flow (synthetic crypto)
│       ├── corrupted-not-xml.har   # Valid Base64, invalid XML
│       └── corrupted-bad-base64.har # Invalid Base64 encoding
├── .gitignore
├── package.json
├── tsconfig.json
└── next.config.ts
```

## Demo Files

Four sample HAR files are included under `public/demo/` to showcase different scenarios:

| File | Description |
| --- | --- |
| `signed-sample.har` | Real RSA-2048 signed SAML assertion with valid X.509 certificate |
| `unsigned-sample.har` | 7-entry HAR simulating a full SAML SSO login flow |
| `corrupted-not-xml.har` | Base64 decodes successfully but content is not XML |
| `corrupted-bad-base64.har` | Contains invalid Base64 characters |

## License

ISC
