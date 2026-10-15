import { bytes, format, iana, safety, source, support } from "../helpers";

const fontSafety = safety(
  "Font parsers",
  "Fonts are not macros, but operating systems parse them in privileged text code. Malformed fonts have been used to attack those parsers. Install fonts from sources you trust. Openly does not install fonts.",
);

export const fontFormats = [
  format({
    id: "ttf",
    extensions: ["ttf"],
    name: "TrueType",
    description:
      "TrueType is an outline font format. On the desktop, the file often begins with 00 01 00 00 or the word true. It holds glyphs and hinting instructions, not a document.",
    category: "documents",
    mimeTypes: ["font/ttf"],
    signatures: [
      bytes(0, "00 01 00 00", "TrueType scaler"),
      bytes(0, "74 72 75 65", "ASCII true"),
    ],
    commonUses: ["Desktop and web fonts", "Documents with embedded typography"],
    safetyNotes: [fontSafety],
    support: [
      support("fontforge", "full", ["open", "preview", "edit", "create", "convert"]),
    ],
    conversionNotes: "FontForge can convert TrueType to OpenType or WOFF2. Converting a font does not convert the documents that use it.",
    relatedFormatIds: ["otf", "woff2"],
    standardization: "standard",
    sources: [source("Microsoft TrueType overview", "https://learn.microsoft.com/en-us/typography/truetype/"), iana("font/ttf")],
    aliases: ["truetype"],
  }),
  format({
    id: "otf",
    extensions: ["otf"],
    name: "OpenType",
    description:
      "OpenType is the modern outline-font format based on TrueType and, in CFF fonts, a Compact Font Format table. CFF OpenType files begin with OTTO. The extension .otf is usual for those fonts; some OpenType fonts use .ttf.",
    category: "documents",
    mimeTypes: ["font/otf"],
    signatures: [bytes(0, "4F 54 54 4F", "ASCII OTTO")],
    signatureNote: "OTTO marks a CFF OpenType font. A TrueType-flavored OpenType font can use a TrueType scaler and the .otf or .ttf extension.",
    commonUses: ["Professional fonts", "Fonts with extended language coverage"],
    safetyNotes: [fontSafety],
    support: [support("fontforge", "full", ["open", "preview", "edit", "create", "convert"])],
    relatedFormatIds: ["ttf", "woff2"],
    standardization: "standard",
    sources: [source("Microsoft OpenType specification", "https://learn.microsoft.com/en-us/typography/opentype/spec/"), iana("font/otf")],
    aliases: ["opentype"],
  }),
  format({
    id: "woff2",
    extensions: ["woff2"],
    name: "WOFF2",
    description:
      "WOFF2 is a compressed web-font package. It begins with the ASCII marker wOF2. Browsers unpack it to use the font on a page. It is a delivery format, not a font editor's working file.",
    category: "documents",
    mimeTypes: ["font/woff2"],
    signatures: [bytes(0, "77 4F 46 32", "ASCII wOF2")],
    commonUses: ["Fonts embedded by websites"],
    safetyNotes: [fontSafety],
    support: [
      support("firefox", "full", ["open", "preview"], "Uses WOFF2 when a web page requests it. A local file is not a document preview."),
      support("fontforge", "partial", ["open", "convert"], "Can convert web fonts in many cases. Editing is more reliable after conversion to OpenType or TrueType."),
    ],
    relatedFormatIds: ["ttf", "otf"],
    standardization: "standard",
    sources: [source("W3C WOFF2", "https://www.w3.org/TR/WOFF2/"), iana("font/woff2")],
    aliases: ["web open font format", "woff"],
  }),
];
