import { Suspense } from "react";
import { AdminTitle } from "@/components/admin/AdminTitle";
import { InvoicesSection } from "@/components/admin/InvoicesSection";

function InvoicesFallback() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 text-sm text-black/60 shadow-sm ring-1 ring-black/5">
        Loading invoices…
      </div>
    </div>
  );
}

export default function AdminInvoicesPage() {
  return (
    <div className="space-y-6">
      <AdminTitle
        title="Invoices"
        subtitle="Issue invoices from orders and download PDFs aligned with totals."
      />
      <Suspense fallback={<InvoicesFallback />}>
        <InvoicesSection />
      </Suspense>
    </div>
  );
}
