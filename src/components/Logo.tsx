export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#1A3C32" />
      <path
        d="M20 18.5h16.5L44 26v20.5a2.5 2.5 0 0 1-2.5 2.5h-21A2.5 2.5 0 0 1 18 46.5v-25.5a2.5 2.5 0 0 1 2-2.5z"
        fill="none"
        stroke="#A7F3C0"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path d="M36.5 18.5V26H44" fill="none" stroke="#A7F3C0" strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx="29" cy="36" r="5.2" fill="none" stroke="#A7F3C0" strokeWidth="2.4" />
      <path d="M33.1 40.1 37.2 44.2" stroke="#A7F3C0" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="text-2xl font-semibold tracking-tight text-ink">openly</span>
    </span>
  );
}
