import type { Category, FieldGuideEntry, Format, Software } from "./types";

export interface DatasetInput {
  formats: Format[];
  software: Software[];
  guides: FieldGuideEntry[];
  categories: Category[];
}

export function validateDataset(input: DatasetInput): string[] {
  const errors: string[] = [];
  const formatIds = new Set<string>();
  const softwareIds = new Map<string, Software>();
  const slugs = new Set<string>();
  const categoryIds = new Set(input.categories.map((category) => category.id));

  for (const item of input.software) {
    if (softwareIds.has(item.id)) errors.push(`Duplicate software id ${item.id}`);
    softwareIds.set(item.id, item);
    if (slugs.has(item.slug)) errors.push(`Duplicate software slug ${item.slug}`);
    slugs.add(item.slug);
    if (!item.officialUrl.startsWith("https://")) {
      errors.push(`${item.id} is missing an https official URL`);
    }
    if (item.sources.length === 0) errors.push(`${item.id} has no sources`);
    if (item.platforms.length === 0) errors.push(`${item.id} has no platforms`);
    if (item.capabilities.length === 0) errors.push(`${item.id} has no capabilities`);
  }

  for (const format of input.formats) {
    if (formatIds.has(format.id)) errors.push(`Duplicate format id ${format.id}`);
    formatIds.add(format.id);
    if (format.extensions.length === 0) errors.push(`${format.id} has no extensions`);
    if (!categoryIds.has(format.category)) {
      errors.push(`${format.id} has unknown category ${format.category}`);
    }
    if (format.sources.length === 0) errors.push(`${format.id} has no sources`);
    if (!format.description.trim()) errors.push(`${format.id} has an empty description`);
    for (const link of format.support) {
      const app = softwareIds.get(link.softwareId);
      if (!app) {
        errors.push(`${format.id} references missing software ${link.softwareId}`);
        continue;
      }
      for (const capability of link.capabilities) {
        if (!app.capabilities.includes(capability)) {
          errors.push(
            `${app.id} claims ${capability} for ${format.id}, which is not in its capabilities`,
          );
        }
      }
      if (link.capabilities.length === 0) {
        errors.push(`${format.id} support ${link.softwareId} has no capabilities`);
      }
    }
  }

  for (const format of input.formats) {
    for (const related of format.relatedFormatIds ?? []) {
      if (!formatIds.has(related)) {
        errors.push(`${format.id} related format ${related} does not exist`);
      }
    }
  }

  const referencedSoftware = new Set<string>();
  for (const format of input.formats) {
    for (const link of format.support) referencedSoftware.add(link.softwareId);
  }
  for (const item of input.software) {
    if (!referencedSoftware.has(item.id)) {
      errors.push(`Software ${item.id} is not referenced by any format`);
    }
  }

  const guideSlugs = new Set<string>();
  for (const guide of input.guides) {
    if (guideSlugs.has(guide.slug)) errors.push(`Duplicate guide slug ${guide.slug}`);
    guideSlugs.add(guide.slug);
    if (guide.formatIds.length === 0) errors.push(`${guide.slug} has no formats`);
    for (const id of [...guide.formatIds, ...guide.relatedFormatIds]) {
      if (!formatIds.has(id)) errors.push(`${guide.slug} references missing format ${id}`);
    }
    if (guide.sources.length === 0) errors.push(`${guide.slug} has no sources`);
  }

  return errors;
}
