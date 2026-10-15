# Data model

Openly ships its catalog as TypeScript modules. There is no database and no remote content API. `validateDataset()` checks the graph before the app trusts it, and the unit tests fail if that check fails.

## Formats

`src/data/formats/` holds one array per subject. Each record can include:

| Field | Meaning |
| --- | --- |
| `id` | Stable page id, used in `/formats/:id` |
| `extensions` | Lowercase extensions without a leading dot. Compound extensions such as `tar.gz` are one value |
| `name`, `description`, `category` | What the file is, in plain language |
| `mimeTypes` | Registered or widely used media types, when Openly is confident |
| `signatures` | Distinctive byte or text patterns. Optional patterns do not cause a mismatch when they are absent |
| `signatureLogic` | `any` (default) or `all` |
| `container` | Wrapper signature for formats that are not distinctive on their own, such as a ZIP-based DOCX |
| `containerFamily` | Shared-container note used so a ZIP match is not described as a conflict with every ZIP-based format |
| `support` | Applications, support level (`full`, `partial`, `limited`), and capabilities |
| `safetyNotes`, `conversionNotes`, `compatibilityIssues` | Omitted from the page when absent |
| `relatedFormatIds`, `sources`, `lastVerified` | Cross-links and provenance |
| `ambiguous`, `ambiguityNote` | Set when one extension must not be treated as a single certain format |
| `aliases` | Extra search phrases, such as “electronic book” for EPUB |

Capabilities are `open`, `preview`, `edit`, `create`, and `convert`. A converter is not described as an editor. Partial support is not described as full support.

## Software

`src/data/software.ts` stores the application, not a second copy of the format list. Format pages point at software ids. Software pages derive their format list from those links.

Pricing is `free`, `paid`, or `freemium`. `openSource` is a separate boolean. An application can be free without being open source, or open source without being in the free price tier.

## Field Guide

`src/data/guides.ts` stores essays that point at real format ids. Surprise Me chooses one of those entries. It does not invent a format outside the catalog.

## Validation

`src/data/validate.ts` reports:

- duplicate format, software, or guide ids
- unknown categories, software ids, and related format ids
- support capabilities that the application record does not claim
- software that no format references
- empty descriptions or missing sources

A broken reference is a test fixture in `src/data/validate.test.ts`, so the check is exercised even though the shipped catalog is valid.

## Identification limits encoded in the data

- ZIP-based formats such as DOCX and EPUB use a container signature. A PK header agrees with the wrapper. Openly does not unpack the archive.
- `.tar.gz` is matched as a compound extension. Its bytes are gzip. The tar headers stay inside the compressed stream.
- `.ts` is both TypeScript and MPEG transport stream. `.sav` is both a console save and an SPSS dataset. `.mod` and `.pak` and `.bin` are marked ambiguous.
- Optional signatures, such as the short PCX header or an MP3 frame sync, can support a match. Their absence stays inconclusive instead of becoming a mismatch.
