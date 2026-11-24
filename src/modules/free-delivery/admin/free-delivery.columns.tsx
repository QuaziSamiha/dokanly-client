import { ColumnDef } from "@tanstack/react-table";
import CustomTooltip from "@/components/primitives/CustomTooltip";
import {
  FreeDeliveryStatus,
  IFreeDelivery,
} from "@/modules/free-delivery/types/free-delivery.types";

// * ============ SHARED DISPLAY HELPERS (also used by EditFreeDelivery) ============

export const formatAmount = (amount?: number | string | null) =>
  `${Number(amount ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })} BDT`;

export const formatDateTime = (value?: string) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

export const STATUS_STYLES: Record<
  FreeDeliveryStatus,
  { pill: string; dot: string }
> = {
  ACTIVE: {
    pill: "text-emerald-700 bg-emerald-50 ring-emerald-600/20",
    dot: "bg-emerald-500",
  },
  INACTIVE: {
    pill: "text-rose-700 bg-rose-50 ring-rose-600/20",
    dot: "bg-rose-500",
  },
};

export function StatusPill({ status }: { status?: FreeDeliveryStatus }) {
  if (!status) return null;
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.INACTIVE;
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${style.pill}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {status === "ACTIVE" && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 motion-reduce:animate-none ${style.dot}`}
          />
        )}
        <span className={`relative h-1.5 w-1.5 rounded-full ${style.dot}`} />
      </span>
      {status.toLowerCase()}
    </span>
  );
}

// * ============ COLUMNS ==============

export const FreeDeliveryColumns = (
  handleEdit: (data: IFreeDelivery) => void,
  handleDelete: (data: IFreeDelivery) => void,
): ColumnDef<IFreeDelivery>[] => [
  {
    accessorKey: "minOrderAmount",
    header: "Minimum Order",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold text-neutralPrimary-800">
          {formatAmount(row.original.minOrderAmount)}
        </span>
        <span className="text-xs text-neutralPrimary-400">
          Free delivery at or above
        </span>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.description ? (
        <p
          title={row.original.description}
          className="max-w-[260px] truncate text-sm text-neutralPrimary-600"
        >
          {row.original.description}
        </p>
      ) : (
        <span className="text-sm italic text-neutralPrimary-400">
          No description
        </span>
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <StatusPill status={row.original.status} />
        {row.original.status === "ACTIVE" && (
          <span className="text-[11px] text-neutralPrimary-400">
            Shown at checkout
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "createdByName",
    header: "Created",
    enableSorting: false,
    cell: ({ row }) => {
      const { createdByName, createdByRole, createdAt } = row.original;
      return (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blueSecondary-100 text-xs font-semibold text-blueSecondary-600">
            {createdByName ? createdByName.charAt(0).toUpperCase() : "?"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm text-neutralPrimary-700">
              {createdByName ?? "Deleted user"}
              {createdByRole && (
                <span className="ml-1.5 rounded bg-neutralPrimary-100 px-1 text-[10px] font-semibold uppercase text-neutralPrimary-500">
                  {createdByRole}
                </span>
              )}
            </p>
            <p className="text-xs text-neutralPrimary-400">
              {formatDateTime(createdAt)}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "changeHistory",
    header: "Last Change",
    enableSorting: false,
    cell: ({ row }) => {
      const history = row.original.changeHistory ?? [];
      const last = history[history.length - 1];
      if (!last) {
        return (
          <span className="text-sm italic text-neutralPrimary-400">
            Never changed
          </span>
        );
      }
      return (
        <div className="flex flex-col">
          <span className="text-sm text-neutralPrimary-700">
            {formatDateTime(last.updatedAt)}
          </span>
          <span className="text-xs text-neutralPrimary-400">
            by {last.updatedByName} · {history.length} change
            {history.length === 1 ? "" : "s"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Action",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button onClick={() => handleEdit(row.original)}>
          <CustomTooltip action="edit" content="Edit" />
        </button>
        <button onClick={() => handleDelete(row.original)}>
          <CustomTooltip action="delete" content="Delete" />
        </button>
      </div>
    ),
  },
];
