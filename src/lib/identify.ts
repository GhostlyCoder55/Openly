import { formats } from "../data";
import type { Format, Signature } from "../data/types";
import { formatHref } from "./formats";
import { longestKnownExtension } from "./extensions";

export const MAX_SIGNATURE_BYTES = 33_000;

export const ANTIVIRUS_NOTICE =
  "Openly is not an antivirus or malware scanner. A result is not a safety verdict. The file was read locally and was not uploaded.";

export type IdentifyStatus =
  | "extension-recognized"
  | "signature-match"
  | "possible-mismatch"
  | "unable-to-identify";

export interface LocalFileSource {
  name: string;
  size: number;
  slice(start: number, end: number): { arrayBuffer(): Promise<ArrayBuffer> };
}

export interface IdentifiedFormat {
  id: string;
  name: string;
  href: string;
  signature: "match" | "mismatch" | "unavailable" | "inconclusive";
  via: "signature" | "container" | "none";
}

export interface IdentifyResult {
  status: IdentifyStatus;
  filename: string;
  extension: string | null;
  ambiguous: boolean;
  formats: IdentifiedFormat[];
  conflicts: IdentifiedFormat[];
  headline: string;
  explanation: string;
  limitations: string[];
  caution: string | null;
  mimeTypes: string[];
  antivirusNotice: string;
}

type EvalState = "match" | "mismatch" | "unavailable" | "inconclusive";

interface Evaluation {
  format: Format;
  state: EvalState;
  via: "signature" | "container" | "none";
}

const familyNotes: Record<NonNullable<Format["containerFamily"]>, string> = {
  zip: "ZIP is also the container for DOCX, EPUB, APK, JAR, and other formats. The extension distinguishes them. Openly does not unpack archives.",
  ole: "This OLE compound header is shared by several legacy Office documents and by Windows Installer packages. The extension is what distinguishes them.",
  gzip: "A gzip header looks the same for a single .gz file and for a .tar.gz archive. Openly does not decompress the stream, so it cannot see what is inside.",
  ogg: "OggS identifies an Ogg container. The codec inside, such as Vorbis or Opus, needs a closer look than this header check.",
  ebml: "This EBML header is shared by Matroska and WebM. The doctype and the extension distinguish them.",
  "iso-bmff": "This is an ISO base-media container, the family used by MP4, MOV, HEIC, AVIF, and others. The brand and the extension distinguish them.",
  riff: "RIFF is a shared container. The form type distinguishes WAV, AVI, and WebP.",
  pe: "The MZ header is shared by Windows executables and DLLs. It is not a statement that the program is safe to run.",
  elf: "ELF is the binary format used by Linux programs and shared libraries. Openly does not load it.",
  pdf: "A PDF header is also how many modern Illustrator files begin. The extension is what distinguishes a general PDF from an AI file.",
};

function isScan(signature: Signature): signature is Extract<Signature, { kind: "scan" }> {
  return signature.kind === "scan";
}

function patternTokens(pattern: string): string[] {
  return pattern.trim().split(/\s+/).filter(Boolean);
}

export function signatureMatches(signature: Signature, bytes: Uint8Array): boolean {
  if (isScan(signature)) {
    const window = bytes.subarray(0, Math.min(bytes.length, signature.within));
    const needle = new TextEncoder().encode(signature.text);
    if (needle.length === 0 || window.length < needle.length) return false;
    for (let index = 0; index <= window.length - needle.length; index += 1) {
      let found = true;
      for (let offset = 0; offset < needle.length; offset += 1) {
        if (window[index + offset] !== needle[offset]) {
          found = false;
          break;
        }
      }
      if (found) return true;
    }
    return false;
  }
  const tokens = patternTokens(signature.pattern);
  if (signature.offset < 0 || signature.offset + tokens.length > bytes.length) return false;
  return tokens.every((token, index) => token === "??" || bytes[signature.offset + index] === Number.parseInt(token, 16));
}

function signatureReadable(signature: Signature, size: number): boolean {
  if (isScan(signature)) return size >= new TextEncoder().encode(signature.text).length;
  return size >= signature.offset + patternTokens(signature.pattern).length;
}

function evaluateList(logic: "any" | "all", signatures: Signature[], bytes: Uint8Array, size: number): EvalState {
  const required = signatures.filter((signature) => !signature.optional);
  if (logic === "all") {
    if (required.length === 0) return "inconclusive";
    if (required.every((signature) => signatureMatches(signature, bytes))) return "match";
    if (required.some((signature) => !signatureReadable(signature, size))) return "inconclusive";
    return "mismatch";
  }
  if (required.some((signature) => signatureMatches(signature, bytes))) return "match";
  const optionalHit = signatures.some((signature) => signature.optional && signatureMatches(signature, bytes));
  if (required.length === 0) return optionalHit ? "match" : "inconclusive";
  if (required.some((signature) => !signatureReadable(signature, size)) && !required.some((signature) => signatureReadable(signature, size))) {
    return "inconclusive";
  }
  if (!required.some((signature) => signatureReadable(signature, size))) return "inconclusive";
  return "mismatch";
}

