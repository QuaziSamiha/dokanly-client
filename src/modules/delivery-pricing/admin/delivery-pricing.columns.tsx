import { ColumnDef } from "@tanstack/react-table";
import { Building2, Clock, MapPinned } from "lucide-react";
import CustomTooltip from "@/components/primitives/CustomTooltip";
import { formatEnumString } from "@/lib/utils/string.utils";
import { IDeliveryPricing } from "@/modules/delivery-pricing/types/delivery-pricing.types";

// * ============ SHARED DISPLAY HELPERS (also used by EditDeliveryPricing) ============

export const formatCharge = (amount?: number | string | null) =>
  amount === null || amount === undefined || amount === ""
    ? "—"
    : `${Number(amount).toLocaleString("en-US", { maximumFractionDigits: 2 })} BDT`;

export const formatDays = (days?: number | null) =>
  days ? `${days} day${days === 1 ? "" : "s"}` : "—";

export const formatDateTime = (value?: string) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

export const DELIVERY_METHOD_META: Record<
  string,
  { label: string; hint: string; Icon: typeof Building2; tile: string }
> = {
  INSIDE_DHAKA: {
    label: "Inside Dhaka",
    hint: "Orders delivered within Dhaka city",
    Icon: Building2,
    tile: "bg-greenPrimary-950 text-greenPrimary-600",
  },
  OUTSIDE_DHAKA: {
    label: "Outside Dhaka",
    hint: "Orders delivered anywhere else in Bangladesh",
    Icon: MapPinned,
    tile: "bg-blueSecondary-50 text-blueSecondary-600",
  },
};

export const getMethodMeta = (method?: string) =>
  DELIVERY_METHOD_META[method ?? ""] ?? {
    label: method ? formatEnumString(method) : "Unknown",
    hint: "Delivery method",
    Icon: MapPinned,
    tile: "bg-neutralPrimary-100 text-neutralPrimary-500",
  };

export function ActivePill({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
        isActive
          ? "text-emerald-700 bg-emerald-50 ring-emerald-600/20"
          : "text-rose-700 bg-rose-50 ring-rose-600/20"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-emerald-500" : "bg-rose-500"
        }`}
      />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

// * ============ COLUMNS ==============

export const deliveryPricingColumns = (
  // Kept for the shared table signature; this module has no view modal.
  _handleView: (data: IDeliveryPricing) => void,
  handleEdit: (data: IDeliveryPricing) => void
): ColumnDef<IDeliveryPricing>[] => [
  {
    accessorKey: "deliveryMethod",
    header: "Delivery Method",
    enableSorting: false,
    cell: ({ row }) => {
      const { label, hint, Icon, tile } = getMethodMeta(
        row.original.deliveryMethod
      );
      return (
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tile}`}
          >
            <Icon size={18} />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-neutralPrimary-800">{label}</p>
            <p className="text-xs text-neutralPrimary-400">{hint}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "baseCharge",
    header: "Delivery Charge",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="font-semibold text-neutralPrimary-800 tabular-nums">
        {formatCharge(row.original.baseCharge)}
      </span>
    ),
  },
  {
    accessorKey: "estimatedDays",
    header: "Estimated Delivery",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1.5 text-sm text-neutralPrimary-700">
        <Clock size={14} className="text-neutralPrimary-400" />
        {formatDays(row.original.estimatedDays)}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <ActivePill isActive={row.original.isActive} />
        {row.original.isActive && (
          <span className="text-[11px] text-neutralPrimary-400">
            Charged at checkout
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="text-sm text-neutralPrimary-500">
        {formatDateTime(row.original.updatedAt)}
      </span>
    ),
  },
  {
    accessorKey: "actions",
    header: "Action",
    enableSorting: false,
    cell: ({ row }) => (
      <button
        type="button"
        aria-label={`Edit ${getMethodMeta(row.original.deliveryMethod).label} pricing`}
        onClick={() => handleEdit(row.original)}
      >
        <CustomTooltip action="edit" content="Edit pricing" />
      </button>
    ),
  },
];
