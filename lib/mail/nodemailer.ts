import nodemailer from "nodemailer";

// Retrieve SMTP settings from environment variables
const SMTP_USER = process.env.SMTP_USER || "An Nisa's World";
const SMTP_MAIL = process.env.SMTP_MAIL || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_SECURE = process.env.SMTP_SECURE === "true";

const PUBLIC_EMAIL = process.env.NEXT_PUBLIC_EMAIL || "support@annisa.world";
const PUBLIC_PHONE = process.env.NEXT_PUBLIC_PHONE_NUMBER || "+8801799999999";

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_MAIL,
    pass: SMTP_PASS,
  },
});

// Format monetary value helper
function formatBDT(cents: number): string {
  return `৳${(cents / 100).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Generate premium HTML for order confirmation
function generateOrderHtml(order: any, isAdminAlert = false): string {
  const customerName = order.user?.name || "Valued Customer";
  const orderId = order.id || "N/A";
  const items = order.items || [];
  const subtotal = formatBDT(order.subtotalCents || 0);
  const shipping = formatBDT(order.shippingFeeCents || 0);
  const discount = formatBDT(order.discountCents || 0);
  const total = formatBDT(order.totalCents || 0);

  const itemsHtml = items
    .map((item: any) => {
      const productName = item.product?.name || "Bespoke Heirloom Piece";
      const qty = item.quantity || 1;
      const price = formatBDT(item.unitCents || 0);
      const rowTotal = formatBDT((item.unitCents || 0) * qty);
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #fcc4c8/30; font-size: 14px; color: #1c1917; font-family: 'Playfair Display', Georgia, serif;">${productName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #fcc4c8/30; font-size: 14px; color: #78716c; text-align: center;">${qty}</td>
          <td style="padding: 12px; border-bottom: 1px solid #fcc4c8/30; font-size: 14px; color: #78716c; text-align: right;">${price}</td>
          <td style="padding: 12px; border-bottom: 1px solid #fcc4c8/30; font-size: 14px; color: #1c1917; text-align: right; font-weight: bold;">${rowTotal}</td>
        </tr>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${isAdminAlert ? "New Order Notification" : "Your An Nisa's World Order"}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #fffbfa; font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fffbfa; padding: 30px 10px;">
        <tr>
          <td align="center">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #fcc4c8; box-shadow: 0 10px 30px rgba(252, 196, 200, 0.15);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #fff5f6 0%, #fffbfa 100%); padding: 40px 30px; text-align: center; border-bottom: 1px solid #fcc4c8;">
                  <div style="display: inline-block; background-color: #fcc4c8; padding: 12px 24px; margin-bottom: 15px;">
                    <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 14px; font-weight: bold; letter-spacing: 0.3em; text-transform: uppercase; color: #1c1917;">
                      An Nisa's World
                    </span>
                  </div>
                  <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 700; color: #1c1917; margin: 10px 0 5px 0;">
                    ${isAdminAlert ? "New Order Placed!" : "Thank You For Your Order"}
                  </h1>
                  <p style="font-size: 14px; color: #78716c; margin: 0; font-weight: 500;">
                    ${isAdminAlert ? `Order ${orderId} has been successfully processed.` : "We are preparing your exquisite heirloom garments."}
                  </p>
                </td>
              </tr>

              <!-- Greeting & Reference -->
              <tr>
                <td style="padding: 30px 30px 20px 30px;">
                  <p style="font-size: 16px; color: #1c1917; font-weight: 600; margin: 0 0 10px 0;">
                    Hello ${isAdminAlert ? "Admin" : customerName},
                  </p>
                  <p style="font-size: 14px; color: #78716c; line-height: 1.6; margin: 0 0 20px 0;">
                    ${isAdminAlert ? `A new order has been received from <strong>${customerName}</strong> (${order.user?.email || "No Email"}). Here are the details of the purchase.` : "We are absolutely thrilled to weave your order. Below is your detailed receipt. We will notify you via email as soon as your parcel transitions from our atelier to the courier."}
                  </p>
                  
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fffbfa; border: 1px solid #fcc4c8/50; border-radius: 16px; padding: 15px; margin-bottom: 25px;">
                    <tr>
                      <td style="font-size: 13px; color: #78716c; padding: 4px 0;"><strong>Order ID:</strong> #${orderId}</td>
                      <td style="font-size: 13px; color: #78716c; padding: 4px 0; text-align: right;"><strong>Payment Method:</strong> ${order.paymentMethod?.toUpperCase() || "COD"}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 13px; color: #78716c; padding: 4px 0;"><strong>Status:</strong> Pending Verification</td>
                      <td style="font-size: 13px; color: #78716c; padding: 4px 0; text-align: right;"><strong>TrxID:</strong> ${order.paymentId || "N/A"}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Items Table -->
              <tr>
                <td style="padding: 0 30px 20px 30px;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                    <thead>
                      <tr style="border-bottom: 2px solid #fcc4c8;">
                        <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #78716c; letter-spacing: 0.1em;">Garment Item</th>
                        <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #78716c; letter-spacing: 0.1em;">Qty</th>
                        <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #78716c; letter-spacing: 0.1em;">Unit</th>
                        <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #78716c; letter-spacing: 0.1em;">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                </td>
              </tr>

              <!-- Totals -->
              <tr>
                <td style="padding: 0 30px 30px 30px;" align="right">
                  <table role="presentation" width="280" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                    <tr>
                      <td style="padding: 6px 0; font-size: 14px; color: #78716c;">Subtotal:</td>
                      <td style="padding: 6px 0; font-size: 14px; color: #1c1917; text-align: right; font-weight: 500;">${subtotal}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-size: 14px; color: #78716c;">Shipping Fee:</td>
                      <td style="padding: 6px 0; font-size: 14px; color: #1c1917; text-align: right; font-weight: 500;">${shipping}</td>
                    </tr>
                    ${
                      order.discountCents > 0
                        ? `
                    <tr>
                      <td style="padding: 6px 0; font-size: 14px; color: #e11d48;">Discount:</td>
                      <td style="padding: 6px 0; font-size: 14px; color: #e11d48; text-align: right; font-weight: 500;">-${discount}</td>
                    </tr>
                    `
                        : ""
                    }
                    <tr style="border-top: 1px solid #fcc4c8; margin-top: 5px;">
                      <td style="padding: 12px 0 0 0; font-size: 16px; color: #1c1917; font-weight: bold;">Grand Total:</td>
                      <td style="padding: 12px 0 0 0; font-size: 18px; color: #1c1917; text-align: right; font-weight: bold; font-family: 'Playfair Display', Georgia, serif;">${total}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Shipping details -->
              <tr>
                <td style="padding: 30px; background-color: #fffbfa; border-top: 1px solid #fcc4c8; border-bottom: 1px solid #fcc4c8;">
                  <h3 style="font-family: 'Playfair Display', Georgia, serif; font-size: 16px; font-weight: bold; color: #1c1917; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.1em;">
                    Delivery Information
                  </h3>
                  <p style="font-size: 14px; color: #57534e; line-height: 1.6; margin: 0;">
                    <strong>Recipient Phone:</strong> ${order.shippingPhone || "N/A"}<br>
                    <strong>Shipping Address:</strong><br>
                    ${order.shippingAddress}, ${order.shippingCity}, ${order.shippingCountry || "BD"}
                  </p>
                </td>
              </tr>

              <!-- Signature Footer -->
              <tr>
                <td style="padding: 40px 30px; text-align: center; background-color: #ffffff;">
                  <p style="font-size: 14px; color: #78716c; line-height: 1.5; margin: 0 0 15px 0;">
                    If you have any questions or require custom fittings adjustments, please do not hesitate to contact our concierge.
                  </p>
                  <p style="font-size: 14px; color: #1c1917; font-weight: bold; margin: 0 0 25px 0;">
                    Email: <a href="mailto:${PUBLIC_EMAIL}" style="color: #d37b82; text-decoration: none;">${PUBLIC_EMAIL}</a> &nbsp;|&nbsp; Tel/WhatsApp: <a href="tel:${PUBLIC_PHONE}" style="color: #d37b82; text-decoration: none;">${PUBLIC_PHONE}</a>
                  </p>
                  <p style="font-family: 'Playfair Display', Georgia, serif; font-size: 15px; font-style: italic; color: #57534e; margin: 0;">
                    With elegance,<br>
                    <strong>The An Nisa Team</strong>
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top: 20px;">
            <p style="font-size: 11px; color: #a8a29e; font-weight: 500;">
              © ${new Date().getFullYear()} An-Nisa's World. All rights reserved. Dhaka, Bangladesh.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Sends order confirmation emails asynchronously.
 * Delivers one receipt to the customer and one notification alert to the admin/owner.
 */
export async function sendOrderEmails(order: any): Promise<boolean> {
  if (!SMTP_MAIL || !SMTP_PASS) {
    console.warn("[nodemailer] Missing SMTP credentials. Order email notification skipped.");
    return false;
  }

  const customerEmail = order.user?.email;
  const orderId = order.id || "N/A";

  try {
    // 1. Send receipt to Customer (if email exists)
    if (customerEmail) {
      const customerMailOptions = {
        from: `"${SMTP_USER}" <${SMTP_MAIL}>`,
        to: customerEmail,
        subject: `Your Order Confirmation #${orderId} — An Nisa's World`,
        html: generateOrderHtml(order, false),
      };

      await transporter.sendMail(customerMailOptions);
      console.log(`[nodemailer] Order confirmation email successfully sent to ${customerEmail}`);
    } else {
      console.warn(`[nodemailer] Customer has no email associated. Skipping receipt email.`);
    }

    // 2. Send notification to Store Admin
    if (PUBLIC_EMAIL) {
      const adminMailOptions = {
        from: `"${SMTP_USER} Atelier" <${SMTP_MAIL}>`,
        to: PUBLIC_EMAIL,
        subject: `🚨 [NEW ORDER #${orderId}] Placed by ${order.user?.name || "Customer"}`,
        html: generateOrderHtml(order, true),
      };

      await transporter.sendMail(adminMailOptions);
      console.log(`[nodemailer] Admin order alert email successfully sent to ${PUBLIC_EMAIL}`);
    }

    return true;
  } catch (error) {
    console.error("[nodemailer] Failed to deliver order transactional emails:", error);
    return false;
  }
}
