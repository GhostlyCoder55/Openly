import { software } from "../data";
import type { Capability, Platform, Pricing, Software } from "../data/types";

export type SoftwareSort = "relevance" | "free" | "open-source" | "platforms";

export interface SoftwareQuery {
  query?: string;
  platforms?: Platform[];
  pricing?: Pricing[];
  openSource?: boolean;
  capabilities?: Capability[];
  sort?: SoftwareSort;
}

const pricingRank: Record<Pricing, number> = {
  free: 0,
  freemium: 1,
  paid: 2,
};

export function filterSoftware(query: SoftwareQuery = {}): Software[] {
  const text = query.query?.trim().toLowerCase() ?? "";
  const platforms = query.platforms ?? [];
  const pricing = query.pricing ?? [];
  const capabilities = query.capabilities ?? [];

  const matched = software.filter((item) => {
    if (platforms.length > 0 && !platforms.every((platform) => item.platforms.includes(platform))) {
      return false;
    }
    if (pricing.length > 0 && !pricing.includes(item.pricing)) return false;
    if (query.openSource && !item.openSource) return false;
    if (capabilities.length > 0 && !capabilities.every((capability) => item.capabilities.includes(capability))) {
      return false;
    }
    if (!text) return true;
    const haystack = [item.name, item.description, ...(item.aliases ?? [])].join(" ").toLowerCase();
    return haystack.includes(text);
  });

  return matched.sort((left, right) => {
    if (query.sort === "free" && left.pricing !== right.pricing) {
      return pricingRank[left.pricing] - pricingRank[right.pricing];
    }
    if (query.sort === "open-source" && left.openSource !== right.openSource) {
      return left.openSource ? -1 : 1;
    }
    if (query.sort === "platforms" && left.platforms.length !== right.platforms.length) {
      return right.platforms.length - left.platforms.length;
    }
    if (text) {
      const leftExact = left.name.toLowerCase() === text ? 1 : 0;
      const rightExact = right.name.toLowerCase() === text ? 1 : 0;
      if (leftExact !== rightExact) return rightExact - leftExact;
    }
    return left.name.localeCompare(right.name);
  });
}
