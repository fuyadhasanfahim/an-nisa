export function AdminFormButton({
  variant = "primary",
  loading,
  type = "button",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  loading?: boolean;
}) {
  const base =
    "inline-flex w-full items-center justify-center whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-medium leading-none tracking-tight transition-transform focus:outline-none focus:ring-2 focus:ring-brand-pink/40 disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:scale-[1.02] enabled:active:scale-[0.98] min-h-11 sm:w-auto sm:min-w-[7.5rem]";
  const styles =
    variant === "primary"
      ? "bg-[#0b0b0f] text-white shadow-sm hover:shadow-softSm"
      : "bg-white text-brand-black ring-1 ring-black/10 hover:bg-black/5";
  return (
    <button
      type={type}
      {...props}
      className={[base, styles, className ?? ""].filter(Boolean).join(" ")}
    >
      {loading ? "Saving…" : children}
    </button>
  );
}
