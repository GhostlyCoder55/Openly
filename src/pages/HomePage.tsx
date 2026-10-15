import { Archive, Box, Clapperboard, Code, Cpu, FileText, Gamepad2, Image } from "lucide-react";
import { Link } from "react-router";
import { IdentifyPanel } from "../components/IdentifyPanel";
import { SearchField } from "../components/SearchField";
import { usePageMeta } from "../components/PageMeta";
import { categories, formats, guides } from "../data";
import type { CategoryId } from "../data/types";

const icons: Record<CategoryId, typeof Image> = {
  images: Image,
  "video-audio": Clapperboard,
  documents: FileText,
  archives: Archive,
  development: Code,
  games: Gamepad2,
  "3d-cad": Box,
  system: Cpu,
};

const featuredIds = ["pdf", "heic", "blend", "epub", "pak", "cr3", "sqlite", "wasm"];
const examples = [".heic", ".blend", ".epub", ".pak", ".cr3"];

export function HomePage() {
  usePageMeta(
    "What opens this file? — Openly",
    "Discover what a file format does, which apps can open it, and what to know before you do.",
  );
  const featured = featuredIds.flatMap((id) => {
    const format = formats.find((item) => item.id === id);
    return format ? [format] : [];
  });

  return (
    <div className="flex flex-col gap-12">
      <section className="mx-auto w-full max-w-3xl text-center" aria-labelledby="hero-title">
        <h1 id="hero-title" className="text-4xl font-semibold tracking-tight sm:text-5xl">
          What opens this file?
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-balance text-lg text-muted">
          Discover what a file format does, which apps can open it, and what to know before you do.
        </p>
        <div className="mt-6 text-left">
          <SearchField autoFocus />
        </div>
        <p className="mt-4 text-sm text-muted">
          {examples.map((example, index) => (
            <span key={example}>
              {index > 0 ? " · " : ""}
              <Link className="text-accent" to={`/formats/${example.slice(1)}`}>
                {example}
              </Link>
            </span>
          ))}
        </p>
      </section>

      <IdentifyPanel />

      <section aria-labelledby="categories-title">
        <h2 id="categories-title" className="text-2xl font-semibold">
          Browse by category
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = icons[category.id];
            return (
              <li key={category.id}>
                <Link to={`/categories/${category.id}`} className="block h-full rounded-2xl border border-line bg-surface p-4 hover:border-tide">
                  <Icon aria-hidden="true" className="text-accent" size={22} />
                  <h3 className="mt-3 font-semibold">{category.name}</h3>
                  <p className="mt-1 text-sm text-muted">{category.description}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="featured-title">
        <h2 id="featured-title" className="text-2xl font-semibold">
          Featured formats
        </h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {featured.map((format) => (
            <li key={format.id}>
              <Link to={`/formats/${format.id}`} className="block rounded-2xl border border-line bg-surface p-4 hover:border-tide">
                <p className="text-sm text-tide">.{format.extensions[0]}</p>
                <h3 className="font-semibold">{format.name}</h3>
                <p className="mt-1 line-clamp-3 text-sm text-muted">{format.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="guide-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="guide-title" className="text-2xl font-semibold">
            Field Guide
          </h2>
          <Link className="text-accent" to="/field-guide">
            Browse the guide
          </Link>
        </div>
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {guides.slice(0, 3).map((guide) => (
            <li key={guide.slug}>
              <Link to={`/field-guide/${guide.slug}`} className="block h-full rounded-2xl border border-line bg-surface p-4 hover:border-tide">
                <p className="text-sm text-tide">{guide.topic}</p>
                <h3 className="mt-1 font-semibold">{guide.title}</h3>
                <p className="mt-2 text-sm text-muted">{guide.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
