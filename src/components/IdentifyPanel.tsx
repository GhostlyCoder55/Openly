import { useId, useState } from "react";
import { Link } from "react-router";
import { identifyFile, type IdentifyResult } from "../lib/identify";

const tone: Record<IdentifyResult["status"], string> = {
  "signature-match": "border-accent",
  "extension-recognized": "border-tide",
  "possible-mismatch": "border-warning",
  "unable-to-identify": "border-line",
};

export function IdentifyPanel() {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [extra, setExtra] = useState<string | null>(null);

  async function inspect(file: File | undefined, extraNote?: string) {
    if (!file) return;
    setExtra(extraNote ?? null);
    setResult(await identifyFile(file));
  }

  return (
    <section id="identify" aria-labelledby="identify-title" className="rounded-2xl border border-line bg-surface p-5">
      <h2 id="identify-title" className="text-xl font-semibold">
        Have a file? Identify its format on your device. Your file stays local.
      </h2>
      <p className="mt-2 text-muted">
        This step is optional. Openly reads the filename and at most the first 33,000 bytes in your browser, then drops them. It does not upload the file, keep a copy, or open it in another application.
      </p>
      <div
        className={`mt-4 rounded-xl border border-dashed p-5 ${dragging ? "border-accent bg-raised" : "border-line"}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const files = [...event.dataTransfer.files];
          const note = files.length > 1 ? "Only the first file was identified." : undefined;
          void inspect(files[0], note);
        }}
      >
        <label htmlFor={inputId} className="inline-flex cursor-pointer rounded-lg bg-raised px-4 py-2 font-semibold">
          Choose a file
        </label>
        <input
          id={inputId}
          className="sr-only"
          type="file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            void inspect(file);
            event.target.value = "";
          }}
        />
        <p className="mt-3 text-sm text-muted">Or drop a file here. Identification can be wrong when an extension is shared or a signature is missing.</p>
      </div>
      {result ? (
        <div className={`mt-4 rounded-xl border p-4 ${tone[result.status]}`} aria-live="polite">
          <p className="text-sm text-muted">File name used for this check: {result.filename}</p>
          <h3 className="mt-1 text-lg font-semibold">{result.headline}</h3>
          <p className="mt-2">{result.explanation}</p>
          {result.caution ? <p className="mt-2 text-warning">{result.caution}</p> : null}
          {extra ? <p className="mt-2 text-sm text-muted">{extra}</p> : null}
          {result.formats.length > 0 ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {result.formats.map((format) => (
                <li key={format.id}>
                  <Link className="rounded-full bg-raised px-3 py-1 text-accent" to={format.href}>
                    {format.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          {result.conflicts.length > 0 ? (
            <p className="mt-3 text-sm">
              Bytes also consistent with{" "}
              {result.conflicts.map((format, index) => (
                <span key={format.id}>
                  {index > 0 ? ", " : ""}
                  <Link className="text-accent" to={format.href}>
                    {format.name}
                  </Link>
                </span>
              ))}
              .
            </p>
          ) : null}
          {result.mimeTypes.length > 0 ? (
            <p className="mt-3 text-sm text-muted">Known MIME types: {result.mimeTypes.join(", ")}</p>
          ) : null}
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
            {result.limitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm">{result.antivirusNotice}</p>
          <button type="button" className="mt-3 text-sm text-accent" onClick={() => setResult(null)}>
            Clear result
          </button>
        </div>
      ) : null}
    </section>
  );
}
