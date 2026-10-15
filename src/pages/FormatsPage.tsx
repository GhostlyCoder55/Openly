import { Link, useSearchParams } from "react-router";
import { SearchField } from "../components/SearchField";
import { usePageMeta } from "../components/PageMeta";
import { categories, formats } from "../data";
import { search } from "../lib/search";

export function FormatsPage() {
  const [params] = useSearchParams();
  const query = params.get("q") ?? "";
  usePageMeta(
    query ? `Search “${query}” — Openly` : "Formats — Openly",
    "Search the local catalog of file formats by extension, filename, name, or description.",
  );
  const hits = query.trim() ? search(query, 30) : [];
  const formatHits = hits.filter((hit) => hit.type === "format");
  const otherHits = hits.filter((hit) => hit.type !== "format");
  const ambiguous = formatHits.some((hit) => hit.ambiguous && hit.match === "exact-extension");

  return (
    <div>
      <h1 className="text-3xl font-semibold">Formats</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Search an extension, a filename, a format name, or a description. Results come from the catalog in this app.
      </p>
      <div className="mt-5">
        <SearchField initialQuery={query} />
      </div>
      <ul className="mt-4 flex flex-wrap gap-2">
        {categories.map((category) => (
          <li key={category.id}>
            <Link className="rounded-full border border-line bg-surface px-3 py-1 text-sm hover:border-tide" to={`/categories/${category.id}`}>
              {category.name}
            </Link>
          </li>
        ))}
      </ul>

      {query.trim() ? (
        <div className="mt-8">
          {hits.length === 0 ? (
            <div role="status" className="rounded-2xl border border-line bg-surface p-5">
              <h2 className="text-xl font-semibold">No format matched “{query.trim()}”</h2>
              <p className="mt-2 text-muted">
                Check the spelling, or search the extension by itself, for example .pdf. You can also browse categories or identify a file locally. A filename alone is not proof of a file type, and Openly will not invent a result.
              </p>
              <p className="mt-3">
                <Link className="text-accent" to="/#identify">
                  Identify a file on this device
                </Link>
              </p>
            </div>
          ) : (
            <>
              {ambiguous ? (
                <p className="mb-4 rounded-xl border border-warning/40 bg-surface px-4 py-3 text-warning" role="status">
                  This extension is ambiguous. Openly is not treating one interpretation as certain.
                </p>
              ) : null}
              <h2 className="text-lg font-semibold">{hits.length} results</h2>
              <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface">
                {[...formatHits, ...otherHits].map((hit) => (
                  <li key={`${hit.type}-${hit.id}`}>
                    <Link className="block px-4 py-3 hover:bg-raised" to={hit.href}>
                      <span className="font-semibold">{hit.title}</span>
                      <span className="ml-2 text-sm text-tide">{hit.type}</span>
                      <span className="mt-1 block text-sm text-muted">{hit.description}</span>
                      {hit.ambiguityNote ? <span className="mt-1 block text-sm text-warning">{hit.ambiguityNote}</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {categories.map((category) => {
            const items = formats.filter((format) => format.category === category.id);
            return (
              <section key={category.id} aria-labelledby={`cat-${category.id}`}>
                <h2 id={`cat-${category.id}`} className="text-xl font-semibold">
                  <Link className="hover:text-accent" to={`/categories/${category.id}`}>
                    {category.name}
                  </Link>
                </h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {items.map((format) => (
                    <li key={format.id}>
                      <Link className="block rounded-xl border border-line bg-surface px-3 py-2 hover:border-tide" to={`/formats/${format.id}`}>
                        <span className="font-semibold">{format.name}</span>
                        <span className="ml-2 text-sm text-muted">.{format.extensions[0]}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
