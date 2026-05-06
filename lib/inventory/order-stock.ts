import type { Prisma } from "@prisma/client";

type Tx = Prisma.TransactionClient;

export class InsufficientStockError extends Error {
  constructor() {
    super("INSUFFICIENT_STOCK");
    this.name = "InsufficientStockError";
  }
}

export class OrderNotFoundError extends Error {
  constructor() {
    super("NOT_FOUND");
    this.name = "OrderNotFoundError";
  }
}

export function aggregateQtyByProductId(
  lines: { productId: string; quantity: number }[]
): Map<string, number> {
  const m = new Map<string, number>();
  for (const l of lines) {
    m.set(l.productId, (m.get(l.productId) ?? 0) + l.quantity);
  }
  return m;
}

async function loadTrackAndStock(
  tx: Tx,
  productIds: string[]
): Promise<Map<string, { trackInventory: boolean; stockQuantity: number }>> {
  const products = await tx.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, trackInventory: true, stockQuantity: true },
  });
  return new Map(products.map((p) => [p.id, p]));
}

/** Reduces on-hand stock for each product (skipped when trackInventory is false). */
export async function decrementStockForQuantities(
  tx: Tx,
  byProduct: Map<string, number>
): Promise<void> {
  const ids = [...byProduct.keys()];
  if (ids.length === 0) return;

  const meta = await loadTrackAndStock(tx, ids);
  for (const [productId, qty] of byProduct) {
    if (qty <= 0) continue;
    if (!meta.has(productId)) throw new InsufficientStockError();
    const m = meta.get(productId)!;
    if (!m.trackInventory) continue;

    const r = await tx.product.updateMany({
      where: { id: productId, stockQuantity: { gte: qty } },
      data: { stockQuantity: { decrement: qty } },
    });
    if (r.count !== 1) throw new InsufficientStockError();
  }
}

/** Returns reserved stock to on-hand (skipped when trackInventory is false). */
export async function incrementStockForQuantities(
  tx: Tx,
  byProduct: Map<string, number>
): Promise<void> {
  const ids = [...byProduct.keys()];
  if (ids.length === 0) return;

  const meta = await loadTrackAndStock(tx, ids);
  for (const [productId, qty] of byProduct) {
    if (qty <= 0) continue;
    const m = meta.get(productId);
    if (!m?.trackInventory) continue;
    await tx.product.update({
      where: { id: productId },
      data: { stockQuantity: { increment: qty } },
    });
  }
}

export function orderCountsAgainstStock(status: string): boolean {
  return status !== "cancelled";
}
