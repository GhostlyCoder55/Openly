import { Link, useParams } from "react-router";
import { CompatibilityTable } from "../components/CompatibilityTable";
import { usePageMeta } from "../components/PageMeta";
import { categories, getFormat, software } from "../data";
import type { Signature } from "../data/types";
import { resolveFormatParam } from "../lib/formats";
import { formatExtensionList, standardizationLabels } from "../lib/labels";
import { NotFoundPage } from "./NotFoundPage";

function signatureText(signature: Signature): string {
  if (signature.kind === "scan") {
    return `${signature.label}: the text “${signature.text}” within the first ${signature.within} bytes${signature.optional ? " (optional)" : ""}`;
  }
  return `${signature.label}: ${signature.pattern} at byte ${signature.offset}${signature.optional ? " (optional)" : ""}`;
}

export function FormatPage() {
  const params = useParams();
  const raw = params.extension ?? params["*"] ?? "";
  const resolution = resolveFormatParam(raw);
  const title =
    resolution.kind === "one"
      ? `${resolution.format.name} — Openly`
      : resolution.kind === "many"
        ? `.${resolution.extension} can mean more than one format — Openly`
        : "Format not found — Openly";
  const description =
    resolution.kind === "one"
      ? resolution.format.description
      : resolution.kind === "many"
        ? `The .${resolution.extension} extension is used by more than one format.`
        : "That extension or format is not in the catalog.";
  usePageMeta(title, description);

  if (resolution.kind === "missing") {
    return (
      <NotFoundPage
        title="Format not found"
        message="That extension or format is not in the catalog. Try the search, or browse by category."
      />
    );
  }

  if (resolution.kind === "many") {
    return <Disambiguation extension={resolution.extension} formats={resolution.formats} />;
  }

  const format = resolution.format;
  const category = categories.find((item) => item.id === format.category);
  const rows = format.support.flatMap((link) => {
    const app = software.find((item) => item.id === link.softwareId);
    return app ? [{ software: app, link }] : [];
  });
  const signatureList = [...(format.signatures ?? []), ...(format.container ? [format.container] : [])];

  return (
    <article>
      <p className="text-sm text-muted">
        <Link className="text-accent" to="/formats">
          Formats
        </Link>
        {category ? (
          <>
            {" / "}
            <Link className="text-accent" to={`/categories/${category.id}`}>
              {category.name}
            </Link>
          </>
        ) : null}
      </p>
      <p className="mt-3 text-tide">{formatExtensionList(format.extensions)}</p>
      <h1 className="mt-1 text-4xl font-semibold">{format.name}</h1>
      <p className="mt-2 text-sm text-muted">{standardizationLabels[format.standardization]} · Last verified {format.lastVerified}</p>
      {format.ambiguous && format.ambiguityNote ? (
        <p className="mt-4 rounded-xl border border-warning/40 bg-surface px-4 py-3 text-warning" role="note">
          {format.ambiguityNote}
        </p>
      ) : null}
      <p className="mt-5 max-w-3xl text-lg">{format.description}</p>

      {format.commonUses && format.commonUses.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Typical uses</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {format.commonUses.map((use) => (
              <li key={use}>{use}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {format.mimeTypes && format.mimeTypes.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">MIME types</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {format.mimeTypes.map((type) => (
              <li key={type} className="rounded-full bg-raised px-3 py-1 font-mono text-sm">
                {type}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {signatureList.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Signatures</h2>
          {format.signatureNote ? <p className="mt-2 text-muted">{format.signatureNote}</p> : null}
          <ul className="mt-2 space-y-2">
            {signatureList.map((signature) => (
              <li key={signatureText(signature)} className="rounded-xl bg-surface px-3 py-2 font-mono text-sm">
                {signatureText(signature)}
              </li>
            ))}
          </ul>
        </section>
      ) : format.signatureNote ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Signatures</h2>
          <p className="mt-2 text-muted">{format.signatureNote}</p>
        </section>
      ) : null}

      {rows.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Applications</h2>
          <p className="mt-2 text-sm text-muted">
            Opens, previews, edits, creates, and converts are different claims. Partial support is not full compatibility.
          </p>
          <div className="mt-3">
            <CompatibilityTable rows={rows} />
          </div>
        </section>
      ) : null}

      {format.conversionNotes ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Conversion</h2>
          <p className="mt-2 max-w-3xl">{format.conversionNotes}</p>
        </section>
      ) : null}

      {format.compatibilityIssues && format.compatibilityIssues.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Compatibility issues</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {format.compatibilityIssues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {format.safetyNotes && format.safetyNotes.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Safety</h2>
          <ul className="mt-3 space-y-3">
            {format.safetyNotes.map((note) => (
              <li key={note.title} className="rounded-xl border border-line bg-surface p-4">
                <h3 className="font-semibold text-warning">{note.title}</h3>
                <p className="mt-1">{note.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {format.relatedFormatIds && format.relatedFormatIds.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Related formats</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {format.relatedFormatIds.map((id) => (
              <li key={id}>
                <Link className="rounded-full bg-raised px-3 py-1 text-accent" to={`/formats/${id}`}>
                  {getFormat(id)?.name ?? id}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Sources</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {format.sources.map((source) => (
            <li key={source.url}>
              <a className="text-accent" href={source.url} rel="noreferrer noopener" target="_blank">
                {source.title}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}

function Disambiguation({
  extension,
  formats,
}: {
  extension: string;
  formats: Array<{ id: string; name: string; description: string; ambiguityNote?: string }>;
}) {
  return (
    <article>
      <h1 className="text-3xl font-semibold">Several formats use .{extension}</h1>
      <p className="mt-3 max-w-2xl text-muted" role="status">
        Openly will not pick one interpretation and present it as certain. Choose the record that matches the file you have.
      </p>
      <ul className="mt-6 space-y-3">
        {formats.map((format) => (
          <li key={format.id}>
            <Link className="block rounded-2xl border border-line bg-surface p-4 hover:border-tide" to={`/formats/${format.id}`}>
              <h2 className="text-xl font-semibold">{format.name}</h2>
              <p className="mt-2 text-muted">{format.description}</p>
              {format.ambiguityNote ? <p className="mt-2 text-warning">{format.ambiguityNote}</p> : null}
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
