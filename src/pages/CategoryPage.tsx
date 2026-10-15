import { Link, useParams } from "react-router";
import { usePageMeta } from "../components/PageMeta";
import { formats, getCategory } from "../data";
import { NotFoundPage } from "./NotFoundPage";

export function CategoryPage() {
  const { category: categoryId = "" } = useParams();
  const category = getCategory(categoryId);
  usePageMeta(
    category ? `${category.name} — Openly` : "Category not found — Openly",
    category?.description ?? "That category is not in the catalog.",
  );
  if (!category) {
    return <NotFoundPage title="Category not found" message="That category is not in the catalog." />;
  }
  const items = formats.filter((format) => format.category === category.id);
  return (
    <div>
      <p className="text-sm">
        <Link className="text-accent" to="/formats">
          Formats
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-semibold">{category.name}</h1>
      <p className="mt-2 max-w-2xl text-muted">{category.description}</p>
      <ul className="mt-6 grid gap-3 md:grid-cols-2">
        {items.map((format) => (
          <li key={format.id}>
            <Link className="block h-full rounded-2xl border border-line bg-surface p-4 hover:border-tide" to={`/formats/${format.id}`}>
              <p className="text-sm text-tide">.{format.extensions[0]}</p>
              <h2 className="font-semibold">{format.name}</h2>
              <p className="mt-1 line-clamp-3 text-sm text-muted">{format.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
