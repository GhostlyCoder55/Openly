import { formats } from "../data";
import type { Format } from "../data/types";

export function normalizeLookupText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ").replace(/\s*\.\s*/g, ".");
}

/** Longest compound suffix first, such as tar.gz before gz. */
export function extensionCandidates(input: string): string[] {
  const prepared = normalizeLookupText(input);
  const base = prepared.split(/[/\\]/).pop() ?? prepared;
  if (!base.includes(".")) return [];
  const segments = base.startsWith(".") ? base.slice(1).split(".") : base.split(".");
  const start = base.startsWith(".") ? 0 : 1;
  const candidates: string[] = [];
  for (let index = start; index < segments.length; index += 1) {
    const candidate = segments.slice(index).join(".");
    if (candidate) candidates.push(candidate);
  }
  return candidates.sort((left, right) => right.length - left.length);
}

export function longestKnownExtension(input: string): { extension: string; formats: Format[] } | null {
  for (const extension of extensionCandidates(input)) {
    const matched = formats.filter((format) => format.extensions.includes(extension));
    if (matched.length > 0) return { extension, formats: matched };
  }
  return null;
}

export function formatsForExtension(extension: string): Format[] {
  const key = extension.trim().toLowerCase().replace(/^\./, "");
  return formats.filter((format) => format.extensions.includes(key));
}
