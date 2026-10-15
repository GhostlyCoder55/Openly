import { Link } from "react-router";
import { usePageMeta } from "../components/PageMeta";

export function NotFoundPage({
  title = "Page not found",
  message = "That page is not part of Openly.",
}: {
  title?: string;
  message?: string;
}) {
  usePageMeta(`${title} — Openly`, message);
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-3 text-muted">{message}</p>
      <ul className="mt-6 space-y-2">
        <li>
          <Link className="text-accent" to="/">
            Home
          </Link>
        </li>
        <li>
          <Link className="text-accent" to="/formats">
            Browse formats
          </Link>
        </li>
        <li>
          <Link className="text-accent" to="/software">
            Find software
          </Link>
        </li>
      </ul>
    </div>
  );
}
