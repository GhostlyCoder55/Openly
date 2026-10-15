import { categories } from "./categories";
import { formats } from "./formats/index";
import { guides } from "./guides";
import { software } from "./software";
import { validateDataset } from "./validate";

export { categories, formats, guides, software };

const datasetErrors = validateDataset({ formats, software, guides, categories });

if (import.meta.env.DEV && datasetErrors.length > 0) {
  console.error("Openly dataset problems:\n" + datasetErrors.join("\n"));
}

export function getFormat(id: string): FormatRecord | undefined {
  return formats.find((format) => format.id === id);
}

export function getSoftware(idOrSlug: string): (typeof software)[number] | undefined {
  return software.find((item) => item.id === idOrSlug || item.slug === idOrSlug);
}

export function getCategory(id: string) {
  return categories.find((category) => category.id === id);
}

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}

type FormatRecord = (typeof formats)[number];

export function formatsForSoftware(softwareId: string): FormatRecord[] {
  return formats.filter((format) => format.support.some((link) => link.softwareId === softwareId));
}

export function softwareForFormat(formatId: string) {
  const format = getFormat(formatId);
  if (!format) return [];
  return format.support.flatMap((link) => {
    const item = software.find((entry) => entry.id === link.softwareId);
    return item ? [{ software: item, link }] : [];
  });
}
