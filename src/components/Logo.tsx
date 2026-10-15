export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <img
      src="/brand/openly-icon.png"
      alt=""
      width={40}
      height={40}
      className={`shrink-0 ${className}`}
    />
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
