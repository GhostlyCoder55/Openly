export const CATEGORY_IDS = [
  "images",
  "video-audio",
  "documents",
  "archives",
  "development",
  "games",
  "3d-cad",
  "system",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export const PLATFORMS = [
  "windows",
  "macos",
  "linux",
  "web",
  "android",
  "ios",
] as const;

export type Platform = (typeof PLATFORMS)[number];

export const PRICING = ["free", "paid", "freemium"] as const;

export type Pricing = (typeof PRICING)[number];

export const CAPABILITIES = [
  "open",
  "preview",
  "edit",
  "create",
  "convert",
] as const;

export type Capability = (typeof CAPABILITIES)[number];

export const SUPPORT_LEVELS = ["full", "partial", "limited"] as const;

export type SupportLevel = (typeof SUPPORT_LEVELS)[number];

export const STANDARDIZATION = [
  "standard",
  "open",
  "proprietary",
  "legacy",
  "de-facto",
  "unknown",
] as const;

export type Standardization = (typeof STANDARDIZATION)[number];

export interface Source {
  title: string;
  url: string;
}

export interface ByteSignature {
  kind?: "bytes";
  offset: number;
  /** Space-separated hex bytes. `??` matches any byte. */
  pattern: string;
  optional?: boolean;
  label: string;
}

export interface ScanSignature {
  kind: "scan";
  text: string;
  within: number;
  optional?: boolean;
  label: string;
}

export type Signature = ByteSignature | ScanSignature;

export interface SafetyNote {
  title: string;
  detail: string;
}

export interface SoftwareSupport {
  softwareId: string;
  level: SupportLevel;
  capabilities: Capability[];
  notes?: string;
}

export interface Format {
  id: string;
  extensions: string[];
  name: string;
  description: string;
  category: CategoryId;
  mimeTypes?: string[];
  /** Distinctive signatures. Any non-optional signature can confirm the format. */
  signatures?: Signature[];
  /** When set, every non-optional signature must match. Defaults to any. */
  signatureLogic?: "any" | "all";
  /**
   * A wrapper this format uses when it has no distinctive signature of its own.
   * A match confirms the container, not that the package is valid.
   */
  container?: Signature;
  containerFamily?:
    | "zip"
    | "ole"
    | "gzip"
    | "ogg"
    | "ebml"
    | "iso-bmff"
    | "riff"
    | "pe"
    | "elf"
    | "pdf";
  signatureNote?: string;
  commonUses?: string[];
  safetyNotes?: SafetyNote[];
  support: SoftwareSupport[];
  conversionNotes?: string;
  compatibilityIssues?: string[];
  relatedFormatIds?: string[];
  standardization: Standardization;
  sources: Source[];
  lastVerified: string;
  ambiguous?: boolean;
  ambiguityNote?: string;
  aliases?: string[];
}

export interface Software {
  id: string;
  name: string;
  slug: string;
  description: string;
  officialUrl: string;
  platforms: Platform[];
  pricing: Pricing;
  openSource: boolean;
  capabilities: Capability[];
  sources: Source[];
  lastVerified: string;
  aliases?: string[];
}

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  aliases: string[];
}

export interface FieldGuideEntry {
  slug: string;
  title: string;
  summary: string;
  topic: string;
  formatIds: string[];
  what: string;
  designedFor: string;
  encountered: string;
  openToday: string;
  considerations: string;
  relatedFormatIds: string[];
  sources: Source[];
}
