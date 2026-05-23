import { prisma } from "@/lib/db/prisma";
import { allocateUniqueInvoiceNumber } from "@/lib/ids/public-ref";
import { generateInvoicePdfBuffer } from "@/lib/pdf/generateInvoicePdf";
import type { InvoicePdfModel } from "@/lib/pdf/InvoiceDocument";
import { sendInvoicePaidEmail } from "@/lib/mail/nodemailer";

/**
 * Handles generating a tax invoice database record (if one does not exist)
 * and emailing the compiled invoice PDF as an attachment to the customer
 * when an order status shifts to paid.
 */
export async function handlePaymentPaidNotification(orderId: string): Promise<void> {
  try {
    // 1. Fetch complete order details including user and items (with product name)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: { select: { name: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        invoice: true,
      },
    });

    if (!order) {
      console.error(`[handlePaymentPaidNotification] Order ${orderId} not found.`);
      return;
    }

    // 2. Check if invoice exists. If not, create it safely inside a transaction.
    let invoice = order.invoice;
    if (!invoice) {
      invoice = await prisma.$transaction(async (tx) => {
        // Double check inside transaction to avoid race conditions
        const existingInv = await tx.invoice.findUnique({
          where: { orderId: order.id },
        });
        if (existingInv) return existingInv;

        const number = await allocateUniqueInvoiceNumber(tx);
        return tx.invoice.create({
          data: {
            orderId: order.id,
            userId: order.userId,
            number,
            totalCents: order.totalCents,
            currency: order.currency,
          },
        });
      });
      console.log(`[handlePaymentPaidNotification] Created new invoice ${invoice.number} for order ${order.id}`);
    } else {
      console.log(`[handlePaymentPaidNotification] Using existing invoice ${invoice.number} for order ${order.id}`);
    }

    // 3. Construct InvoicePdfModel
    const model: InvoicePdfModel = {
      number: invoice.number,
      issuedAtIso: invoice.issuedAt.toISOString(),
      customer: {
        name: order.user.name,
        email: order.user.email,
      },
      currency: invoice.currency,
      items: order.items.map((it) => ({
        name: it.product.name,
        quantity: it.quantity,
        unitCents: it.unitCents,
      })),
      subtotalCents: order.subtotalCents,
      discountCents: order.discountCents,
      shippingFeeCents: order.shippingFeeCents,
      totalCents: invoice.totalCents,
    };

    // 4. Generate PDF buffer
    const pdfBuffer = await generateInvoicePdfBuffer(model);

    // 5. Send email to customer with attachment
    await sendInvoicePaidEmail(order, invoice.number, Buffer.from(pdfBuffer));
  } catch (error) {
    console.error(`[handlePaymentPaidNotification] Error processing payment email notification for order ${orderId}:`, error);
  }
}
