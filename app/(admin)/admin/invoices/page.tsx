import { AdminTitle } from "@/components/admin/AdminTitle";
import Link from "next/link";

export default function AdminInvoicesPage() {
  return (
    <div className="space-y-6">
      <AdminTitle title="Invoices" subtitle="Generate and download PDFs." />
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="text-sm text-black/70">
          Starter invoice download endpoint:
        </div>
        <Link
          href="/api/invoices/sample.pdf"
          className="mt-4 inline-flex rounded-xl bg-brand-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black hover:shadow-softSm"
        >
          Download sample invoice PDF
        </Link>
      </div>
    </div>
  );
}

