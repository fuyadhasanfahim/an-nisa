import { CustomersTable } from "@/components/admin/CustomersTable";

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <h1 className="sr-only">Customers</h1>
      <CustomersTable />
    </div>
  );
}
