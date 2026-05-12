import type { Prisma } from "@prisma/client";

export type OrderDetailSerialized = {
  id: string;
  userId: string;
  status: string;
  subtotalCents: number;
  discountCents: number;
  shippingFeeCents: number;
  totalCents: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentId: string;
  paymentCollectedVia: string;
  shippingPhone: string | null;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingCountry: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string };
  items: {
    id: string;
    productId: string;
    quantity: number;
    unitCents: number;
    createdAt: string;
    product: { id: string; name: string; slug: string };
  }[];
};

export function serializeOrderDetail(
  o: Prisma.OrderGetPayload<{
    include: {
      user: { select: { id: true; name: true; email: true } };
      items: {
        include: {
          product: { select: { id: true; name: true; slug: true } };
        };
      };
    };
  }>
): OrderDetailSerialized {
  return {
    id: o.id,
    userId: o.userId,
    status: o.status,
    subtotalCents: o.subtotalCents,
    discountCents: o.discountCents,
    shippingFeeCents: o.shippingFeeCents,
    totalCents: o.totalCents,
    currency: o.currency,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    paymentId: o.paymentId,
    paymentCollectedVia: o.paymentCollectedVia,
    shippingPhone: o.shippingPhone,
    shippingAddress: o.shippingAddress,
    shippingCity: o.shippingCity,
    shippingCountry: o.shippingCountry,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    user: o.user,
    items: o.items.map((it) => ({
      id: it.id,
      productId: it.productId,
      quantity: it.quantity,
      unitCents: it.unitCents,
      createdAt: it.createdAt.toISOString(),
      product: it.product,
    })),
  };
}
