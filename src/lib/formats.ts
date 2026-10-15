import { formats, getFormat } from "../data";
import type { Format } from "../data/types";

export type FormatResolution =
  | { kind: "one"; format: Format }
  | { kind: "many"; extension: string; formats: Format[] }
  | { kind: "missing" };

export function resolveFormatParam(param: string): FormatResolution {
  let key = param;
  try {
    key = decodeURIComponent(param);
  } catch {
    key = param;
  }
  key = key.trim().toLowerCase().replace(/^\./, "");
  if (!key) return { kind: "missing" };
  const byId = getFormat(key);
  if (byId) return { kind: "one", format: byId };
  const matched = formats.filter((format) => format.extensions.includes(key));
  if (matched.length === 1 && matched[0]) return { kind: "one", format: matched[0] };
  if (matched.length > 1) return { kind: "many", extension: key, formats: matched };
  return { kind: "missing" };
}

export function formatHref(format: Format): string {
  return `/formats/${format.id}`;
}
