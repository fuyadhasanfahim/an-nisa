import { AdminTitle } from "@/components/admin/AdminTitle";
import { CustomersTable } from "@/components/admin/CustomersTable";

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <AdminTitle
        title="Customers"
        subtitle="Registered accounts and public customer IDs."
      />
      <CustomersTable />
    </div>
  );
}
