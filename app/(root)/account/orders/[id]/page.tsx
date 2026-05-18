"use client";

import Link from "next/link";
import { skipToken } from "@reduxjs/toolkit/query";
import { useParams } from "next/navigation";
import { useGetMyOrderQuery } from "@/store/api/customerOrdersApi";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/Button";
import { formatBdtFromCents } from "@/lib/money/format-bdt-from-cents";

export default function BoutiqueOrderDetailPage() {
  const params = useParams<{ id?: string | string[] }>();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : undefined;

  const { data, isLoading } = useGetMyOrderQuery(id ?? skipToken);

  if (!id || isLoading) {
    return (
      <main className="flex-1">
        <Container>
          <div className="py-20 text-sm text-black/70 dark:text-white/75">
            Gathering stitch ledger…
          </div>
        </Container>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex-1">
        <Container>
          <div className="py-24 text-sm">
            Order not traced. Try from{" "}
            <Link href="/account/orders" className="text-brand-black underline dark:text-white">
              orders ribbon
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <Container>
        <div className="py-14 space-y-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-black/53 dark:text-white/62">
                Receipt thread
              </p>
              <h1 className="mt-2 font-serif text-4xl tracking-tight text-brand-black dark:text-white">
                Invoice for {data.id}
              </h1>
            </div>
            <Button asChild variant="outline" className="rounded-full px-9">
              <Link href="/account/orders">All orders</Link>
            </Button>
          </div>

          <section className="grid gap-6 rounded-[38px] border border-black/10 bg-white px-8 py-8 shadow-soft dark:border-white/12 dark:bg-black/45 md:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-black/53 dark:text-white/62">
                Recipient
              </div>
              <div className="mt-4 text-brand-black dark:text-white">
                <div className="text-lg font-semibold">{data.user.name}</div>
                <div className="mt-2 text-[13px] text-black/70 dark:text-white/73">{data.user.email}</div>
              </div>
              <div className="mt-6 text-[13px] text-black/70 dark:text-white/72">
                {data.shippingPhone ? <div>Phone • {data.shippingPhone}</div> : null}
                {data.shippingAddress ? <div className="mt-2">{data.shippingAddress}</div> : null}
                {data.shippingCity ? <div className="mt-2">{data.shippingCity}</div> : null}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-black/53 dark:text-white/62">
                Order status
              </div>
              <div className="mt-4 text-2xl font-semibold text-brand-black dark:text-white">{data.status}</div>
              <div className="mt-4 text-sm text-black/70 dark:text-white/72">
                Payment • {data.paymentMethod} / {data.paymentStatus}
              </div>
              {data.invoice ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild className="rounded-full px-7">
                    <a href={`/api/invoices/${data.invoice.id}/pdf`} download>
                      Download PDF
                    </a>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full px-7"
                    onClick={() => window.print()}
                  >
                    Print keepsake
                  </Button>
                </div>
              ) : (
                <p className="mt-6 text-sm text-black/65 dark:text-white/70">
                  Invoice will appear once the atelier finalizes accounting.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-[34px] border border-black/10 bg-[color-mix(in_srgb,var(--background)_94%,transparent)] px-8 py-8 dark:border-white/12">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.24em] text-black/50 dark:text-white/62">
                  <th className="pb-6">Keepsake</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Line sum</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id} className="border-t border-black/12 text-sm dark:border-white/10">
                    <td className="py-6 font-semibold text-brand-black dark:text-white">{item.product.name}</td>
                    <td>{item.quantity}</td>
                    <td>{formatBdtFromCents(item.unitCents, data.currency)}</td>
                    <td>{formatBdtFromCents(item.unitCents * item.quantity, data.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-8 ml-auto grid w-full max-w-sm gap-4 text-sm font-semibold text-brand-black dark:text-white md:text-[15px]">
              <div className="flex justify-between"><span className="text-black/62 dark:text-white/73">Goods</span><span>{formatBdtFromCents(data.subtotalCents, data.currency)}</span></div>
              <div className="flex justify-between"><span className="text-black/62 dark:text-white/73">Courtesy trims</span><span>− {formatBdtFromCents(data.discountCents, data.currency)}</span></div>
              <div className="flex justify-between"><span className="text-black/62 dark:text-white/73">Courier</span><span>{formatBdtFromCents(data.shippingFeeCents, data.currency)}</span></div>
              <div className="flex justify-between border-t border-black/14 pt-4 text-xl dark:border-white/12">
                <span>Golden total</span>
                <span>{formatBdtFromCents(data.totalCents, data.currency)}</span>
              </div>
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
}
