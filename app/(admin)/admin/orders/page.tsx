import { AdminTitle } from "@/components/admin/AdminTitle";
import { OrdersTable } from "@/components/admin/OrdersTable";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <AdminTitle title="Orders" subtitle="Track and fulfill orders." />
      <div className="space-y-4">
        <OrdersTable />
      </div>
    </div>
  );
}

