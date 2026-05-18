import { ExpensesSection } from "@/components/admin/ExpensesSection";

export default function AdminExpensesPage() {
  return (
    <div className="space-y-6">
      <h1 className="sr-only">Expenses</h1>
      <ExpensesSection />
    </div>
  );
}
