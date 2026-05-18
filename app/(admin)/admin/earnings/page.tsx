import { EarningsDashboard } from "@/components/admin/EarningsDashboard";
import { ExpensesSection } from "@/components/admin/ExpensesSection";

export default function AdminEarningsPage() {
  return (
    <div className="space-y-6">
      <h1 className="sr-only">Earnings</h1>
      <EarningsDashboard />
      <ExpensesSection />
    </div>
  );
}
