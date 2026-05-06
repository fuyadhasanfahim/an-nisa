export function FormActions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "flex flex-col-reverse gap-3 border-t border-black/5 pt-8 sm:flex-row sm:justify-end sm:gap-3",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
