export function AdminTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="space-y-1">
      <h1 className="text-lg font-semibold tracking-tight text-brand-black">
        {title}
      </h1>
      {subtitle ? (
        <p className="text-xs text-black/50">{subtitle}</p>
      ) : null}
    </div>
  );
}

