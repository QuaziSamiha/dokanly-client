"use client";

import React, { useState } from "react";
import { AlertTriangle, CalendarClock, CheckCircle2, Coins, ShoppingCart } from "lucide-react";
import { INVENTORY_API } from "@/modules/inventory/constants/inventory.constants";
import { useInventoryQuery } from "@/modules/inventory/hooks/useInventory";
import type {
  IExpiringLot,
  IReconciliationReport,
  IReorderSuggestion,
  IValuationReport,
} from "@/modules/inventory/types/inventory.types";
import {
  stockItemName,
  expiryHint,
  expiryTone,
  formatDate,
  formatDateTime,
  formatQty,
  formatTk,
} from "@/modules/inventory/utils/inventory.utils";
import { Callout, FilterSelect, LinesTable } from "../shared/InventoryUi";

function ReportCard({
  icon,
  title,
  description,
  aside,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-neutralPrimary-200 bg-white p-4 shadow-neutral02 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-greenPrimary-950 text-greenPrimary-600">{icon}</span>
          <div>
            <h3 className="text-base font-semibold text-neutralPrimary-800">{title}</h3>
            <p className="text-xs text-neutralPrimary-400">{description}</p>
          </div>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

const Empty = ({ children }: { children: React.ReactNode }) => (
  <p className="rounded-lg bg-neutralPrimary-50 px-4 py-6 text-center text-sm text-neutralPrimary-400">{children}</p>
);

const td = "px-4 py-2.5";

export default function ReportsTab() {
  const [days, setDays] = useState("90");
  const valuation = useInventoryQuery<IValuationReport>(INVENTORY_API.VALUATION);
  const reorder = useInventoryQuery<IReorderSuggestion[]>(INVENTORY_API.REORDER);
  const expiring = useInventoryQuery<IExpiringLot[]>(INVENTORY_API.EXPIRING, { days });
  const recon = useInventoryQuery<IReconciliationReport>(INVENTORY_API.RECONCILIATION);

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <ReportCard icon={<Coins size={16} />} title="Stock Value" description="Units on hand at moving average cost, per warehouse.">
        {valuation.data ? (
          <LinesTable headers={[{ label: "Warehouse" }, { label: "Products", align: "right" }, { label: "Units", align: "right" }, { label: "Value", align: "right" }]}>
            {valuation.data.warehouses.map((w) => (
              <tr key={w.warehouseId}>
                <td className={td}>
                  <span className="font-mono text-xs font-semibold">{w.warehouseCode}</span>
                  <span className="ml-2 text-xs text-neutralPrimary-400">{w.warehouseName}</span>
                </td>
                <td className={`${td} text-right tabular-nums`}>{w.products}</td>
                <td className={`${td} text-right tabular-nums`}>{formatQty(w.units)}</td>
                <td className={`${td} text-right font-medium tabular-nums`}>{formatTk(w.value)}</td>
              </tr>
            ))}
            <tr className="bg-greenPrimary-950/50 font-semibold">
              <td className={td}>Total</td>
              <td className={td} />
              <td className={`${td} text-right tabular-nums`}>{formatQty(valuation.data.totalUnits)}</td>
              <td className={`${td} text-right tabular-nums text-greenPrimary-700`}>{formatTk(valuation.data.totalValue)}</td>
            </tr>
          </LinesTable>
        ) : (
          <Empty>Loading…</Empty>
        )}
      </ReportCard>

      <ReportCard
        icon={recon.data?.healthy === false ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
        title="Stock Consistency"
        description={`Shop stock vs warehouses, and warehouses vs history.${recon.data ? ` Checked ${formatDateTime(recon.data.checkedAt)}.` : ""}`}
      >
        {!recon.data ? (
          <Empty>Loading…</Empty>
        ) : recon.data.healthy ? (
          <Callout tone="success" icon={<CheckCircle2 size={16} />}>
            Everything matches: the shop&apos;s stock equals what the sellable warehouses can sell, and every warehouse balance equals its history.
          </Callout>
        ) : (
          <div className="flex flex-col gap-3">
            <Callout tone="warning" icon={<AlertTriangle size={16} />}>
              Some numbers differ. Until orders go through the inventory system, every sale shows up here as a shop difference.
            </Callout>
            {recon.data.shopDrift.length > 0 && (
              <LinesTable headers={[{ label: "Product" }, { label: "Shop", align: "right" }, { label: "Warehouses", align: "right" }, { label: "Diff", align: "right" }]}>
                {recon.data.shopDrift.map((r) => (
                  <tr key={`${r.productId}-${r.variantId ?? ""}`}>
                    <td className={`${td} max-w-[16rem] truncate`}>
                      {stockItemName({ name: r.productName, size: r.size })}
                    </td>
                    <td className={`${td} text-right tabular-nums`}>
                      {r.shopQuantity}
                    </td>
                    <td className={`${td} text-right tabular-nums`}>
                      {r.warehouseAvailable}
                    </td>
                    <td
                      className={`${td} text-right font-semibold tabular-nums text-destructive-600`}
                    >
                      {r.difference > 0 ? "+" : ""}
                      {r.difference}
                    </td>
                  </tr>
                ))}
              </LinesTable>
            )}
            {recon.data.ledgerDrift.length > 0 && (
              <p className="text-sm text-destructive-600">
                {recon.data.ledgerDrift.length} warehouse balance(s) differ from their history. This should never happen; please report it.
              </p>
            )}
          </div>
        )}
      </ReportCard>

      <ReportCard icon={<ShoppingCart size={16} />} title="Reorder Suggestions" description="Stock at or below its reorder point, counting what is already on order.">
        {!reorder.data ? (
          <Empty>Loading…</Empty>
        ) : reorder.data.length === 0 ? (
          <Empty>Nothing to reorder. Set reorder points on the Stock tab to get suggestions.</Empty>
        ) : (
          <LinesTable headers={[{ label: "Product" }, { label: "Where" }, { label: "Available", align: "right" }, { label: "On order", align: "right" }, { label: "Reorder at", align: "right" }, { label: "Buy", align: "right" }]}>
            {reorder.data.map((r) => (
              <tr key={`${r.productId}-${r.variantId ?? ""}-${r.warehouseId}`}>
                <td
                  className={`${td} max-w-[14rem] truncate`}
                  title={stockItemName({ name: r.productName, size: r.size })}
                >
                  {stockItemName({ name: r.productName, size: r.size })}
                </td>
                <td className={`${td} font-mono text-xs`}>{r.warehouseCode}</td>
                <td className={`${td} text-right tabular-nums ${r.available <= 0 ? "font-semibold text-destructive-600" : ""}`}>{formatQty(r.available)}</td>
                <td className={`${td} text-right tabular-nums text-blueSecondary-600`}>{formatQty(r.incoming)}</td>
                <td className={`${td} text-right tabular-nums`}>{formatQty(r.reorderPoint)}</td>
                <td className={`${td} text-right font-bold tabular-nums text-greenPrimary-700`}>{formatQty(r.suggestedQty)}</td>
              </tr>
            ))}
          </LinesTable>
        )}
      </ReportCard>

      <ReportCard
        icon={<CalendarClock size={16} />}
        title="Expiring Batches"
        description="Batches with stock that expire soon, already expired included."
        aside={
          <FilterSelect
            label="Window"
            value={days}
            onChange={setDays}
            options={[
              { value: "30", label: "30 days" },
              { value: "90", label: "90 days" },
              { value: "180", label: "6 months" },
              { value: "365", label: "1 year" },
            ]}
          />
        }
      >
        {!expiring.data ? (
          <Empty>Loading…</Empty>
        ) : expiring.data.length === 0 ? (
          <Empty>No batch with stock expires in this window.</Empty>
        ) : (
          <LinesTable headers={[{ label: "Batch" }, { label: "Product" }, { label: "Where" }, { label: "Units", align: "right" }, { label: "Expiry" }]}>
            {expiring.data.map((r) => (
              <tr key={`${r.lot.id}-${r.warehouse.id}`}>
                <td className={`${td} font-mono text-xs font-semibold`}>
                  {r.lot.lotNumber}
                </td>
                <td
                  className={`${td} max-w-[12rem] truncate`}
                  title={stockItemName(r.product)}
                >
                  {stockItemName(r.product)}
                </td>
                <td className={`${td} font-mono text-xs`}>
                  {r.warehouse.code}
                </td>
                <td className={`${td} text-right tabular-nums`}>
                  {formatQty(r.onHand)}
                </td>
                <td className={td}>
                  <div className="flex flex-col whitespace-nowrap">
                    <span>{formatDate(r.lot.expiresAt)}</span>
                    <span className={`text-[11px] font-medium ${expiryTone(r.daysToExpiry)}`}>{expiryHint(r.daysToExpiry)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </LinesTable>
        )}
      </ReportCard>
    </div>
  );
}
