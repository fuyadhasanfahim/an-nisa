/** Line totals for an order before discount and shipping (cents). */
export function linesSubtotalCents(
  lines: readonly { unitCents: number; quantity: number }[]
): number {
  return lines.reduce((s, l) => s + l.unitCents * l.quantity, 0);
}

export function finalizeOrderTotals(args: {
  lines: readonly { unitCents: number; quantity: number }[];
  discountCents: number;
  shippingFeeCents: number;
}): {
  subtotalCents: number;
  discountCents: number;
  shippingFeeCents: number;
  totalCents: number;
} {
  const subtotalCents = linesSubtotalCents(args.lines);
  const discountCents = Math.min(
    Math.max(0, Math.floor(args.discountCents)),
    subtotalCents
  );
  const shippingFeeCents = Math.max(0, Math.floor(args.shippingFeeCents));
  const totalCents = subtotalCents - discountCents + shippingFeeCents;
  return { subtotalCents, discountCents, shippingFeeCents, totalCents };
}
