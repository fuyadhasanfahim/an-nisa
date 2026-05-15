"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  useListUsersForAdminQuery,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} from "@/store/api/usersApi";
import type { AdminCustomerDto } from "@/lib/users/map-admin-customer";
import { DataTable } from "@/components/admin/DataTable";
import { adminControlClass } from "@/components/admin/form";
import { CustomerModal } from "@/components/admin/CustomerModal";
import { ConfirmAlertDialog } from "@/components/ui/ConfirmAlertDialog";
import { useToast } from "@/components/shared/toast/useToast";
import {
  IconPencil,
  IconPlus,
  IconTrash,
  IconUserCancel,
  IconUserCheck,
} from "@tabler/icons-react";

type Row = Pick<
  AdminCustomerDto,
  "id" | "customerPublicId" | "name" | "email" | "banned"
>;

type ConfirmAction = {
  kind: "delete" | "ban" | "unban";
  id: string;
  label: string;
};

function CustomerActionsCell({
  row,
  onEdit,
  onConfirmAction,
}: {
  row: Row;
  onEdit: (id: string) => void;
  onConfirmAction: (action: ConfirmAction) => void;
}) {
  const comboBtn =
    "grid h-9 w-9 place-items-center text-black/65 transition hover:bg-black/[0.04] hover:text-brand-black focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink/40 disabled:opacity-50";
  const comboBtnFirst = "rounded-l-xl";
  const comboBtnLast = "rounded-r-xl";

  return (
    <div className="flex justify-end">
      <div
        className={[
          "inline-flex rounded-xl bg-white",
          "shadow-sm ring-1 ring-black/10",
          "divide-x divide-black/10",
        ].join(" ")}
      >
        <button
          type="button"
          className={`${comboBtn} ${comboBtnFirst}`}
          title="Edit"
          aria-label="Edit customer"
          onClick={() => onEdit(row.id)}
        >
          <IconPencil className="h-4 w-4" stroke={2} />
        </button>
        {row.banned ? (
          <button
            type="button"
            className={comboBtn}
            title="Unban"
            aria-label="Unban customer"
            onClick={() =>
              onConfirmAction({
                kind: "unban",
                id: row.id,
                label: row.name,
              })
            }
          >
            <IconUserCheck className="h-4 w-4" stroke={2} />
          </button>
        ) : (
          <button
            type="button"
            className={comboBtn}
            title="Ban"
            aria-label="Ban customer"
            onClick={() =>
              onConfirmAction({
                kind: "ban",
                id: row.id,
                label: row.name,
              })
            }
          >
            <IconUserCancel className="h-4 w-4" stroke={2} />
          </button>
        )}
        <button
          type="button"
          className={`${comboBtn} ${comboBtnLast}`}
          title="Delete"
          aria-label="Delete customer"
          onClick={() =>
            onConfirmAction({
              kind: "delete",
              id: row.id,
              label: row.name,
            })
          }
        >
          <IconTrash className="h-4 w-4" stroke={2} />
        </button>
      </div>
    </div>
  );
}

