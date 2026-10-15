import { Link } from "react-router";
import type { Software, SoftwareSupport } from "../data/types";
import { capabilityLabels, levelLabels, platformLabels, pricingLabels } from "../lib/labels";

export function CompatibilityTable({
  rows,
}: {
  rows: Array<{ software: Software; link: SoftwareSupport }>;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="overflow-x-auto">
      <table className="compat-table">
        <caption className="sr-only">Compatible software</caption>
        <thead>
          <tr>
            <th scope="col">Application</th>
            <th scope="col">Systems</th>
            <th scope="col">Level</th>
            <th scope="col">Capabilities</th>
            <th scope="col">Pricing</th>
            <th scope="col">Source</th>
            <th scope="col">Website</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ software, link }) => (
            <tr key={software.id}>
              <td data-label="Application">
                <Link className="font-semibold text-accent" to={`/software/${software.slug}`}>
                  {software.name}
                </Link>
                {link.notes ? <p className="mt-1 text-sm text-muted">{link.notes}</p> : null}
              </td>
              <td data-label="Systems">{software.platforms.map((platform) => platformLabels[platform]).join(", ")}</td>
              <td data-label="Level">{levelLabels[link.level]}</td>
              <td data-label="Capabilities">{link.capabilities.map((capability) => capabilityLabels[capability]).join(", ")}</td>
              <td data-label="Pricing">{pricingLabels[software.pricing]}</td>
              <td data-label="Source">{software.openSource ? "Open source" : "Not open source"}</td>
              <td data-label="Website">
                <a className="text-accent" href={software.officialUrl} rel="noreferrer noopener" target="_blank">
                  Official site
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
