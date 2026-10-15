import { describe, expect, it } from "vitest";
import { search } from "./search";

describe("search", () => {
  it("returns PDF for .pdf", () => {
    const hits = search(".pdf");
    expect(hits[0]?.id).toBe("pdf");
    expect(hits[0]?.type).toBe("format");
    expect(hits[0]?.match).toBe("exact-extension");
  });

  it("finds EPUB from a filename", () => {
    const hits = search("document.epub");
    expect(hits[0]?.id).toBe("epub");
    expect(hits[0]?.href).toBe("/formats/epub");
  });

  it("matches backup.tar.gz to the compound extension", () => {
    const hits = search("backup.tar.gz");
    expect(hits[0]?.id).toBe("targz");
    expect(hits[0]?.extension).toBe("tar.gz");
    expect(hits.some((hit) => hit.id === "gz" && hit.match === "exact-extension")).toBe(false);
  });

  it("accepts uppercase extensions", () => {
    expect(search(".PDF")[0]?.id).toBe("pdf");
    expect(search("FILE.PDF")[0]?.id).toBe("pdf");
    expect(search("  EpUb  ")[0]?.id).toBe("epub");
  });

  it("returns nothing invented for an unknown extension", () => {
    expect(search("zzzznotarealformatqqq")).toEqual([]);
  });

  it("keeps ambiguous extensions uncertain", () => {
    const hits = search("song.mod");
    expect(hits[0]?.id).toBe("mod");
    expect(hits[0]?.ambiguous).toBe(true);
    expect(hits[0]?.ambiguityNote?.toLowerCase()).toContain("not a single format");
  });

  it("finds an electronic book by description language", () => {
    expect(search("electronic book").some((hit) => hit.id === "epub")).toBe(true);
  });

  it("returns software and associated formats for Blender", () => {
    const hits = search("Blender");
    expect(hits.some((hit) => hit.type === "software" && hit.id === "blender")).toBe(true);
    expect(hits.some((hit) => hit.type === "format" && hit.id === "blend")).toBe(true);
  });

  it("finds the 3D category", () => {
    const hits = search("3D models");
    expect(hits.some((hit) => hit.type === "category" && hit.id === "3d-cad")).toBe(true);
  });
});
