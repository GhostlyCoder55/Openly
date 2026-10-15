import type { Capability, Platform, Pricing, Standardization, SupportLevel } from "../data/types";

export const platformLabels: Record<Platform, string> = {
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
  web: "Web",
  android: "Android",
  ios: "iOS",
};

export const pricingLabels: Record<Pricing, string> = {
  free: "Free",
  paid: "Paid",
  freemium: "Freemium",
};

export const capabilityLabels: Record<Capability, string> = {
  open: "Opens",
  preview: "Previews",
  edit: "Edits",
  create: "Creates",
  convert: "Converts",
};

export const capabilityFilterLabels: Record<Capability, string> = {
  open: "Opens files",
  preview: "Previews files",
  edit: "Edits files",
  create: "Creates files",
  convert: "Converts files",
};

export const levelLabels: Record<SupportLevel, string> = {
  full: "Full",
  partial: "Partial",
  limited: "Limited",
};

export const standardizationLabels: Record<Standardization, string> = {
  standard: "Standardized",
  open: "Open specification",
  proprietary: "Proprietary",
  legacy: "Legacy",
  "de-facto": "De facto",
  unknown: "Unknown",
};

export function formatExtensionList(extensions: string[]): string {
  return extensions.map((extension) => `.${extension}`).join(", ");
}
