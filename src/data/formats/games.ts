import { bytes, format, safety, source, support } from "../helpers";

const romSafety = safety(
  "Copyrighted software",
  "A cartridge image may be copyrighted software. Openly identifies the format and names emulators that can read it. It does not provide games, BIOS files, or copies of commercial software.",
);

export const gameFormats = [
  format({
    id: "nes",
    extensions: ["nes"],
    name: "NES ROM",
    description:
      "An NES or Famicom cartridge image, usually with an iNES or NES 2.0 header. A standard header begins with the ASCII bytes NES followed by 1A. The rest describes the board. It is not a video or a document.",
    category: "games",
    signatures: [bytes(0, "4E 45 53 1A", "ASCII NES header")],
    commonUses: ["Emulator cartridge images", "Homebrew NES software"],
    safetyNotes: [romSafety],
    support: [
      support("mesen", "full", ["open", "preview"], "Runs iNES images. Openly does not launch emulators."),
    ],
    compatibilityIssues: ["A headerless dump will not match the NES signature.", "Mapper support depends on the emulator."],
    relatedFormatIds: ["sfc", "gba", "sav-game"],
    standardization: "de-facto",
    sources: [source("Mesen", "https://www.mesen.ca/"), source("NESdev iNES header description", "https://www.nesdev.org/wiki/INES")],
    aliases: ["ines", "famicom"],
  }),
  format({
    id: "sfc",
    extensions: ["sfc", "smc"],
    name: "SNES ROM",
    description:
      "A Super Nintendo cartridge image. .sfc usually means a headerless image, and .smc often means a file with a 512-byte copier header. There is no single magic number as reliable as the NES header. Emulators differ in which layout they expect.",
    category: "games",
    commonUses: ["SNES emulator images"],
    ambiguous: true,
    ambiguityNote: "Headered and headerless SNES images share this family, and the bytes alone are not a clean signature. Openly does not pretend to verify a cartridge dump.",
    safetyNotes: [romSafety],
    support: [
      support("snes9x", "partial", ["open", "preview"], "Plays many SNES images. The project is free to use; its license is not an OSI open-source license."),
      support("mesen", "partial", ["open", "preview"], "Mesen 2 also emulates the SNES."),
    ],
    relatedFormatIds: ["nes", "gba"],
    standardization: "de-facto",
    sources: [source("Snes9x", "https://www.snes9x.com/"), source("Mesen", "https://www.mesen.ca/")],
    aliases: ["snes", "smc", "super nintendo"],
  }),
  format({
    id: "gba",
    extensions: ["gba"],
    name: "Game Boy Advance ROM",
    description:
      "A Game Boy Advance cartridge image. The internal header includes a Nintendo logo bitmap and a game title, at fixed offsets, plus a checksum. Openly does not reproduce that logo or treat a short prefix as proof.",
    category: "games",
    commonUses: ["GBA emulator images", "GBA homebrew"],
    safetyNotes: [romSafety],
    support: [support("mgba", "full", ["open", "preview"], "Runs GBA images. Openly does not launch it.")],
    compatibilityIssues: ["Save data is usually a separate file, often .sav, and is not part of the .gba image.", "Different emulator save types are not interchangeable."],
    relatedFormatIds: ["nes", "sav-game", "sfc"],
    standardization: "proprietary",
    sources: [source("mGBA", "https://mgba.io/")],
    aliases: ["game boy advance"],
  }),
  format({
    id: "sav-game",
    extensions: ["sav"],
    name: "Console save file",
    description:
      "Many emulators store battery-backed or cartridge save data in a file named .sav. The layout depends on the console, the game, and the emulator. There is no universal header. The same extension is used by SPSS statistical files, which are unrelated.",
    category: "games",
    commonUses: ["Emulator save data", "Cartridge backup RAM dumps"],
    ambiguous: true,
    ambiguityNote:
      ".sav is ambiguous. This entry is the console-save reading. SPSS system files use the same extension and have their own record. A game save usually has no SPSS header.",
    safetyNotes: [
      safety("Not a universal format", "A save file can be private game progress. It is not a program by itself. The wrong emulator or the wrong save type will simply fail to load it."),
    ],
    support: [
      support("mgba", "limited", ["open"], "May load a GBA save beside a GBA image. It will not open SPSS files or saves from unrelated consoles."),
    ],
    relatedFormatIds: ["sav-spss", "gba", "nes"],
    standardization: "unknown",
    sources: [source("mGBA save documentation context", "https://mgba.io/")],
    aliases: ["save", "battery save"],
  }),
  format({
    id: "sav-spss",
    extensions: ["sav"],
    name: "SPSS data file",
    description:
      "SPSS and compatible software store a statistical dataset in a .sav system file. Current files begin with the characters $FL2. This is not a console save, even though the extension matches.",
    category: "development",
    signatures: [bytes(0, "24 46 4C 32", "ASCII $FL2")],
    commonUses: ["Statistical datasets", "Survey exports"],
    ambiguous: true,
    ambiguityNote: "The extension .sav is also used for emulator saves. A $FL2 header supports the SPSS reading and does not describe a game save.",
    support: [
      support("pspp", "partial", ["open", "preview", "edit"], "GNU PSPP reads SPSS system files. It is not SPSS, and some files or features differ."),
    ],
    relatedFormatIds: ["sav-game", "csv", "sqlite"],
    standardization: "proprietary",
    sources: [source("GNU PSPP", "https://www.gnu.org/software/pspp/"), source("IBM SPSS statistics file information", "https://www.ibm.com/products/spss-statistics")],
    aliases: ["spss", "spss sav"],
  }),
  format({
    id: "pak",
    extensions: ["pak"],
    name: "Game package",
    description:
      "PAK is a filename more than a format. id Software's Quake packages begin with the ASCII word PACK. Unreal Engine, many other games, and unrelated programs also use .pak with different layouts. There is no single reader.",
    category: "games",
    signatures: [bytes(0, "50 41 43 4B", "ASCII PACK", true)],
    signatureNote: "PACK supports a Quake-style archive only. Most modern .pak files will not have it, and that does not identify which game they belong to.",
    commonUses: ["Game asset archives", "Quake-style PACK files"],
    ambiguous: true,
    ambiguityNote:
      "Openly does not treat .pak as one format. A PACK header suggests a Quake-style archive. Other engines use the extension for unrelated containers. No application listed here opens every .pak file.",
    safetyNotes: [
      safety(
        "Game archives",
        "A package can contain scripts, executable code, or just art. Extracting an unknown game archive can produce those files. Openly does not extract packages.",
      ),
    ],
    support: [],
    compatibilityIssues: [
      "7-Zip opens ZIP files, not arbitrary .pak files.",
      "Tools made for one engine can damage or misread another engine's package.",
    ],
    relatedFormatIds: ["zip", "bin"],
    standardization: "unknown",
    sources: [source("Library of Congress format descriptions", "https://www.loc.gov/preservation/digital/formats/")],
    aliases: ["quake pak", "game pak"],
  }),
  format({
    id: "bin",
    extensions: ["bin"],
    name: "Binary file",
    description:
      "The extension .bin means only that someone labeled a file as binary. It is used for firmware, raw disc tracks beside a .cue sheet, game data, and countless private formats. There is no common header.",
    category: "games",
    commonUses: ["Raw CD tracks next to a cue sheet", "Firmware", "Application-specific data"],
    ambiguous: true,
    ambiguityNote:
      "Openly cannot identify a .bin file from the extension. If a cue sheet sits beside it, the pair may be a CD image. Without that context, the extension is not evidence of a particular format.",
    safetyNotes: [
      safety(
        "Unknown binary",
        "A .bin file may be firmware or a program fragment. Flashing or executing an unknown binary can damage a device or run code. Openly does not execute it.",
      ),
    ],
    support: [],
    relatedFormatIds: ["cue", "iso", "pak"],
    standardization: "unknown",
    sources: [source("Library of Congress format descriptions", "https://www.loc.gov/preservation/digital/formats/")],
    aliases: ["binary"],
  }),
  format({
    id: "cue",
    extensions: ["cue"],
    name: "Cue sheet",
    description:
      "A cue sheet is a text file that describes the tracks of a CD image. It usually points at a separate .bin or other image file. The cue sheet is not the audio or the disc data.",
    category: "games",
    signatures: [bytes(0, "46 49 4C 45", "ASCII FILE", true), bytes(0, "52 45 4D", "ASCII REM", true)],
    signatureNote: "FILE or REM at the start is a common cue-sheet convention, not a unique magic number.",
    commonUses: ["CD images split into a sheet and a binary track file"],
    support: [
      support("vlc", "limited", ["open", "preview"], "Can play some cue sheets that point at audio tracks the player can read."),
    ],
    compatibilityIssues: ["The cue sheet is useless if the image file it names is missing.", "File names inside the sheet can be wrong after the files are moved."],
    relatedFormatIds: ["bin", "iso"],
    standardization: "de-facto",
    sources: [source("GNU ccd2cue manual, which documents the cue sheet syntax", "https://www.gnu.org/software/ccd2cue/manual/html_node/Cue-sheet-syntax.html")],
    aliases: ["cuesheet", "cue sheet"],
  }),
  format({
    id: "swf",
    extensions: ["swf"],
    name: "Shockwave Flash",
    description:
      "SWF is the Adobe Flash file format used for web animation and games. Adobe ended Flash Player support in 2020. Files begin with FWS, CWS, or ZWS depending on compression. They can contain ActionScript, which is code.",
    category: "games",
    signatures: [
      bytes(0, "46 57 53", "ASCII FWS, uncompressed"),
      bytes(0, "43 57 53", "ASCII CWS, zlib compressed"),
      bytes(0, "5A 57 53", "ASCII ZWS, LZMA compressed"),
    ],
    commonUses: ["Older web animation", "Flash games and banners"],
    safetyNotes: [
      safety(
        "ActionScript",
        "SWF can contain executable ActionScript. Ruffle emulates many files in a sandbox and does not implement every feature. Emulation is not a guarantee, and a signature does not mean the file is safe to run in an old Flash Player.",
      ),
    ],
    support: [
      support("ruffle", "partial", ["open", "preview"], "Plays many SWF files. ActionScript 3 and some older features are incomplete."),
    ],
    compatibilityIssues: ["Adobe Flash Player is discontinued and should not be used as the way to open untrusted files.", "Compression variants still need a Flash-aware tool."],
    relatedFormatIds: ["html", "js"],
    standardization: "legacy",
    sources: [source("Ruffle", "https://ruffle.rs/"), source("Adobe SWF file format documentation", "https://www.adobe.com/devnet/swf.html")],
    aliases: ["flash", "shockwave"],
  }),
];
