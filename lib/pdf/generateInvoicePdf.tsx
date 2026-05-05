import { renderToBuffer } from "@react-pdf/renderer";
import { InvoiceDocument, type InvoicePdfModel } from "@/lib/pdf/InvoiceDocument";

export async function generateInvoicePdfBuffer(invoice: InvoicePdfModel) {
  const pdf = <InvoiceDocument invoice={invoice} />;
  return await renderToBuffer(pdf);
}

