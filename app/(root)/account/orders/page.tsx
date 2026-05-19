"use client";

import Link from "next/link";
import { format } from "date-fns";
import { IconArrowRight, IconLock } from "@tabler/icons-react";
import { useListMyOrdersQuery } from "@/store/api/customerOrdersApi";
import { Container } from "@/components/shared/Container";
import { formatBdtFromCents } from "@/lib/money/format-bdt-from-cents";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils/cn";

export default function BoutiqueOrdersPage() {
  const { data: session } = authClient.useSession();
  const { data, isLoading } = useListMyOrdersQuery(undefined, {
    skip: !session,
  });

  if (!session?.user) {
    return (
      <main className="flex-1 bg-[radial-gradient(circle,_rgba(252,196,200,0.12),transparent_70%)] py-20">
        <Container>
          <div className="py-24 text-center rounded-[32px] border border-[#fcc4c8]/35 bg-white p-8 shadow-[0_12px_40px_rgba(252,196,200,0.08)] max-w-lg mx-auto">
            <IconLock className="mx-auto h-14 w-14 text-[#fcc4c8]" />
            <p className="mt-6 font-serif text-2xl font-bold text-brand-black">Sign in to proceed</p>
            <p className="mt-2 text-sm text-black/55 font-semibold">Please authenticate to trace your order fulfillment threads.</p>
            <Link
              href="/sign-in?callbackUrl=/account/orders"
              className="mt-8 inline-block rounded-full bg-[#fcc4c8] text-brand-black font-bold text-xs uppercase tracking-wider px-10 py-3.5 transition-all duration-300 shadow-sm hover:bg-[#fcc4c8]/85 hover:scale-105 active:scale-95 border-none cursor-pointer select-none"
            >
              Sign In Softly
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[radial-gradient(circle,_rgba(252,196,200,0.12),transparent_70%)] py-14">
      <Container>
        <div className="py-8 space-y-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/45 font-serif">Client lounge</p>
            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-brand-black md:text-[2.6rem]">
              Order Ribbon Wall
            </h1>
          </div>

          {isLoading || !data ? (
            <div className="space-y-5">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="h-24 animate-pulse rounded-[28px] bg-[#fcc4c8]/5 border border-[#fcc4c8]/10" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {data.items.map((order) => (
                <article
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#fcc4c8]/35 bg-white px-6 py-5 shadow-[0_8px_32px_rgba(252,196,200,0.04)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(252,196,200,0.08)] hover:border-[#fcc4c8]/60"
                >
                  <div className="text-sm font-semibold text-black/60 font-serif">
                    {format(new Date(order.createdAt), "PPp")}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-[#fcc4c8]/10 text-brand-black border border-[#fcc4c8]/25 select-none">
                    {order.status}
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-lg font-serif font-bold text-brand-black tracking-tight">
                      {formatBdtFromCents(order.totalCents, order.currency)}
                    </div>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#fcc4c8]/60 bg-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-brand-black hover:bg-[#fcc4c8]/10 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 shadow-sm cursor-pointer select-none"
                    >
                      Invoice details <IconArrowRight className="h-3.5 w-3.5 text-black/60" stroke={2} />
                    </Link>
                  </div>
                </article>
              ))}
              {!data.items.length ? (
                <p className="text-sm text-black/55 font-semibold text-center py-10">
                  No orders found. Once you secure a heirloom, it will manifest here.
                </p>
              ) : null}
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
