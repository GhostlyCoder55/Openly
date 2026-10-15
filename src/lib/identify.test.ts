import { describe, expect, it, vi } from "vitest";
import { ANTIVIRUS_NOTICE, identifyFile, MAX_SIGNATURE_BYTES, type LocalFileSource } from "./identify";

function source(name: string, bytes: Uint8Array, size = bytes.length): LocalFileSource {
  return {
    name,
    size,
    slice(start: number, end: number) {
      return {
        async arrayBuffer() {
          return bytes.slice(start, end).buffer;
        },
      };
    },
  };
}

const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const pdf = new TextEncoder().encode("%PDF-1.7\n");

describe("local identification", () => {
  it("recognizes a PNG from the filename and signature without uploading it", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const urlSpy = vi.spyOn(URL, "createObjectURL");
    const result = await identifyFile(source("photo.png", png));
    expect(result.status).toBe("signature-match");
    expect(result.formats[0]?.id).toBe("png");
    expect(result.explanation).toMatch(/does not prove that a file is safe, complete, or valid/i);
    expect(result.antivirusNotice).toBe(ANTIVIRUS_NOTICE);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(urlSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
    urlSpy.mockRestore();
  });

  it("warns when the signature disagrees with the extension", async () => {
    const result = await identifyFile(source("photo.png", pdf));
    expect(result.status).toBe("possible-mismatch");
    expect(result.headline).toBe("Possible mismatch");
    expect(result.conflicts.some((item) => item.id === "pdf")).toBe(true);
    expect(result.explanation.toLowerCase()).toContain("not proof of malicious activity");
  });

  it("does not pretend an unknown file was recognized", async () => {
    const result = await identifyFile(source("notes.qqqxyz", new Uint8Array([1, 2, 3, 4, 5])));
    expect(result.status).toBe("unable-to-identify");
    expect(result.formats).toEqual([]);
  });

  it("reports an ambiguous extension without collapsing it to one certain type", async () => {
    const result = await identifyFile(source("song.mod", new Uint8Array(1200)));
    expect(result.status).toBe("extension-recognized");
    expect(result.ambiguous).toBe(true);
    expect(result.explanation.toLowerCase()).toContain("ambiguous");
  });

  it("matches a compound extension from the gzip wrapper", async () => {
    const result = await identifyFile(source("backup.tar.gz", new Uint8Array([0x1f, 0x8b, 0x08, 0x00])));
    expect(result.status).toBe("signature-match");
    expect(result.formats[0]?.id).toBe("targz");
    expect(result.explanation.toLowerCase()).toContain("does not prove");
  });

  it("handles an empty file and a read failure", async () => {
    const empty = await identifyFile(source("empty.png", new Uint8Array(), 0));
    expect(empty.status).toBe("unable-to-identify");
    expect(empty.explanation.toLowerCase()).toContain("empty");

    const broken: LocalFileSource = {
      name: "bad.png",
      size: 40,
      slice() {
        return {
          async arrayBuffer() {
            throw new Error("unreadable");
          },
        };
      },
    };
    const failed = await identifyFile(broken);
    expect(failed.status).toBe("unable-to-identify");
    expect(failed.explanation.toLowerCase()).toContain("malformed");
  });

  it("does not read an oversized file beyond the header cap", async () => {
    let requestedEnd = 0;
    const huge: LocalFileSource = {
      name: "huge.png",
      size: 5_000_000_000,
      slice(_start: number, end: number) {
        requestedEnd = end;
        const header = png.buffer.slice(0);
        return { async arrayBuffer() { return header; } };
      },
    };
    const result = await identifyFile(huge);
    expect(requestedEnd).toBeLessThanOrEqual(MAX_SIGNATURE_BYTES);
    expect(requestedEnd).toBe(MAX_SIGNATURE_BYTES);
    expect(result.status).toBe("signature-match");
    expect(result.limitations.some((line) => line.includes("33,000"))).toBe(true);
  });

  it("does not echo file contents", async () => {
    const secret = "SECRET_SENTINEL_do_not_leak";
    const result = await identifyFile(source("notes.txt", new TextEncoder().encode(secret)));
    expect(JSON.stringify(result)).not.toContain(secret);
    expect(result.status).toBe("extension-recognized");
  });
});
