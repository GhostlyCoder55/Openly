import { Link, useParams } from "react-router";
import { usePageMeta } from "../components/PageMeta";
import { formatsForSoftware, getSoftware } from "../data";
import { capabilityLabels, levelLabels, platformLabels, pricingLabels } from "../lib/labels";
import { NotFoundPage } from "./NotFoundPage";

export function SoftwareDetailPage() {
  const { slug = "" } = useParams();
  const item = getSoftware(slug);
  usePageMeta(item ? `${item.name} — Openly` : "Software not found — Openly", item?.description ?? "That application is not in the catalog.");
  if (!item) return <NotFoundPage title="Software not found" message="That application is not in the catalog." />;
  const supported = formatsForSoftware(item.id);
  return (
    <article>
      <p className="text-sm">
        <Link className="text-accent" to="/software">
          Software
        </Link>
      </p>
      <h1 className="mt-2 text-4xl font-semibold">{item.name}</h1>
      <p className="mt-3 max-w-3xl text-lg">{item.description}</p>
      <dl className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-surface p-4">
          <dt className="text-sm text-muted">Platforms</dt>
          <dd>{item.platforms.map((platform) => platformLabels[platform]).join(", ")}</dd>
        </div>
        <div className="rounded-xl bg-surface p-4">
          <dt className="text-sm text-muted">Pricing</dt>
          <dd>{pricingLabels[item.pricing]}</dd>
        </div>
        <div className="rounded-xl bg-surface p-4">
          <dt className="text-sm text-muted">Open source</dt>
          <dd>{item.openSource ? "Yes" : "No"}</dd>
        </div>
        <div className="rounded-xl bg-surface p-4">
          <dt className="text-sm text-muted">Capabilities</dt>
          <dd>{item.capabilities.map((capability) => capabilityLabels[capability]).join(", ")}</dd>
        </div>
      </dl>
      <p className="mt-4">
        <a className="text-accent" href={item.officialUrl} rel="noreferrer noopener" target="_blank">
          Official website
        </a>
        <span className="text-muted"> · Last verified {item.lastVerified}</span>
      </p>
      <section className="mt-8">
        <h2 className="text-xl font-semibold">Formats</h2>
        {supported.length === 0 ? <p className="mt-2 text-muted">No format links are recorded for this application.</p> : null}
        <ul className="mt-3 space-y-2">
          {supported.map((format) => {
            const link = format.support.find((entry) => entry.softwareId === item.id);
            return (
              <li key={format.id} className="rounded-xl border border-line bg-surface px-4 py-3">
                <Link className="font-semibold text-accent" to={`/formats/${format.id}`}>
                  {format.name}
                </Link>
                <span className="ml-2 text-sm text-muted">.{format.extensions[0]}</span>
                {link ? (
                  <p className="mt-1 text-sm text-muted">
                    {levelLabels[link.level]} · {link.capabilities.map((capability) => capabilityLabels[capability]).join(", ")}
                    {link.notes ? ` · ${link.notes}` : ""}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
      <section className="mt-8">
        <h2 className="text-xl font-semibold">Sources</h2>
        <ul className="mt-2 list-disc pl-5">
          {item.sources.map((source) => (
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
