import { describe, expect, it } from "vitest";
import { filterSoftware } from "./filters";

describe("software filters", () => {
  it("returns only Linux applications when Linux is selected", () => {
    const results = filterSoftware({ platforms: ["linux"] });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((item) => item.platforms.includes("linux"))).toBe(true);
    expect(results.some((item) => item.id === "preview")).toBe(false);
    expect(results.some((item) => item.id === "vlc")).toBe(true);
  });

  it("treats free and open source as independent filters", () => {
    const free = filterSoftware({ pricing: ["free"] });
    const openSource = filterSoftware({ openSource: true });
    const both = filterSoftware({ pricing: ["free"], openSource: true });
    expect(free.every((item) => item.pricing === "free")).toBe(true);
    expect(openSource.every((item) => item.openSource)).toBe(true);
    expect(both.every((item) => item.pricing === "free" && item.openSource)).toBe(true);
    expect(free.some((item) => !item.openSource)).toBe(true);
    expect(openSource.some((item) => item.pricing !== "free")).toBe(true);
    expect(both.length).toBeLessThan(free.length);
    expect(both.length).toBeLessThan(openSource.length);
  });

  it("distinguishes preview, editing, and conversion", () => {
    const preview = filterSoftware({ capabilities: ["preview"] });
    const edit = filterSoftware({ capabilities: ["edit"] });
    const convert = filterSoftware({ capabilities: ["convert"] });
    expect(preview.every((item) => item.capabilities.includes("preview"))).toBe(true);
    expect(edit.every((item) => item.capabilities.includes("edit"))).toBe(true);
    expect(convert.every((item) => item.capabilities.includes("convert"))).toBe(true);
    expect(convert.some((item) => item.id === "ffmpeg")).toBe(true);
    expect(edit.some((item) => item.id === "ffmpeg")).toBe(false);
    expect(preview.some((item) => item.id === "sumatra-pdf")).toBe(true);
    expect(convert.some((item) => item.id === "sumatra-pdf")).toBe(false);
    expect(edit.some((item) => item.id === "audacity")).toBe(true);
  });
});
