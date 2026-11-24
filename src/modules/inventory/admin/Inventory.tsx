"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRightLeft,
  BarChart3,
  Boxes,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Coins,
  History,
  Layers,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { INVENTORY_API } from "@/modules/inventory/constants/inventory.constants";
import { useInventoryQuery } from "@/modules/inventory/hooks/useInventory";
import type {
  IExpiringLot,
  IReconciliationReport,
  IReorderSuggestion,
  IValuationReport,
} from "@/modules/inventory/types/inventory.types";
import { formatQty, formatTk } from "@/modules/inventory/utils/inventory.utils";
import StockTab from "./stock/StockTab";
import MovementsTab from "./movements/MovementsTab";
import PurchaseOrdersTab from "./purchase-orders/PurchaseOrdersTab";
import TransfersTab from "./transfers/TransfersTab";
import AdjustmentsTab from "./adjustments/AdjustmentsTab";
import LotsTab from "./lots/LotsTab";
import WarehousesTab from "./warehouses/WarehousesTab";
import SuppliersTab from "./suppliers/SuppliersTab";
import ReportsTab from "./reports/ReportsTab";

const TABS = [
  { value: "stock", label: "Stock", icon: Boxes },
  { value: "movements", label: "History", icon: History },
  { value: "purchase-orders", label: "Purchase Orders", icon: ShoppingCart },
  { value: "transfers", label: "Transfers", icon: ArrowRightLeft },
  { value: "adjustments", label: "Adjustments", icon: ClipboardCheck },
  { value: "lots", label: "Batches", icon: Layers },
  { value: "warehouses", label: "Warehouses", icon: Building2 },
  { value: "suppliers", label: "Suppliers", icon: Truck },
  { value: "reports", label: "Reports", icon: BarChart3 },
] as const;
type TabValue = (typeof TABS)[number]["value"];

function Kpi({
  icon,
  label,
  value,
  hint,
  tone = "neutral",
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "neutral" | "warning" | "danger" | "success";
  onClick?: () => void;
}) {
  const tones = {
    neutral: "bg-white text-neutralPrimary-800",
    warning: "bg-warningPrimary-50 text-warningPrimary-800",
    danger: "bg-destructive-50 text-destructive-700",
    success: "bg-success-50 text-success-700",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "group flex min-w-0 flex-col items-start gap-1 rounded-xl border border-neutralPrimary-200 p-4 text-left shadow-neutral02 transition-all duration-200 enabled:cursor-pointer enabled:hover:-translate-y-0.5 enabled:hover:shadow-md",
        tones[tone],
      )}
    >
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide opacity-70">
        {icon}
        {label}
      </span>
      <span className="truncate text-2xl font-bold">{value}</span>
      {hint && <span className="text-xs opacity-70">{hint}</span>}
    </button>
  );
}

/** Admin inventory: KPIs on top, one tab per area. The tab is kept in ?tab= so links and reloads land on it. */
export default function Inventory() {
  const [tab, setTab] = useState<TabValue>("stock");
  // Stock → "Stock history" opens the ledger filtered on that row.
  const [historyFilter, setHistoryFilter] = useState({ productId: "", warehouseId: "", key: 0 });

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("tab");
    if (fromUrl && TABS.some((t) => t.value === fromUrl)) setTab(fromUrl as TabValue);
  }, []);

  const go = (next: TabValue) => {
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    window.history.replaceState(null, "", url.toString());
  };

  const valuation = useInventoryQuery<IValuationReport>(INVENTORY_API.VALUATION);
  const reorder = useInventoryQuery<IReorderSuggestion[]>(INVENTORY_API.REORDER);
  const expiring = useInventoryQuery<IExpiringLot[]>(INVENTORY_API.EXPIRING, { days: 90 });
  const recon = useInventoryQuery<IReconciliationReport>(INVENTORY_API.RECONCILIATION);

  const expired = (expiring.data ?? []).filter((l) => l.daysToExpiry < 0).length;
  const driftCount = (recon.data?.shopDrift.length ?? 0) + (recon.data?.ledgerDrift.length ?? 0);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-xl font-semibold text-neutralPrimary-700 sm:text-2xl">Inventory</p>
        <p className="text-sm text-neutralPrimary-500">
          Stock across warehouses, what is on order and in transit, batches and their expiry, and every stock change.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          icon={<Coins size={14} />}
          label="Stock value"
          value={valuation.data ? formatTk(valuation.data.totalValue) : "…"}
          hint={valuation.data ? `${formatQty(valuation.data.totalUnits)} units on hand` : undefined}
          onClick={() => go("reports")}
        />
        <Kpi
          icon={<ShoppingCart size={14} />}
          label="To reorder"
          value={reorder.data ? reorder.data.length : "…"}
          hint="At or below reorder point"
          tone={reorder.data?.length ? "warning" : "neutral"}
          onClick={() => go("reports")}
        />
        <Kpi
          icon={<CalendarClock size={14} />}
          label="Expiring ≤ 90 days"
          value={expiring.data ? expiring.data.length : "…"}
          hint={expired ? `${expired} already expired` : "Batches with stock"}
          tone={expired ? "danger" : expiring.data?.length ? "warning" : "neutral"}
          onClick={() => go("lots")}
        />
        <Kpi
          icon={recon.data?.healthy === false ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
          label="Consistency"
          value={!recon.data ? "…" : recon.data.healthy ? "In sync" : `${driftCount} differ`}
          hint="Shop stock vs warehouses"
          tone={!recon.data ? "neutral" : recon.data.healthy ? "success" : "warning"}
          onClick={() => go("reports")}
        />
      </div>

      <nav className="scrollbar-thin -mx-1 flex gap-1 overflow-x-auto rounded-xl border border-neutralPrimary-200 bg-white p-1.5 shadow-neutral02">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => go(value)}
            aria-current={tab === value ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-150",
              tab === value
                ? "bg-greenPrimary-500 text-white shadow-sm"
                : "text-neutralPrimary-600 hover:bg-neutralPrimary-100 hover:text-neutralPrimary-900",
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      {tab === "stock" && (
        <StockTab
          onShowHistory={(itemKey, warehouseId) => {
            setHistoryFilter((f) => ({
              productId: itemKey,
              warehouseId: String(warehouseId),
              key: f.key + 1,
            }));
            go("movements");
          }}
        />
      )}
      {tab === "movements" && (
        <MovementsTab
          key={historyFilter.key}
          initialProductId={historyFilter.productId}
          initialWarehouseId={historyFilter.warehouseId}
        />
      )}
      {tab === "purchase-orders" && <PurchaseOrdersTab />}
      {tab === "transfers" && <TransfersTab />}
      {tab === "adjustments" && <AdjustmentsTab />}
      {tab === "lots" && <LotsTab />}
      {tab === "warehouses" && <WarehousesTab />}
      {tab === "suppliers" && <SuppliersTab />}
      {tab === "reports" && <ReportsTab />}
    </section>
  );
}
