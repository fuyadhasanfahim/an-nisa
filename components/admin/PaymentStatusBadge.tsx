const LABELS: Record<string, string> = {
  paid: "Paid",
  pending: "Unpaid",
  failed: "Failed",
};

export function paymentStatusLabel(status: string): string {
  const k = status.toLowerCase();
  return LABELS[k] ?? status.charAt(0).toUpperCase() + status.slice(1);
}

/** Small pill for order tables / modals (Bangla UX: paid বোঝা যাবে এক নজরে). */
export function PaymentStatusBadge({ status }: { status: string }) {
  const k = status.toLowerCase();
  const label = paymentStatusLabel(status);

  const styles =
    k === "paid"
      ? "bg-emerald-50 text-emerald-900 ring-emerald-200/80"
      : k === "failed"
        ? "bg-rose-50 text-rose-900 ring-rose-200/80"
        : "bg-amber-50 text-amber-950 ring-amber-200/80";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1",
        styles,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