function evaluate(format: Format, bytes: Uint8Array, size: number): Evaluation {
  const signatures = format.signatures ?? [];
  if (signatures.length > 0) {
    const state = evaluateList(format.signatureLogic ?? "any", signatures, bytes, size);
    return { format, state, via: "signature" };
  }
  if (format.container) {
    if (signatureMatches(format.container, bytes)) return { format, state: "match", via: "container" };
    if (signatureReadable(format.container, size)) return { format, state: "mismatch", via: "container" };
    return { format, state: "inconclusive", via: "container" };
  }
  return { format, state: "unavailable", via: "none" };
}

function present(evaluation: Evaluation): IdentifiedFormat {
  return {
    id: evaluation.format.id,
    name: evaluation.format.name,
    href: formatHref(evaluation.format),
    signature: evaluation.state,
    via: evaluation.via,
  };
}

function baseResult(filename: string, limitations: string[]): Omit<IdentifyResult, "status" | "headline" | "explanation" | "caution" | "formats" | "conflicts" | "extension" | "ambiguous" | "mimeTypes"> {
  return { filename, limitations, antivirusNotice: ANTIVIRUS_NOTICE };
}

function unable(filename: string, explanation: string, limitations: string[], extension: string | null): IdentifyResult {
  return {
    ...baseResult(filename, limitations),
    status: "unable-to-identify",
    headline: "Unable to identify",
    explanation,
    extension,
    ambiguous: false,
    formats: [],
    conflicts: [],
    caution: null,
    mimeTypes: [],
  };
}

