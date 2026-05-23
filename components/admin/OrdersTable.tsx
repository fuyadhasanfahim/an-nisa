'use client';

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    useTransition,
} from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DataTable } from '@/components/admin/DataTable';
import {
    useDeleteOrderMutation,
    useListOrdersQuery,
    usePatchOrderMutation,
} from '@/store/api/ordersApi';
import Link from 'next/link';
import { IconEye, IconFileDownload, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/components/shared/toast/useToast';
import { ConfirmAlertDialog } from '@/components/ui/ConfirmAlertDialog';
import { OrderDetailModal } from '@/components/admin/OrderDetailModal';
import {
    ORDER_LIST_FULL_LIMIT,
    ORDER_SORT_FIELDS,
    normalizeOrderListQuery,
    type OrderListQuery,
    type OrderListSortField,
} from '@/lib/validators/order-list.query';
import { ORDER_STATUSES } from '@/lib/validators/order.schema';
import { adminControlClass, FormSelect } from '@/components/admin/form';

const SORT_OPTIONS: {
    value: `${OrderListSortField}:${'asc' | 'desc'}`;
    label: string;
}[] = [
    { value: 'createdAt:desc', label: 'Newest' },
    { value: 'createdAt:asc', label: 'Oldest' },
    { value: 'updatedAt:desc', label: 'Recently updated' },
    { value: 'updatedAt:asc', label: 'Least recently updated' },
    { value: 'totalCents:desc', label: 'Total: high to low' },
    { value: 'totalCents:asc', label: 'Total: low to high' },
    { value: 'status:asc', label: 'Status A–Z' },
    { value: 'status:desc', label: 'Status Z–A' },
];

function sortTupleFromSelect(v: string): {
    sort: OrderListSortField;
    order: 'asc' | 'desc';
} {
    const idx = v.indexOf(':');
    if (idx === -1) return { sort: 'createdAt', order: 'desc' };
    const sort = v.slice(0, idx) as OrderListSortField;
    const order = v.slice(idx + 1) as 'asc' | 'desc';
    if (
        !ORDER_SORT_FIELDS.includes(sort as OrderListSortField) ||
        (order !== 'asc' && order !== 'desc')
    ) {
        return { sort: 'createdAt', order: 'desc' };
    }
    return { sort, order };
}

/** Orders list URL: search + sort only (no pagination). */
function ordersToolbarQueryToSearchString(
    p: Pick<OrderListQuery, 'q' | 'sort' | 'order' | 'withoutInvoice'>,
): string {
    const sp = new URLSearchParams();
    if (p.q) sp.set('q', p.q);
    sp.set('sort', p.sort);
    sp.set('order', p.order);
    if (p.withoutInvoice) sp.set('withoutInvoice', '1');
    return sp.toString();
}

type Row = {
    id: string;
    status: string;
    totalCents: number;
    createdAt: string;
    customerPublicId: string | null;
    totalQuantity: number;
    paymentStatus: string;
};

function OrderStatusCell({
    orderId,
    status,
}: {
    orderId: string;
    status: string;
}) {
    const { toast } = useToast();
    const [patch, { isLoading }] = usePatchOrderMutation();

    const onChange = useCallback(
        async (e: React.ChangeEvent<HTMLSelectElement>) => {
            const next = e.target.value as (typeof ORDER_STATUSES)[number];
            if (next === status) return;
            try {
                await patch({ id: orderId, body: { status: next } }).unwrap();
                toast({
                    title: 'Status updated',
                    message: `Order is now ${next}.`,
                    variant: 'success',
                });
            } catch (err: unknown) {
                const msg =
                    typeof err === 'object' && err && 'data' in err
                        ? String(
                              (err as { data?: { error?: string } }).data
                                  ?.error ?? '',
                          )
                        : '';
                toast({
                    title: 'Couldn’t update status',
                    message: msg || 'Something went wrong.',
                    variant: 'error',
                });
            }
        },
        [orderId, patch, status, toast],
    );

    const safeStatus = (ORDER_STATUSES as readonly string[]).includes(status)
        ? status
        : 'pending';

    return (
        <div className="w-full max-w-[160px]">
            <FormSelect
                value={safeStatus}
                disabled={isLoading}
                onChange={(ev) => void onChange(ev)}
                aria-label="Order status"
            >
                {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                ))}
            </FormSelect>
        </div>
    );
}

