# Openly

Openly is a privacy-first field guide for files. It answers three questions:

1. What is this file, and what is it used for?
2. Which applications can open, preview, edit, create, or convert it?
3. What limits or safety notes are worth knowing before you do?

Search, software filters, and file identification all run in the browser. The catalog is local data. There is no account, no API key, and no backend.

## Run it

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open the URL Vite prints, usually `http://127.0.0.1:5173`.

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Typecheck and write a static site to `dist/` |
| `npm run preview` | Serve the production build |
| `npm test` | Unit and component tests |
| `npm run test:e2e` | Browser tests with Playwright |
| `npm run lint` | Oxlint |

Install the Playwright browser once before the end-to-end tests:

```bash
npx playwright install chromium
npm run test:e2e
```

## What you can do

- Search by extension (`.epub`), filename (`document.epub` or `backup.tar.gz`), format name, description, software, or category.
- Open a format page for uses, MIME types, signatures, applications, conversion limits, and safety notes.
- Filter software by platform, price, open-source status, and capability. Price and open source are separate filters.
- Drop a file on the homepage to identify it locally. Openly reads the name and at most the first 33,000 bytes, then drops them.
- Browse the Field Guide, including Surprise Me, for formats that are easy to mix up.

Routes:

- `/`
- `/formats` and `/formats/:extension`
- `/categories/:category`
- `/software` and `/software/:slug`
- `/field-guide` and `/field-guide/:slug`
- `/about`

Unknown URLs show a not-found page. Refresh works on direct links when the host serves the app for every path. The development server and `vite preview` do that.

## Privacy

Identification and search do not upload files or send filenames to an analytics service. Results of a local check stay in the page; they are not written into the URL. Openly does not execute files, mount disk images, or install packages.

A static host can still see the page URL you request. Do not put a private filename in the search box if that URL would bother you on a shared network.

Openly is not an antivirus. A signature match does not mean a file is safe, complete, or valid. A mismatch is a reason for caution, not proof of malicious activity.

## Catalog

The shipped catalog has more than 100 format records and the applications that open them: documents, images, audio and video, archives, development files, 3D and CAD, games, and system packages. Compound extensions such as `.tar.gz` are stored as one extension. Ambiguous names such as `.mod`, `.ts`, `.sav`, `.pak`, and `.bin` stay ambiguous.

Records cite public specifications and official project pages: IANA media types, Library of Congress format descriptions, W3C and IETF documents, ECMA and OASIS standards, and vendor documentation. `lastVerified` is the review date for this dataset, 2026-10-15. It is not a live feed.

The model, the relationship rules, and the identification limits are described in [docs/DATA.md](docs/DATA.md).

Format names and product names belong to their owners. The descriptive text is original writing for this app. The source code is MIT; see [LICENSE](LICENSE).

## Architecture

React and TypeScript render a Vite single-page app. Tailwind CSS styles it. Fuse.js ranks fuzzy text matches after exact extension, name, and alias matches. Compound extensions are chosen by the longest known suffix, so `backup.tar.gz` is `.tar.gz` rather than `.gz`.

```
src/data/        formats, software, field guide, validation
src/lib/         search, identification, software filters
src/components/  layout, search, local identification
src/pages/       routes
```

Signature checks are bounded. ZIP packages are not unpacked. Gzip and xz streams are not decompressed. That is deliberate: a full parse would read more of the file and could expand an archive bomb.

## Deploy

```bash
npm run build
```

Publish the `dist/` directory.

- **Netlify or Cloudflare Pages:** `public/_redirects` is copied into the build and rewrites every path to `index.html` with status 200.
- **Vercel:** `vercel.json` does the same rewrite.
- **GitHub Pages:** the build also writes `dist/404.html` as a copy of the app, which Pages serves for unknown paths while keeping the URL. Use a user site, or set Vite `base` if the site lives in a project subdirectory.

No environment variables are required.

## Limitations

- The compatibility tables are curated, not exhaustive, and they go out of date as applications change.
- Shared containers are identified only as far as the header allows. A ZIP signature does not prove that a `.docx` is a valid Word file.
- Some signatures are optional because the format has several valid layouts. Absence of those bytes is not a mismatch.
- Disk images, installers, and executables are described so you can recognize them. Openly will not run them.
- Openly cannot remove DRM or recover passwords.

## Tests

Unit tests cover extension search, compound extensions, ambiguous results, software filters, broken references, signature matches, mismatches, unknown files, empty and unreadable files, oversized reads, and the rule that identification does not call `fetch` or create an object URL.

Browser tests cover homepage search, direct routes, the not-found page, filters, keyboard search, local identification, Surprise Me, category navigation, the mobile menu, and the absence of third-party requests during search.
