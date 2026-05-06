import { adminInsetSurfaceClass } from "./adminFieldClasses";

export function FormMediaCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={["p-5 sm:p-6", adminInsetSurfaceClass].join(" ")}>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-brand-black">{title}</h3>
        {description ? (
          <p className="text-xs leading-relaxed text-black/55">{description}</p>
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}