function PaymentStatusCell({
    orderId,
    paymentStatus,
}: {
    orderId: string;
    paymentStatus: string;
}) {
    const { toast } = useToast();
    const [patch, { isLoading }] = usePatchOrderMutation();

    const uiValue = paymentStatus === 'paid' ? 'paid' : 'pending';

    const onChange = useCallback(
        async (e: React.ChangeEvent<HTMLSelectElement>) => {
            const next = e.target.value as 'paid' | 'pending';
            if (next === uiValue) return;
            try {
                await patch({
                    id: orderId,
                    body: { paymentStatus: next },
                }).unwrap();
                toast({
                    title: 'Payment updated',
                    message:
                        next === 'paid'
                            ? 'Marked as paid.'
                            : 'Marked as unpaid.',
                    variant: 'success',
                });
            } catch (err: unknown) {
                const msg =
                    typeof err === 'object' && err && 'data' in err
                        ? String(
                              (err as { data?: { error?: string } }).data
                                  ?.error ?? '',
                          )
                        : '';
                toast({
                    title: 'Couldn’t update payment status',
                    message: msg || 'Something went wrong.',
                    variant: 'error',
                });
            }
        },
        [orderId, patch, toast, uiValue],
    );

    return (
        <div className="w-full max-w-[140px]">
            <FormSelect
                value={uiValue}
                disabled={isLoading}
                onChange={(ev) => void onChange(ev)}
                aria-label="Payment status"
            >
                <option value="pending">Unpaid</option>
                <option value="paid">Paid</option>
            </FormSelect>
        </div>
    );
}

function OrderActionsCell({
    orderId,
    onView,
}: {
    orderId: string;
    onView: () => void;
}) {
    const router = useRouter();
    const { toast } = useToast();
    const [deleteOrder, { isLoading }] = useDeleteOrderMutation();
    const [deleteOpen, setDeleteOpen] = useState(false);

    const comboBtn =
        'grid h-9 w-9 place-items-center text-black/65 transition hover:bg-black/[0.04] hover:text-brand-black focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink/40 disabled:opacity-50';
    const comboBtnFirst = 'rounded-l-xl';
    const comboBtnLast = 'rounded-r-xl';

    const performDelete = useCallback(async () => {
        try {
            await deleteOrder(orderId).unwrap();
            toast({
                title: 'Order deleted',
                message: 'Removed from the list.',
                variant: 'success',
            });
            setDeleteOpen(false);
            router.refresh();
        } catch (e: unknown) {
            const msg =
                typeof e === 'object' && e && 'data' in e
                    ? String(
                          (e as { data?: { error?: string } }).data?.error ??
                              '',
                      )
                    : '';
            toast({
                title: 'Couldn’t delete order',
                message: msg || 'Something went wrong.',
                variant: 'error',
            });
        }
    }, [deleteOrder, orderId, router, toast]);

    return (
        <>
            <ConfirmAlertDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                variant="destructive"
                title="Delete this order?"
                description="This permanently removes the order and its line items. Invoices tied to this order will be removed as well."
                confirmLabel="Delete order"
                cancelLabel="Cancel"
                loading={isLoading}
                onConfirm={performDelete}
            />
            <div className="flex justify-end">
                <div
                    className={[
                        'inline-flex rounded-xl bg-white',
                        'shadow-sm ring-1 ring-black/10',
                        'divide-x divide-black/10',
                    ].join(' ')}
                >
                    <button
                        type="button"
                        className={`${comboBtn} ${comboBtnFirst}`}
                        title="View"
                        aria-label="View order"
                        onClick={onView}
                    >
                        <IconEye className="h-4 w-4" stroke={2} />
                    </button>
                    <Link
                        href={`/admin/orders/${orderId}`}
                        className={comboBtn}
                        title="Edit"
                        aria-label="Edit order"
                    >
                        <IconPencil className="h-4 w-4" stroke={2} />
                    </Link>
                    <a
                        href={`/api/orders/${orderId}/pdf`}
                        className={comboBtn}
                        title="Download PDF"
                        aria-label="Download PDF invoice"
                    >
                        <IconFileDownload className="h-4 w-4" stroke={2} />
                    </a>
                    <button
                        type="button"
                        className={`${comboBtn} ${comboBtnLast}`}
                        title="Delete"
                        aria-label="Delete order"
                        disabled={isLoading}
                        onClick={() => setDeleteOpen(true)}
                    >
                        <IconTrash className="h-4 w-4" stroke={2} />
                    </button>
                </div>
            </div>
        </>
    );
}

