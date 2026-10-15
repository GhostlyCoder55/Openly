import { Menu, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { ErrorBoundary } from "./ErrorBoundary";
import { Wordmark } from "./Logo";

const links = [
  { to: "/formats", label: "Explore", match: (path: string) => path.startsWith("/formats") || path.startsWith("/categories") },
  { to: "/software", label: "Software", match: (path: string) => path.startsWith("/software") },
  { to: "/field-guide", label: "Field Guide", match: (path: string) => path.startsWith("/field-guide") },
  { to: "/about", label: "About", match: (path: string) => path === "/about" },
];

function itemClass(active: boolean) {
  return `rounded-md px-2 py-1 ${active ? "text-accent" : "text-muted hover:text-ink"}`;
}

export function Layout() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-canvas">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" aria-label="Openly home">
            <Wordmark />
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={() => itemClass(link.match(location.pathname))}>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            className="rounded-md border border-line px-3 py-2 text-sm md:hidden"
            aria-label="Menu"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden="true" size={18} /> : <Menu aria-hidden="true" size={18} />}
          </button>
        </div>
        {open ? (
          <nav id={menuId} aria-label="Mobile" className="border-t border-line px-4 py-3 md:hidden">
            <ul className="flex flex-col gap-1">
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} className={() => `block px-2 py-2 ${itemClass(link.match(location.pathname))}`}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </header>
      <main id="content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-sm text-muted">
          <p>Openly reads files only on your device. It is not an antivirus.</p>
          <Link className="text-accent" to="/about">
            Privacy and limitations
          </Link>
        </div>
      </footer>
    </div>
  );
}