export function CustomersTable() {
  const { toast } = useToast();
  const [searchDraft, setSearchDraft] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [, startTransition] = useTransition();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalCustomerId, setModalCustomerId] = useState<string | null>(null);

  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [updateCustomer, { isLoading: isUpdatingBan }] =
    useUpdateCustomerMutation();
  const [deleteCustomer, { isLoading: isDeleting }] =
    useDeleteCustomerMutation();

  useEffect(() => {
    const t = window.setTimeout(() => {
      startTransition(() => setDebouncedQ(searchDraft.trim().slice(0, 120)));
    }, 400);
    return () => window.clearTimeout(t);
  }, [searchDraft, startTransition]);

  const { data, isLoading, isFetching } = useListUsersForAdminQuery({
    q: debouncedQ || undefined,
    limit: 50,
  });

  const openCreate = useCallback(() => {
    setModalCustomerId(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((id: string) => {
    setModalCustomerId(id);
    setModalOpen(true);
  }, []);

  const col = useMemo(() => createColumnHelper<Row>(), []);
  const columns = useMemo(
    () => [
      col.accessor("customerPublicId", {
        header: "Customer ID",
        cell: (ctx) => (
          <span className="font-mono text-xs uppercase tracking-wide text-black/85">
            {ctx.getValue() ?? "—"}
          </span>
        ),
      }),
      col.accessor("name", {
        header: "Name",
        cell: (ctx) => (
          <span className="font-medium text-brand-black">{ctx.getValue()}</span>
        ),
      }),
      col.accessor("email", {
        header: "Email",
        cell: (ctx) => (
          <span className="text-black/70">{ctx.getValue()}</span>
        ),
      }),
      col.accessor("banned", {
        header: "Status",
        cell: (ctx) =>
          ctx.getValue() ? (
            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-800 ring-1 ring-rose-200/80">
              Banned
            </span>
          ) : (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200/80">
              Active
            </span>
          ),
      }),
      col.display({
        id: "actions",
        header: () => <div className="text-end">Actions</div>,
        cell: (ctx) => (
          <CustomerActionsCell
            row={ctx.row.original}
            onEdit={openEdit}
            onConfirmAction={setConfirmAction}
          />
        ),
      }),
    ],
    [col, openEdit],
  );

  const rows: Row[] =
    data?.items.map((u) => ({
      id: u.id,
      customerPublicId: u.customerPublicId,
      name: u.name,
      email: u.email,
      banned: u.banned,
    })) ?? [];

  const performConfirm = useCallback(async () => {
    if (!confirmAction) return;
    const { kind, id, label } = confirmAction;
    try {
      if (kind === "delete") {
        await deleteCustomer(id).unwrap();
        toast({
          title: "Customer deleted",
          message: `${label} was removed.`,
          variant: "success",
        });
      } else if (kind === "ban") {
        await updateCustomer({ id, body: { banned: true } }).unwrap();
        toast({
          title: "Customer banned",
          message: "Sessions ended; they cannot sign in.",
          variant: "success",
        });
      } else {
        await updateCustomer({ id, body: { banned: false } }).unwrap();
        toast({
          title: "Ban lifted",
          message: `${label} can sign in again.`,
          variant: "success",
        });
      }
      setConfirmAction(null);
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e && "data" in e
          ? String((e as { data?: { error?: string } }).data?.error ?? "")
          : "";
      toast({
        title: "Something went wrong",
        message: msg || "Try again.",
        variant: "error",
      });
    }
  }, [confirmAction, deleteCustomer, toast, updateCustomer]);

  const confirmLoading = isUpdatingBan || isDeleting;

  if (isLoading && !data) {
    return (
      <div className="rounded-xl bg-white p-6 text-sm text-black/60 shadow-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CustomerModal
        open={modalOpen}
        onOpenChange={(next) => {
          setModalOpen(next);
          if (!next) setModalCustomerId(null);
        }}
        customerId={modalCustomerId}
      />

      <ConfirmAlertDialog
        open={confirmAction !== null}
        onOpenChange={(next) => !next && setConfirmAction(null)}
        variant={confirmAction?.kind === "delete" ? "destructive" : "default"}
        title={
          confirmAction?.kind === "delete"
            ? `Delete ${confirmAction.label}?`
            : confirmAction?.kind === "ban"
              ? `Ban ${confirmAction?.label}?`
              : `Unban ${confirmAction?.label}?`
        }
        description={
          confirmAction?.kind === "delete"
            ? "This removes the account if they have no orders or invoices."
            : confirmAction?.kind === "ban"
              ? "They will be signed out everywhere and cannot sign in until unbanned."
              : "They will be allowed to sign in again."
        }
        confirmLabel={
          confirmAction?.kind === "delete"
            ? "Delete"
            : confirmAction?.kind === "ban"
              ? "Ban customer"
              : "Unban"
        }
        loading={confirmLoading}
        onConfirm={performConfirm}
      />

      <div
        className={[
          "flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end",
          "sm:justify-between",
        ].join(" ")}
      >
        <label className="grid min-w-0 gap-1.5 sm:min-w-[220px] sm:flex-1">
          <span className="text-xs font-medium text-black/55">Search</span>
          <input
            type="search"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Name, email, customer ID…"
            className={adminControlClass}
            autoComplete="off"
          />
        </label>
        <div className="grid w-full gap-1.5 sm:w-auto">
          <span className="text-xs font-medium text-transparent select-none sm:h-[14px]">
            —
          </span>
          <button
            type="button"
            onClick={openCreate}
            className={[
              "inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b0b0f] px-4 py-2.5 text-sm font-medium text-white",
              "shadow-sm transition hover:bg-black hover:shadow-softSm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink/40",
            ].join(" ")}
          >
            <IconPlus className="h-4 w-4" stroke={2} />
            Add customer
          </button>
        </div>
      </div>

      <div
        className={[
          "transition-opacity",
          isFetching ? "opacity-70" : "opacity-100",
        ].join(" ")}
      >
        <DataTable data={rows} columns={columns} />
      </div>
    </div>
  );
}
