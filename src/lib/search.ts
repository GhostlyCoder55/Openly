import Fuse from "fuse.js";
import { categories, formats, guides, software } from "../data";
import type { Format } from "../data/types";
import { extensionCandidates, longestKnownExtension, normalizeLookupText } from "./extensions";

export type SearchMatch =
  | "exact-extension"
  | "exact-name"
  | "exact-software"
  | "exact-category"
  | "associated"
  | "partial"
  | "fuzzy";

export interface SearchHit {
  type: "format" | "software" | "category" | "guide";
  id: string;
  title: string;
  description: string;
  href: string;
  score: number;
  match: SearchMatch;
  ambiguous: boolean;
  extension?: string;
  ambiguityNote?: string;
}

interface SearchDocument {
  type: SearchHit["type"];
  id: string;
  title: string;
  text: string;
  href: string;
  description: string;
}

const documents: SearchDocument[] = [
  ...formats.map((format) => ({
    type: "format" as const,
    id: format.id,
    title: format.name,
    description: format.description,
    href: `/formats/${format.id}`,
    text: [
      format.name,
      format.description,
      ...(format.aliases ?? []),
      ...(format.commonUses ?? []),
      ...format.extensions,
    ].join(" "),
  })),
  ...software.map((item) => ({
    type: "software" as const,
    id: item.id,
    title: item.name,
    description: item.description,
    href: `/software/${item.slug}`,
    text: [item.name, item.description, ...(item.aliases ?? [])].join(" "),
  })),
  ...categories.map((category) => ({
    type: "category" as const,
    id: category.id,
    title: category.name,
    description: category.description,
    href: `/categories/${category.id}`,
    text: [category.name, category.description, ...category.aliases].join(" "),
  })),
  ...guides.map((guide) => ({
    type: "guide" as const,
    id: guide.slug,
    title: guide.title,
    description: guide.summary,
    href: `/field-guide/${guide.slug}`,
    text: [guide.title, guide.summary, guide.topic, guide.what].join(" "),
  })),
];

const fuse = new Fuse(documents, {
  keys: [
    { name: "title", weight: 0.6 },
    { name: "text", weight: 0.4 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2,
  includeScore: true,
});

function formatHit(
  format: Format,
  score: number,
  match: SearchMatch,
  extension?: string,
): SearchHit {
  const shared = extension ? formats.filter((item) => item.extensions.includes(extension)).length > 1 : false;
  return {
    type: "format",
    id: format.id,
    title: format.name,
    description: format.description,
    href: `/formats/${format.id}`,
    score,
    match,
    ambiguous: Boolean(format.ambiguous) || shared,
    ...(extension ? { extension } : {}),
    ...(format.ambiguityNote ? { ambiguityNote: format.ambiguityNote } : {}),
  };
}

export function search(raw: string, limit = 12): SearchHit[] {
  const query = normalizeLookupText(raw);
  if (!query) return [];

  const hits = new Map<string, SearchHit>();
  const add = (hit: SearchHit) => {
    const key = `${hit.type}:${hit.id}`;
    const previous = hits.get(key);
    if (!previous || hit.score > previous.score) hits.set(key, hit);
  };

  const known = longestKnownExtension(query);
  const suppressed = new Set<string>();
  if (known && known.extension.includes(".")) {
    for (const candidate of extensionCandidates(query)) {
      if (candidate !== known.extension && known.extension.endsWith(candidate)) suppressed.add(candidate);
    }
  }

  if (known) {
    for (const format of known.formats) {
      add(formatHit(format, 100, "exact-extension", known.extension));
    }
  } else {
    const bare = query.replace(/^\./, "");
    const bareMatches = formats.filter((format) => format.extensions.includes(bare));
    if (bareMatches.length > 0 && !query.includes(" ")) {
      for (const format of bareMatches) add(formatHit(format, 100, "exact-extension", bare));
    }
  }

  for (const format of formats) {
    const names = [format.name, ...(format.aliases ?? [])].map((value) => value.toLowerCase());
    if (names.includes(query)) {
      add(formatHit(format, format.name.toLowerCase() === query ? 96 : 90, "exact-name"));
    } else if (query.length >= 3 && format.name.toLowerCase().includes(query)) {
      add(formatHit(format, 78, "partial"));
    }
  }

  for (const item of software) {
    const names = [item.name, ...(item.aliases ?? [])].map((value) => value.toLowerCase());
    const exact = names.includes(query);
    const prefix = item.name.toLowerCase().startsWith(query) && query.length >= 2;
    if (!exact && !prefix) continue;
    add({
      type: "software",
      id: item.id,
      title: item.name,
      description: item.description,
      href: `/software/${item.slug}`,
      score: exact ? 95 : 84,
      match: exact ? "exact-software" : "partial",
      ambiguous: false,
    });
    if (exact || (prefix && query.length >= 4)) {
      const related = formats.filter((format) => format.support.some((link) => link.softwareId === item.id)).slice(0, 3);
      for (const format of related) add(formatHit(format, 64, "associated"));
    }
  }

  for (const category of categories) {
    const names = [category.name, ...category.aliases].map((value) => value.toLowerCase());
    if (!names.includes(query)) continue;
    add({
      type: "category",
      id: category.id,
      title: category.name,
      description: category.description,
      href: `/categories/${category.id}`,
      score: 93,
      match: "exact-category",
      ambiguous: false,
    });
  }

  for (const guide of guides) {
    if (query.length < 4) continue;
    if (!`${guide.title} ${guide.topic}`.toLowerCase().includes(query)) continue;
    add({
      type: "guide",
      id: guide.slug,
      title: guide.title,
      description: guide.summary,
      href: `/field-guide/${guide.slug}`,
      score: 72,
      match: "partial",
      ambiguous: false,
    });
  }

  if (query.length >= 2) {
    for (const result of fuse.search(query, { limit: 8 })) {
      const document = result.item;
      if ((result.score ?? 1) > 0.22) continue;
      const score = Math.round((1 - (result.score ?? 1)) * 58);
      if (document.type === "format") {
        const format = formats.find((item) => item.id === document.id);
        if (!format) continue;
        if (format.extensions.some((extension) => suppressed.has(extension)) && !format.extensions.includes(known?.extension ?? "")) {
          continue;
        }
        add(formatHit(format, score, "fuzzy"));
      } else {
        add({
          type: document.type,
          id: document.id,
          title: document.title,
          description: document.description,
          href: document.href,
          score,
          match: "fuzzy",
          ambiguous: false,
        });
      }
    }
  }

  return [...hits.values()]
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
    .slice(0, limit);
}

export function destinationForQuery(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "/formats";
  const hits = search(trimmed, 8);
  if (hits.length === 0) return `/formats?q=${encodeURIComponent(trimmed)}`;
  const exact = hits.filter((hit) => hit.match === "exact-extension" && hit.extension);
  const extension = exact[0]?.extension;
  if (exact.length > 1 && extension) return `/formats/${extension}`;
  return hits[0]?.href ?? `/formats?q=${encodeURIComponent(trimmed)}`;
}
