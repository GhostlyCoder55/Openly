import type {
  Capability,
  Format,
  SafetyNote,
  Signature,
  Software,
  SoftwareSupport,
  Source,
  SupportLevel,
} from "./types";

export const LAST_VERIFIED = "2026-10-15";

export function source(title: string, url: string): Source {
  return { title, url };
}

export function iana(mediaType: string): Source {
  return source(
    `IANA media type: ${mediaType}`,
    `https://www.iana.org/assignments/media-types/${mediaType}`,
  );
}

export function support(
  softwareId: string,
  level: SupportLevel,
  capabilities: Capability[],
  notes?: string,
): SoftwareSupport {
  return notes
    ? { softwareId, level, capabilities, notes }
    : { softwareId, level, capabilities };
}

export function bytes(
  offset: number,
  pattern: string,
  label: string,
  optional = false,
): Signature {
  return optional
    ? { kind: "bytes", offset, pattern, label, optional }
    : { kind: "bytes", offset, pattern, label };
}

export function scan(
  text: string,
  within: number,
  label: string,
  optional = false,
): Signature {
  return optional
    ? { kind: "scan", text, within, label, optional }
    : { kind: "scan", text, within, label };
}

export function safety(title: string, detail: string): SafetyNote {
  return { title, detail };
}

export function format(entry: Omit<Format, "lastVerified">): Format {
  return { lastVerified: LAST_VERIFIED, ...entry };
}

export function app(entry: Omit<Software, "lastVerified">): Software {
  return { lastVerified: LAST_VERIFIED, ...entry };
}