export async function identifyFile(file: LocalFileSource): Promise<IdentifyResult> {
  const filename = file.name.split(/[/\\]/).pop() || "untitled";
  const limitations = [
    "Only a bounded header was considered. Openly does not parse entire files, unpack archives, decompress streams, or check that a file is complete.",
  ];
  if (!Number.isFinite(file.size) || file.size < 0) {
    return unable(filename, "The file size could not be read. Nothing was uploaded.", limitations, null);
  }
  if (file.size > MAX_SIGNATURE_BYTES) {
    limitations.push(`Only the first ${MAX_SIGNATURE_BYTES.toLocaleString("en-US")} bytes were read. The rest of the file stayed on your device and was not inspected.`);
  }
  const known = longestKnownExtension(filename);
  if (file.size === 0) {
    const extensionNote = known
      ? ` The name ends in .${known.extension}, which is in the catalog, but an empty file has no bytes to compare.`
      : "";
    return unable(
      filename,
      `This file is empty, so there is not enough evidence to identify it.${extensionNote}`,
      limitations,
      known?.extension ?? null,
    );
  }

  let bytes: Uint8Array;
  try {
    const end = Math.min(file.size, MAX_SIGNATURE_BYTES);
    const buffer = await file.slice(0, end).arrayBuffer();
    bytes = new Uint8Array(buffer);
  } catch {
    return unable(filename, "The file could not be read. It may be inaccessible or malformed. Nothing was uploaded.", limitations, known?.extension ?? null);
  }

  if (bytes.length === 0) {
    return unable(filename, "No bytes could be read from this file. Nothing was uploaded.", limitations, known?.extension ?? null);
  }

  const evaluations = formats.map((format) => evaluate(format, bytes, file.size));
  const distinctiveMatches = evaluations.filter((item) => item.state === "match" && item.via === "signature");
  const extensionEvaluations = known
    ? evaluations.filter((item) => known.formats.some((format) => format.id === item.format.id))
    : [];
  const extensionMatches = extensionEvaluations.filter((item) => item.state === "match");
  const shared = Boolean(known && (known.formats.length > 1 || known.formats.some((format) => format.ambiguous)));

  const familyNote = (format: Format | undefined) => (format?.containerFamily ? familyNotes[format.containerFamily] : null);

  if (known && extensionMatches.length > 0) {
    const primary = extensionMatches[0]?.format;
    const note = familyNote(primary);
    if (note) limitations.push(note);
    if (primary?.signatureNote) limitations.push(primary.signatureNote);
    const conflicts = distinctiveMatches
      .filter((item) => !extensionMatches.some((match) => match.format.id === item.format.id))
      .filter((item) => item.format.containerFamily !== primary?.containerFamily)
      .map(present);
    const names = extensionMatches.map((item) => item.format.name).join(", ");
    const unconfirmed = known.formats.filter((format) => !extensionMatches.some((match) => match.format.id === format.id));
    if (unconfirmed.length > 0) {
      limitations.push(`Other uses of .${known.extension} were not confirmed by the bytes: ${unconfirmed.map((format) => format.name).join(", ")}.`);
    }
    return {
      ...baseResult(filename, limitations),
      status: "signature-match",
      headline: "Signature matches",
      extension: known.extension,
      ambiguous: shared,
      formats: extensionMatches.map(present),
      conflicts,
      mimeTypes: [...new Set(extensionMatches.flatMap((item) => item.format.mimeTypes ?? []))],
      caution: shared
        ? "This extension is used in more than one way. The byte check supports the format listed here and does not make the file safe, complete, or valid."
        : null,
      explanation: shared
        ? `The filename uses .${known.extension}, which is ambiguous. The bytes we checked agree with ${names}. A signature match does not prove that a file is safe, complete, or valid.`
        : `The filename matches ${names}, and the bytes we checked agree with a known signature or container for that format. A signature match does not prove that a file is safe, complete, or valid.`,
    };
  }

  const outside = distinctiveMatches.filter((item) => !extensionEvaluations.some((entry) => entry.format.id === item.format.id));
  if (known && extensionMatches.length === 0) {
    const singleHardMismatch = extensionEvaluations.length === 1 && extensionEvaluations[0]?.state === "mismatch";
    const everyCandidateMismatched =
      extensionEvaluations.length > 0 && extensionEvaluations.every((item) => item.state === "mismatch");
    if (outside.length > 0 || singleHardMismatch || everyCandidateMismatched) {
      const expected = known.formats.map((format) => format.name).join(", ");
      const found = outside.map((item) => item.format.name).join(", ");
      return {
        ...baseResult(filename, limitations),
        status: "possible-mismatch",
        headline: "Possible mismatch",
        extension: known.extension,
        ambiguous: shared,
        formats: extensionEvaluations.map(present),
        conflicts: outside.map(present),
        mimeTypes: [...new Set(known.formats.flatMap((format) => format.mimeTypes ?? []))],
        caution: "A mismatch is a reason for caution, not proof of malicious activity. Renamed and truncated files can look like this.",
        explanation: found
          ? `The filename suggests ${expected} (.${known.extension}), but the bytes we checked do not agree with that format. They are consistent with ${found}. A mismatch is a reason for caution, not proof of malicious activity.`
          : `The filename suggests ${expected} (.${known.extension}), but the bytes we checked do not match the signature Openly expects. A mismatch is a reason for caution, not proof of malicious activity.`,
      };
    }
  }

  if (known) {
    const note = familyNote(known.formats[0]);
    if (note && extensionEvaluations.some((item) => item.state === "match")) limitations.push(note);
    return {
      ...baseResult(filename, limitations),
      status: "extension-recognized",
      headline: "Extension recognized",
      extension: known.extension,
      ambiguous: shared,
      formats: extensionEvaluations.map(present),
      conflicts: [],
      mimeTypes: [...new Set(known.formats.flatMap((format) => format.mimeTypes ?? []))],
      caution: shared ? "This extension has more than one meaning. Openly is not treating a single interpretation as certain." : null,
      explanation: shared
        ? `The filename uses .${known.extension}, which matches more than one catalog entry or is marked as ambiguous. ${known.formats.map((format) => format.name).join(" and ")} ${known.formats.length > 1 ? "are" : "is"} listed because of the name. A filename is not verified file-type evidence, and the byte check was inconclusive or unavailable.`
        : `The filename matches ${known.formats.map((format) => format.name).join(", ")}. This check did not find a confirming byte signature, so the extension is the evidence. A filename is not verified file-type evidence.`,
    };
  }

  if (distinctiveMatches.length > 0) {
    const primary = distinctiveMatches[0]?.format;
    const note = familyNote(primary);
    if (note) limitations.push(note);
    return {
      ...baseResult(filename, limitations),
      status: "signature-match",
      headline: "Signature matches",
      extension: null,
      ambiguous: distinctiveMatches.length > 1,
      formats: distinctiveMatches.map(present),
      conflicts: [],
      mimeTypes: [...new Set(distinctiveMatches.flatMap((item) => item.format.mimeTypes ?? []))],
      caution: distinctiveMatches.length > 1 ? "Several formats share this signature. The filename did not choose one." : null,
      explanation: `The filename did not match a catalog extension. The bytes we checked are consistent with ${distinctiveMatches.map((item) => item.format.name).join(", ")}. A signature match does not prove that a file is safe, complete, or valid.`,
    };
  }

  return unable(
    filename,
    "There is not enough evidence to identify this file. Openly did not find a known extension or a known signature. Check the spelling, try the extension alone, or browse the catalog.",
    limitations,
    null,
  );
}
