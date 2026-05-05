import { AdminTitle } from "@/components/admin/AdminTitle";

export default function AdminHome() {
  return (
    <div className="space-y-6">
      <AdminTitle
        title="Overview"
        subtitle="Starter admin dashboard with tables, charts, and invoices."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Revenue", value: "৳12,450" },
          { label: "Orders", value: "128" },
          { label: "Customers", value: "64" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={[
              "relative rounded-xl bg-white p-6 shadow-sm transition",
              "hover:-translate-y-px hover:shadow-softSm",
              "after:pointer-events-none after:absolute after:inset-0 after:rounded-xl after:border-2 after:border-dashed after:border-brand-pink/40 after:opacity-0 after:transition",
              "hover:after:opacity-100",
            ].join(" ")}
          >
            <div className="text-xs font-medium tracking-wide text-black/55">
              {kpi.label}
            </div>
            <div className="mt-3 font-serif text-3xl tracking-tight text-brand-black">
              {kpi.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

