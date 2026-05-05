import { AdminTitle } from "@/components/admin/AdminTitle";

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <AdminTitle title="Customers" subtitle="Customer list (starter)." />
      <div className="rounded-xl bg-white p-6 shadow-sm text-sm text-black/70">
        Wire this to Prisma when you add customer profiles.
      </div>
    </div>
  );
}

