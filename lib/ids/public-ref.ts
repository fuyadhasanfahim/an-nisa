import type { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";

type DbClient = Prisma.TransactionClient | PrismaClient;

/** Random 4–5 digit numeric string (no leading zero issue — min is 1000 / 10000). */
export function randomNumericSuffix(
  minDigits = 4,
  maxDigits = 5
): string {
  const digits =
    minDigits === maxDigits
      ? minDigits
      : minDigits + Math.floor(Math.random() * (maxDigits - minDigits + 1));
  const min = 10 ** (digits - 1);
  const max = 10 ** digits - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

export function publicOrderId(): string {
  return `order-${randomNumericSuffix()}`;
}

export function publicProductId(): string {
  return `product-${randomNumericSuffix()}`;
}

export function publicCustomerId(): string {
  return `customer-${randomNumericSuffix()}`;
}

export function publicInvoiceNumber(): string {
  return `invoice-${randomNumericSuffix()}`;
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "P2002"
  );
}

export async function allocateUniqueOrderId(tx: DbClient): Promise<string> {
  for (let i = 0; i < 25; i++) {
    const id = publicOrderId();
    const exists = await tx.order.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) return id;
  }
  throw new Error("Could not allocate order id");
}

export async function allocateUniqueProductId(tx: DbClient): Promise<string> {
  for (let i = 0; i < 25; i++) {
    const id = publicProductId();
    const exists = await tx.product.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) return id;
  }
  throw new Error("Could not allocate product id");
}

export async function allocateUniqueInvoiceNumber(tx: DbClient): Promise<string> {
  for (let i = 0; i < 25; i++) {
    const number = publicInvoiceNumber();
    const exists = await tx.invoice.findUnique({
      where: { number },
      select: { id: true },
    });
    if (!exists) return number;
  }
  throw new Error("Could not allocate invoice number");
}

/**
 * Ensures the user has a CustomerProfile row with a stable publicCustomerId
 * (customer-1234 style).
 */
export async function ensureCustomerPublicId(
  db: DbClient,
  userId: string
): Promise<string> {
  const row = await db.customerProfile.findUnique({
    where: { userId },
    select: { id: true, publicCustomerId: true },
  });
  if (row?.publicCustomerId) return row.publicCustomerId;

  for (let attempt = 0; attempt < 25; attempt++) {
    const candidate = publicCustomerId();
    try {
      if (!row) {
        await db.customerProfile.create({
          data: { userId, publicCustomerId: candidate },
        });
      } else {
        await db.customerProfile.update({
          where: { userId },
          data: { publicCustomerId: candidate },
        });
      }
      return candidate;
    } catch (err) {
      if (isUniqueViolation(err)) continue;
      throw err;
    }
  }
  throw new Error("Could not allocate customer id");
}
