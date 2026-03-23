import SamlDecoderApp from "@/components/saml-decoder-app";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            HAR SAML Decoder
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Decode and inspect SAML responses — all processing happens in your
            browser.
          </p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <SamlDecoderApp />
        <aside className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          <strong>About this tool:</strong> This is a decoder/inspector, not a
          validation gate. All SAML responses — including unsigned or expired
          ones — will be decoded and displayed so you can inspect their contents.
          Issues are flagged in the <em>Validation</em> tab, not by blocking
          display. Only genuinely malformed input (invalid Base64 or non-XML
          data) will produce a decode error.
          <br className="my-2" />
          <strong>Demo files</strong> in{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">
            public/demo/
          </code>
          :{" "}
          <em>signed-sample.har</em> — cryptographically signed with a real
          self-signed X.509 certificate (all checks pass).{" "}
          <em>unsigned-sample.har</em> — synthetic crypto data (certificate
          fails DER validation).{" "}
          <em>corrupted-not-xml.har</em> and{" "}
          <em>corrupted-bad-base64.har</em> — intentionally malformed to
          demonstrate decode error messages.
        </aside>
      </main>
    </div>
  );
}
