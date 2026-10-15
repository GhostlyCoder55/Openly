import { Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import { destinationForQuery, search, type SearchHit } from "../lib/search";

interface Props {
  id?: string;
  initialQuery?: string;
  autoFocus?: boolean;
  submitLabel?: string;
}

export function SearchField({
  id = "format-search",
  initialQuery = "",
  autoFocus = false,
  submitLabel = "Find a format",
}: Props) {
  const navigate = useNavigate();
  const listId = useId();
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [notice, setNotice] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const hits = query.trim() ? search(query, 8) : [];

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  function go(hit?: SearchHit) {
    const destination = hit ? hit.href : destinationForQuery(query);
    setOpen(false);
    navigate(destination);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) {
      setNotice("Enter an extension, filename, or format.");
      return;
    }
    const selected = active >= 0 ? hits[active] : undefined;
    go(selected);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (hits.length === 0) return;
      setOpen(true);
      setActive((index) => (index + 1) % hits.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (hits.length === 0) return;
      setOpen(true);
      setActive((index) => (index <= 0 ? hits.length - 1 : index - 1));
    } else if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
    } else if (event.key === "Enter" && open && active >= 0 && hits[active]) {
      event.preventDefault();
      go(hits[active]);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <form role="search" onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden="true" />
          <input
            id={id}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open && hits.length > 0}
            aria-controls={listId}
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            className="w-full rounded-xl border border-line bg-surface py-3 pl-10 pr-10 text-ink placeholder:text-muted"
            aria-label="Search an extension, filename, or format"
            placeholder="Search an extension, filename, or format…"
            value={query}
            autoFocus={autoFocus}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              setActive(-1);
              setNotice("");
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
          />
          {query ? (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted hover:text-ink"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                setOpen(false);
                setActive(-1);
                document.getElementById(id)?.focus();
              }}
            >
              <X size={16} aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <button type="submit" className="rounded-xl bg-accent px-4 py-3 font-semibold text-canvas hover:bg-tide">
          {submitLabel}
        </button>
      </form>
      <p className="sr-only" aria-live="polite">
        {open && query.trim() ? `${hits.length} suggestion${hits.length === 1 ? "" : "s"}` : notice}
      </p>
      {notice ? <p className="mt-2 text-sm text-warning">{notice}</p> : null}
      {open && query.trim() && hits.length > 0 ? (
        <ul id={listId} role="listbox" aria-label="Search suggestions" className="absolute z-20 mt-2 max-h-80 w-full overflow-auto rounded-xl border border-line bg-surface p-1 shadow-none">
          {hits.map((hit, index) => (
            <li key={`${hit.type}-${hit.id}`} id={`${listId}-${index}`} role="option" aria-selected={index === active}>
              <button
                type="button"
                className={`w-full rounded-lg px-3 py-2 text-left ${index === active ? "bg-raised" : "hover:bg-raised"}`}
                onMouseEnter={() => setActive(index)}
                onClick={() => go(hit)}
              >
                <span className="block font-semibold">{hit.title}</span>
                <span className="line-clamp-2 block text-sm text-muted">{hit.description}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {open && query.trim() && hits.length === 0 ? (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-line bg-surface p-3 text-sm text-muted">
          No matches yet. Submit the search for a fuller explanation.
        </div>
      ) : null}
    </div>
  );
}
