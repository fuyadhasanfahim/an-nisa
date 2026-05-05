export function AdminTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h1 className="font-serif text-3xl tracking-tight">{title}</h1>
      {subtitle ? (
        <p className="mt-2 text-sm text-black/65">{subtitle}</p>
      ) : null}
    </div>
  );
}