function buildColumns(
    col: ReturnType<typeof createColumnHelper<Row>>,
    opts: { onViewOrder: (id: string) => void },
) {
    return [
        col.accessor('id', {
            header: 'Order',
            cell: (ctx) => (
                <span className="font-mono text-xs text-black/85">
                    {ctx.getValue()}
                </span>
            ),
        }),
        col.accessor('customerPublicId', {
            header: 'Customer ID',
            cell: (ctx) => (
                <span className="font-mono text-xs uppercase tracking-wide text-black/85">
                    {ctx.getValue() ?? '—'}
                </span>
            ),
        }),
        col.display({
            id: 'status',
            header: 'Status',
            cell: (ctx) => (
                <OrderStatusCell
                    orderId={ctx.row.original.id}
                    status={ctx.row.original.status}
                />
            ),
        }),
        col.accessor('totalQuantity', {
            header: 'Qty',
            cell: (ctx) => (
                <span className="tabular-nums text-black/75">
                    {ctx.getValue()}
                </span>
            ),
        }),
        col.display({
            id: 'paymentStatus',
            header: 'Payment status',
            cell: (ctx) => (
                <PaymentStatusCell
                    orderId={ctx.row.original.id}
                    paymentStatus={ctx.row.original.paymentStatus}
                />
            ),
        }),
        col.accessor('totalCents', {
            header: 'Total',
            cell: (ctx) => `৳ ${(ctx.getValue() / 100).toFixed(2)}`,
        }),
        col.accessor('createdAt', {
            header: 'Created',
            cell: (ctx) => format(parseISO(ctx.getValue()), 'PPP'),
        }),
        col.display({
            id: 'actions',
            header: () => <div className="text-end">Actions</div>,
            cell: (ctx) => (
                <OrderActionsCell
                    orderId={ctx.row.original.id}
                    onView={() => opts.onViewOrder(ctx.row.original.id)}
                />
            ),
        }),
    ];
}

