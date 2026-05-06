import { adminSectionTitleClass } from "./adminFieldClasses";

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={["space-y-5", className ?? ""].filter(Boolean).join(" ")}>
      <header className="space-y-1">
        <h2 className={adminSectionTitleClass}>{title}</h2>
        {description ? (
          <p className="text-xs leading-relaxed text-black/50">{description}</p>
        ) : null}
      </header>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
