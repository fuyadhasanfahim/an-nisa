import { AdminTitle } from "@/components/admin/AdminTitle";
import { EarningsDashboard } from "@/components/admin/EarningsDashboard";

export default function AdminEarningsPage() {
  return (
    <div className="space-y-6">
      <AdminTitle
        title="Earnings"
        subtitle="Revenue and order mix from your shop — paid orders, trends, and pipeline."
      />
      <EarningsDashboard />
    </div>
  );
}
