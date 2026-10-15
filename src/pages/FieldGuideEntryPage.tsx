import { Link, useNavigate, useParams } from "react-router";
import { usePageMeta } from "../components/PageMeta";
import { getFormat, getGuide, guides } from "../data";
import { NotFoundPage } from "./NotFoundPage";

export function FieldGuideEntryPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const guide = getGuide(slug);
  usePageMeta(guide ? `${guide.title} — Openly` : "Entry not found — Openly", guide?.summary ?? "That field guide entry is not in the catalog.");

  if (!guide) return <NotFoundPage title="Entry not found" message="That field guide entry is not in the catalog." />;

  function surprise() {
    const pool = guides.filter((item) => item.slug !== guide?.slug);
    const index = crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
    const next = pool[index % pool.length];
    if (next) navigate(`/field-guide/${next.slug}`);
  }

  return (
    <article>
      <p className="text-sm">
        <Link className="text-accent" to="/field-guide">
          Field Guide
        </Link>
      </p>
      <p className="mt-3 text-sm text-tide">{guide.topic}</p>
      <h1 className="mt-1 text-4xl font-semibold">{guide.title}</h1>
      <p className="mt-3 max-w-3xl text-lg">{guide.summary}</p>
      <button type="button" className="mt-4 rounded-lg border border-line px-3 py-2" onClick={surprise}>
        Surprise me
      </button>
      <Section title="What it is" body={guide.what} />
      <Section title="What it was designed for" body={guide.designedFor} />
      <Section title="Where it shows up" body={guide.encountered} />
      <Section title="What can open it today" body={guide.openToday} />
      <Section title="Compatibility and safety" body={guide.considerations} />
      <section className="mt-8">
        <h2 className="text-xl font-semibold">Related formats</h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {guide.relatedFormatIds.map((id) => {
            const format = getFormat(id);
            return (
              <li key={id}>
                <Link className="rounded-full bg-raised px-3 py-1 text-accent" to={`/formats/${id}`}>
                  {format?.name ?? id}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="text-xl font-semibold">Sources</h2>
        <ul className="mt-2 list-disc pl-5">
          {guide.sources.map((source) => (
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

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-3xl">{body}</p>
    </section>
  );
}
