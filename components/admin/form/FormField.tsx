export function FormField({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={[
        "flex h-full min-h-0 w-full min-w-0 flex-col gap-1.5",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* flex-1: same-row fields share stretched height → controls line up */}
      <div className="flex min-h-0 flex-1 flex-col gap-0.5">
        <span className="text-xs font-medium leading-snug text-black/55">{label}</span>
        {hint ? (
          <span className="max-w-full text-[11px] leading-snug text-black/45">{hint}</span>
        ) : null}
      </div>
      <div className="shrink-0">{children}</div>
      {error ? (
        <span className="shrink-0 text-xs text-rose-600" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}
