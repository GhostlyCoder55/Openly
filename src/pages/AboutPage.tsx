import { usePageMeta } from "../components/PageMeta";

export function AboutPage() {
  usePageMeta(
    "About — Openly",
    "What Openly is, where the catalog comes from, how privacy works, and what the app does not do.",
  );
  return (
    <article className="mx-auto max-w-3xl">
      <img
        src="/brand/openly-icon.png"
        alt="Openly"
        className="mx-auto block h-36 w-36"
        width={144}
        height={144}
      />
      <p className="mt-6 text-lg">
        Openly is a privacy-first field guide to file formats. It answers what a file is for, which applications can open it, and what limits or safety notes are worth knowing.
      </p>

      <h2 className="mt-8 text-2xl font-semibold">How to use it</h2>
      <p className="mt-2">
        Search an extension, a filename such as document.epub, a format name, or a description. Open a format page for the explanation and the compatibility table. Use Software to filter applications by platform, price, source, and capability. The Field Guide is for formats that are easy to misread. No account is required.
      </p>

      <h2 className="mt-8 text-2xl font-semibold">Sources</h2>
      <p className="mt-2">
        Records were written from public specifications and official documentation: IANA media types, the Library of Congress format descriptions, PRONOM’s home at The National Archives, W3C and IETF documents, OASIS and ECMA standards, and vendor or project sites. Each format and application page lists the sources used for that record. The catalog was reviewed for this version on 15 October 2026. It is not a live feed from those organizations.
      </p>

      <h2 className="mt-8 text-2xl font-semibold">Privacy</h2>
      <p className="mt-2">
        Search, filtering, and identification run in your browser. Choosing a file reads its name and at most the first 33,000 bytes, then discards them. Openly does not upload files, store file contents, execute files, or send filenames to an analytics service. There is no account and no backend. A static host may still log the page URL you request. Identification results are kept in the page only, not placed in the address bar.
      </p>

      <h2 className="mt-8 text-2xl font-semibold">What Openly is not</h2>
      <ul className="mt-2 list-disc space-y-2 pl-5">
        <li>It is not an antivirus or malware scanner. A signature match does not mean a file is safe, complete, or valid.</li>
        <li>A mismatch is a reason for caution, not proof of malicious activity.</li>
        <li>It does not unpack archives, decompress gzip streams, or fully parse documents.</li>
        <li>It does not remove DRM, recover passwords, or bypass application licenses.</li>
        <li>Compatibility is curated and incomplete. Partial support is labeled as partial. Pricing and open-source status are separate facts and can change.</li>
        <li>Some extensions are ambiguous. The catalog says so instead of pretending one meaning is universal.</li>
      </ul>

      <h2 className="mt-8 text-2xl font-semibold">License</h2>
      <p className="mt-2">
        The application source is released under the MIT License. Format names and software names are used to identify those formats and products. Specifications remain with their authors. The descriptive text in the catalog is original writing for Openly, compiled from the public sources listed on each record.
      </p>
    </article>
  );
}
