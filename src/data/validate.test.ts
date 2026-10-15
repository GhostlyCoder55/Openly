import { describe, expect, it } from "vitest";
import { categories, formats, guides, software } from "./index";
import { validateDataset } from "./validate";

describe("dataset", () => {
  it("has a broad catalog of real formats", () => {
    expect(formats.length).toBeGreaterThanOrEqual(75);
    expect(software.length).toBeGreaterThanOrEqual(20);
    expect(guides.length).toBeGreaterThanOrEqual(8);
  });

  it("accepts the shipped dataset", () => {
    expect(validateDataset({ formats, software, guides, categories })).toEqual([]);
  });

  it("detects a broken format/software reference", () => {
    const broken = {
      ...formats[0],
      id: "broken-format",
      extensions: ["broken-format-ext"],
      support: [{ softwareId: "missing-app", level: "full" as const, capabilities: ["open" as const] }],
      relatedFormatIds: ["missing-format"],
    };
    const errors = validateDataset({
      formats: [...formats, broken],
      software,
      guides,
      categories,
    });
    expect(errors.some((error) => error.includes("missing-app"))).toBe(true);
    expect(errors.some((error) => error.includes("missing-format"))).toBe(true);
  });
});
