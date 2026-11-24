import { ColumnDef } from "@tanstack/react-table";
import { Globe, Lock } from "lucide-react";
import CustomTooltip from "@/components/primitives/CustomTooltip";
import { IPromotion } from "@/modules/promotion/types/promotion.types";
import {
  PROMOTION_STATUS_STYLES,
  formatDate,
  formatDiscount,
  formatTk,
  isPercentage,
  promotionPhase,
  scheduleHint,
  usageBarClass,
  usagePercent,
} from "@/modules/promotion/utils/promotion.utils";

const PHASE_BADGE = {
  UPCOMING: {
    label: "Upcoming",
    className: "bg-blueSecondary-50 text-blueSecondary-600",
  },
  RUNNING: {
    label: "Running",
    className: "bg-greenPrimary-950 text-greenPrimary-600",
  },
  USED_UP: {
    label: "Used up",
    className: "bg-orangeSecondary-100 text-orangeSecondary-500",
  },
} as const;

export const promotionColumns = (
  handleView: (data: IPromotion) => void,
  handleEdit: (data: IPromotion) => void,
  handleDelete: (data: IPromotion) => void,
): ColumnDef<IPromotion>[] => [
  {
    accessorKey: "couponCode",
    header: "Coupon",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex min-w-[9rem] max-w-[14rem] flex-col gap-0.5">
        <span className="w-fit rounded-md border border-dashed border-greenPrimary-300 bg-greenPrimary-950 px-2 py-0.5 font-mono text-sm font-bold tracking-wider text-greenPrimary-700">
          {row.original.couponCode}
        </span>
        {row.original.title && (
          <span
            className="truncate text-xs text-neutralPrimary-400"
            title={row.original.title}
          >
            {row.original.title}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "discountValue",
    header: "Discount",
    enableSorting: false,
    cell: ({ row }) => {
      const p = row.original;
      const hints = [
        isPercentage(p) && p.maxDiscountAmount
          ? `Up to ${formatTk(p.maxDiscountAmount)}`
          : null,
        p.minPurchase ? `Min. order ${formatTk(p.minPurchase)}` : null,
      ].filter(Boolean);
      return (
        <div className="flex flex-col gap-0.5 whitespace-nowrap">
          <span className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-neutralPrimary-800">
              {formatDiscount(p)}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-neutralPrimary-400">
              {isPercentage(p) ? "off" : "flat"}
            </span>
          </span>
          {hints.length > 0 && (
            <span className="text-xs text-neutralPrimary-400">
              {hints.join(" · ")}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "endDate",
    header: "Validity",
    enableSorting: false,
    cell: ({ row }) => {
      const p = row.original;
      const live = p.status === "ACTIVE" || p.status === "INACTIVE";
      return (
        <div className="flex flex-col gap-0.5 whitespace-nowrap">
          <span className="text-sm text-neutralPrimary-700">
            {formatDate(p.startDate)} – {formatDate(p.endDate)}
          </span>
          {live && (
            <span className="text-xs text-neutralPrimary-400">
              {scheduleHint(p)}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "usedCount",
    header: "Usage",
    enableSorting: false,
    cell: ({ row }) => {
      const p = row.original;
      const percent = usagePercent(p);
      return (
        <div className="flex min-w-[7rem] flex-col gap-1">
          <span className="whitespace-nowrap text-sm text-neutralPrimary-700">
            <span className="font-semibold">{p.usedCount}</span>
            <span className="text-neutralPrimary-400">
              {" "}
              / {p.usageLimit ?? "∞"}
            </span>
          </span>
          {percent !== null ? (
            <span className="h-1.5 w-full overflow-hidden rounded-full bg-neutralPrimary-100">
              <span
                className={`block h-full rounded-full ${usageBarClass(percent)}`}
                style={{ width: `${percent}%` }}
              />
            </span>
          ) : (
            <span className="text-xs text-neutralPrimary-400">Unlimited</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => {
      const style = PROMOTION_STATUS_STYLES[row.original.status];
      const phase = promotionPhase(row.original);
      return (
        <div className="flex flex-col items-start gap-1">
          <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style.pill}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
            {style.label}
          </span>
          {phase && phase !== "RUNNING" && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${PHASE_BADGE[phase].className}`}
            >
              {PHASE_BADGE[phase].label}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "isPublic",
    header: "Visibility",
    enableSorting: false,
    cell: ({ row }) =>
      row.original.isPublic ? (
        <span
          title="Listed on the storefront"
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-blueSecondary-50 px-2.5 py-1 text-xs font-medium text-blueSecondary-600"
        >
          <Globe size={12} />
          Public
        </span>
      ) : (
        <span
          title="Not listed; works only when typed at checkout"
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-neutralPrimary-100 px-2.5 py-1 text-xs font-medium text-neutralPrimary-600"
        >
          <Lock size={12} />
          Private
        </span>
      ),
  },
  {
    accessorKey: "actions",
    header: "Action",
    enableSorting: false,
    cell: ({ row }) => {
      const isArchived = row.original.status === "ARCHIVED";
      return (
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => handleView(row.original)}>
            <CustomTooltip action="view" content="View" />
          </button>
          {/* An archived promotion opens the form read-only */}
          <button type="button" onClick={() => handleEdit(row.original)}>
            <CustomTooltip
              action="edit"
              content={isArchived ? "Archived (read-only)" : "Edit"}
            />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row.original)}
            disabled={isArchived}
            className="disabled:pointer-events-none disabled:opacity-40"
          >
            <CustomTooltip
              action="delete"
              content={isArchived ? "Already archived" : "Archive"}
            />
          </button>
        </div>
      );
    },
  },
];
