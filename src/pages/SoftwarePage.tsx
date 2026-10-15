import { Link, useSearchParams } from "react-router";
import { usePageMeta } from "../components/PageMeta";
import { CAPABILITIES, PLATFORMS, PRICING, type Capability, type Platform, type Pricing } from "../data/types";
import { filterSoftware, type SoftwareSort } from "../lib/filters";
import { capabilityFilterLabels, platformLabels, pricingLabels } from "../lib/labels";

const sorts: Array<{ id: SoftwareSort; label: string }> = [
  { id: "relevance", label: "Relevance" },
  { id: "free", label: "Free first" },
  { id: "open-source", label: "Open source first" },
  { id: "platforms", label: "Widest platform support" },
];

function isSort(value: string | null): value is SoftwareSort {
  return sorts.some((sort) => sort.id === value);
}

export function SoftwarePage() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const sort: SoftwareSort = isSort(params.get("sort")) ? (params.get("sort") as SoftwareSort) : "relevance";
  const platforms = params.getAll("platform").filter((value): value is Platform => PLATFORMS.includes(value as Platform));
  const pricing = params.getAll("pricing").filter((value): value is Pricing => PRICING.includes(value as Pricing));
  const capabilities = params
    .getAll("capability")
    .filter((value): value is Capability => CAPABILITIES.includes(value as Capability));
  const openSource = params.get("openSource") === "1";
  usePageMeta("Software — Openly", "Find applications by platform, price, source license, and what they can do with a file.");

  const results = filterSoftware({ query, platforms, pricing, capabilities, openSource, sort });

  function toggle(key: string, value: string, checked: boolean) {
    const next = new URLSearchParams(params);
    const current = next.getAll(key).filter((item) => item !== value);
    if (checked) current.push(value);
    next.delete(key);
    for (const item of current) next.append(key, item);
    setParams(next);
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">Software</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Filters use the curated catalog. Platform filters keep applications that support every system you select. Open source is separate from price. There are no ratings or download counts.
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[16rem_1fr]">
        <form
          className="h-max rounded-2xl border border-line bg-surface p-4"
          aria-label="Software filters"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const next = new URLSearchParams(params);
            const text = String(data.get("q") ?? "");
            if (text) next.set("q", text);
            else next.delete("q");
            setParams(next);
          }}
        >
          <label className="block text-sm font-semibold" htmlFor="software-query">
            Search software
          </label>
          <input
            id="software-query"
            name="q"
            key={query}
            defaultValue={query}
            className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2"
            placeholder="Blender, VLC, PDF…"
          />
          <button type="submit" className="mt-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-canvas">
            Search
          </button>

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold">Platforms</legend>
            <p className="text-xs text-muted">Must support every selected platform.</p>
            {PLATFORMS.map((platform) => (
              <label key={platform} className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={platforms.includes(platform)}
                  onChange={(event) => toggle("platform", platform, event.target.checked)}
                />
                {platformLabels[platform]}
              </label>
            ))}
          </fieldset>

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold">Pricing</legend>
            {PRICING.map((value) => (
              <label key={value} className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={pricing.includes(value)}
                  onChange={(event) => toggle("pricing", value, event.target.checked)}
                />
                {pricingLabels[value]}
              </label>
            ))}
          </fieldset>

          <label className="mt-5 flex items-center gap-2">
            <input
              type="checkbox"
              checked={openSource}
              onChange={(event) => {
                const next = new URLSearchParams(params);
                if (event.target.checked) next.set("openSource", "1");
                else next.delete("openSource");
                setParams(next);
              }}
            />
            Open source
          </label>

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold">Capabilities</legend>
            <p className="text-xs text-muted">Must include every selected capability.</p>
            {CAPABILITIES.map((capability) => (
              <label key={capability} className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={capabilities.includes(capability)}
                  onChange={(event) => toggle("capability", capability, event.target.checked)}
                />
                {capabilityFilterLabels[capability]}
              </label>
            ))}
          </fieldset>
        </form>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p role="status">{results.length} applications</p>
            <label className="text-sm">
              Sort{" "}
              <select
                className="rounded-lg border border-line bg-surface px-2 py-1"
                value={sort}
                onChange={(event) => {
                  const next = new URLSearchParams(params);
                  next.set("sort", event.target.value);
                  setParams(next);
                }}
              >
                {sorts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {results.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-line bg-surface p-5" role="status">
              <h2 className="text-xl font-semibold">No applications match these filters</h2>
              <p className="mt-2 text-muted">Clear one of them, or browse the full directory.</p>
              <button type="button" className="mt-3 text-accent" onClick={() => setParams(new URLSearchParams())}>
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {results.map((item) => (
                <li key={item.id} className="rounded-2xl border border-line bg-surface p-4">
                  <h2 className="text-xl font-semibold">
                    <Link className="text-accent" to={`/software/${item.slug}`}>
                      {item.name}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {item.platforms.map((platform) => platformLabels[platform]).join(", ")} · {pricingLabels[item.pricing]} ·{" "}
                    {item.openSource ? "Open source" : "Not open source"}
                  </p>
                  <p className="mt-2">{item.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