export function OrdersTable() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const [, startTransition] = useTransition();
    const [viewOrderId, setViewOrderId] = useState<string | null>(null);

    const onViewOrder = useCallback((id: string) => {
        setViewOrderId(id);
    }, []);

    const listQuery = useMemo(() => {
        const parsed = normalizeOrderListQuery({
            q: searchParams.get('q'),
            sort: searchParams.get('sort'),
            order: searchParams.get('order'),
            page: 1,
            limit: ORDER_LIST_FULL_LIMIT,
            withoutInvoice: searchParams.get('withoutInvoice'),
        });
        return { ...parsed, page: 1, limit: ORDER_LIST_FULL_LIMIT };
    }, [searchParams]);

    const { data, isLoading, isFetching } = useListOrdersQuery(listQuery);

    const [searchDraft, setSearchDraft] = useState(listQuery.q);
    useEffect(() => {
        startTransition(() => {
            setSearchDraft(listQuery.q);
        });
    }, [listQuery.q, startTransition]);

    useEffect(() => {
        const t = window.setTimeout(() => {
            const nextQ = searchDraft.trim().slice(0, 200);
            if (nextQ === listQuery.q) return;
            const next: OrderListQuery = {
                ...listQuery,
                q: nextQ,
                page: 1,
                limit: ORDER_LIST_FULL_LIMIT,
            };
            router.replace(
                `${pathname}?${ordersToolbarQueryToSearchString(next)}`,
            );
        }, 400);
        return () => window.clearTimeout(t);
    }, [searchDraft, listQuery, pathname, router]);

    const pushQuery = useCallback(
        (patch: Partial<OrderListQuery>) => {
            const next = {
                ...listQuery,
                ...patch,
                page: 1,
                limit: ORDER_LIST_FULL_LIMIT,
            };
            router.replace(
                `${pathname}?${ordersToolbarQueryToSearchString(next)}`,
            );
        },
        [listQuery, pathname, router],
    );

    const col = useMemo(() => createColumnHelper<Row>(), []);
    const columns = useMemo(
        () => buildColumns(col, { onViewOrder }),
        [col, onViewOrder],
    );

    const rows: Row[] =
        data?.items.map((o) => ({
            id: o.id,
            status: o.status,
            totalCents: o.totalCents,
            createdAt: o.createdAt,
            customerPublicId: o.customerPublicId,
            totalQuantity: o.totalQuantity,
            paymentStatus: o.paymentStatus,
        })) ?? [];

    const sortSelectValue =
        `${listQuery.sort}:${listQuery.order}` as (typeof SORT_OPTIONS)[number]['value'];

    if (isLoading && !data) {
        return (
            <div className="rounded-xl bg-white p-6 text-sm text-black/60 shadow-sm">
                Loading…
            </div>
        );
    }

    if (data && data.total === 0 && !listQuery.q) {
        return (
            <div className="rounded-xl bg-white p-8 shadow-sm ring-1 ring-black/5">
                <div className="text-sm font-medium text-brand-black">
                    No orders yet
                </div>
                <div className="mt-1 text-sm text-black/60">
                    Create an order when a customer is ready to check out.
                </div>

                <Link
                    href="/admin/orders/new"
                    className={[
                        'mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0b0b0f] px-4 py-2 text-sm font-medium text-white',
                        'shadow-sm transition hover:shadow-softSm hover:scale-[1.02] hover:bg-black',
                        'focus:outline-none focus:ring-2 focus:ring-brand-pink/40',
                    ].join(' ')}
                >
                    <IconPlus
                        className="h-[18px] w-[18px] text-white"
                        stroke={2}
                    />
                    Create your first order
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <OrderDetailModal
                open={viewOrderId != null}
                orderId={viewOrderId}
                onOpenChange={(next) => {
                    if (!next) setViewOrderId(null);
                }}
            />
            <div
                className={[
                    'flex flex-col gap-4',
                    'sm:flex-row sm:flex-wrap sm:items-end sm:justify-between',
                ].join(' ')}
            >
                <label className="grid min-w-0 gap-1.5 sm:min-w-[220px] sm:flex-1">
                    <span className="text-xs font-medium text-black/55">
                        Search
                    </span>
                    <input
                        type="search"
                        value={searchDraft}
                        onChange={(e) => setSearchDraft(e.target.value)}
                        placeholder="Order ID, customer ID, status…"
                        className={adminControlClass}
                        autoComplete="off"
                    />
                </label>
                <label className="grid w-full gap-1.5 sm:w-52">
                    <span className="text-xs font-medium text-black/55">
                        Sort
                    </span>
                    <FormSelect
                        value={sortSelectValue}
                        onChange={(e) => {
                            const { sort, order } = sortTupleFromSelect(
                                e.target.value,
                            );
                            pushQuery({ sort, order });
                        }}
                        aria-label="Sort orders"
                    >
                        {SORT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </FormSelect>
                </label>
            </div>

            {data && data.total === 0 && listQuery.q ? (
                <div className="rounded-xl bg-white p-8 text-center text-sm text-black/60 shadow-sm ring-1 ring-black/5">
                    No orders match &ldquo;{listQuery.q}&rdquo;. Try a different
                    search.
                </div>
            ) : (
                <div
                    className={[
                        'transition-opacity',
                        isFetching ? 'opacity-70' : 'opacity-100',
                    ].join(' ')}
                >
                    <DataTable data={rows} columns={columns} />
                </div>
            )}

            {data && data.total > ORDER_LIST_FULL_LIMIT ? (
                <p className="text-xs text-black/50">
                    Showing the first {ORDER_LIST_FULL_LIMIT} orders (
                    {data.total} total). Refine search to narrow results.
                </p>
            ) : null}
        </div>
    );
}
