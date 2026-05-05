import { AdminTitle } from "@/components/admin/AdminTitle";
import { EarningsChart } from "@/components/admin/EarningsChart";

export default function AdminEarningsPage() {
  return (
    <div className="space-y-6">
      <AdminTitle title="Earnings" subtitle="Revenue analytics (starter)." />
      <div className="space-y-4">
        <EarningsChart />
      </div>
    </div>
  );
}

