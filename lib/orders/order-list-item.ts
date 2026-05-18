import type { Prisma } from "@prisma/client";

/** Shape returned by {@link serializeOrderListItem} — matches admin order list API. */
export function serializeOrderListItem(
  o: Prisma.OrderGetPayload<{
    include: {
      user: {
        select: {
          id: true;
          name: true;
          email: true;
          customers: { select: { publicCustomerId: true } };
        };
      };
      items: { select: { quantity: true } };
      invoice: { select: { id: true; number: true } };
    };
  }>,
) {
  const totalQuantity = o.items.reduce((sum, it) => sum + it.quantity, 0);
  const { customers: _customers, ...userRest } = o.user;
  return {
    id: o.id,
    userId: o.userId,
    status: o.status,
    totalCents: o.totalCents,
    currency: o.currency,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    user: userRest,
    customerPublicId: o.user.customers?.publicCustomerId ?? null,
    totalQuantity,
    invoice: o.invoice,
  };
}
