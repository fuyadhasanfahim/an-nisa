"use client";

import Link from "next/link";
import { format } from "date-fns";
import { IconArrowRight } from "@tabler/icons-react";
import { useListMyOrdersQuery } from "@/store/api/customerOrdersApi";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/Button";
import { formatBdtFromCents } from "@/lib/money/format-bdt-from-cents";
import { authClient } from "@/lib/auth/auth-client";

export default function BoutiqueOrdersPage() {
  const { data: session } = authClient.useSession();
  const { data, isLoading } = useListMyOrdersQuery(undefined, {
    skip: !session,
  });

  if (!session?.user) {
    return (
      <main className="flex-1">
        <Container>
          <div className="py-24">
            <h1 className="font-serif text-3xl">Orders</h1>
            <p className="mt-3 max-w-xl text-black/72 dark:text-white/75">
              Sign in to trace your heirloom fulfillment threads.
            </p>
            <Button asChild className="mt-8 rounded-full px-10">
              <Link href="/sign-in?callbackUrl=/account/orders">Sign in softly</Link>
            </Button>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <Container>
        <div className="py-16 space-y-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-black/53 dark:text-white/62">Client lounge</p>
            <h1 className="mt-2 font-serif text-4xl tracking-tight text-brand-black md:text-[2.7rem] dark:text-white">
              Order ribbon wall
            </h1>
          </div>

          {isLoading || !data ? (
            <div className="space-y-5">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="h-24 animate-pulse rounded-[28px] bg-black/[0.05] dark:bg-white/[0.06]" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {data.items.map((order) => (
                <article
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-[26px] border border-black/10 bg-white px-6 py-5 shadow-softSm dark:border-white/12 dark:bg-black/40"
                >
                  <div className="text-sm uppercase tracking-[0.18em] text-black/50 dark:text-white/65">
                    {format(new Date(order.createdAt), "PPp")}
                  </div>
                  <div className="text-base font-semibold text-brand-black dark:text-white">{order.status}</div>
                  <div className="flex items-center gap-6">
                    <div className="text-lg font-semibold text-brand-black dark:text-white">{formatBdtFromCents(order.totalCents, order.currency)}</div>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-brand-pink px-5 py-[0.72rem] text-[11px] font-semibold uppercase tracking-[0.18em]"
                    >
                      Invoice story <IconArrowRight className="h-4 w-4" stroke={1.85} />
                    </Link>
                  </div>
                </article>
              ))}
              {!data.items.length ? (
                <p className="text-sm text-black/65 dark:text-white/73">Orders will appear once you secure a heirloom.</p>
              ) : null}
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
