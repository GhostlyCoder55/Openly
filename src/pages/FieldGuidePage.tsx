import { Link, useNavigate } from "react-router";
import { usePageMeta } from "../components/PageMeta";
import { guides } from "../data";

export function FieldGuidePage() {
  const navigate = useNavigate();
  usePageMeta("Field Guide — Openly", "Short entries on unusual, historical, and easily confused file formats.");

  function surprise() {
    const index = crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
    const guide = guides[index % guides.length];
    if (guide) navigate(`/field-guide/${guide.slug}`);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Field Guide</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Notes on formats that are easy to misread: forgotten image types, tracker music, compound extensions, and files that share a name.
          </p>
        </div>
        <button type="button" className="rounded-xl bg-accent px-4 py-2 font-semibold text-canvas" onClick={surprise}>
          Surprise me
        </button>
      </div>
      <ul className="mt-6 grid gap-3 md:grid-cols-2">
        {guides.map((guide) => (
          <li key={guide.slug}>
            <Link className="block h-full rounded-2xl border border-line bg-surface p-4 hover:border-tide" to={`/field-guide/${guide.slug}`}>
              <p className="text-sm text-tide">{guide.topic}</p>
              <h2 className="mt-1 text-xl font-semibold">{guide.title}</h2>
              <p className="mt-2 text-muted">{guide.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
