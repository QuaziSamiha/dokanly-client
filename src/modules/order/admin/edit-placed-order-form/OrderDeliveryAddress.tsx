import React from "react";
import { Lock } from "lucide-react";
import { IOrder } from "@/modules/order/types/order.types";

interface IProps {
  order: IOrder;
}

/** The address the order was placed with. Read-only: the server doesn't allow editing it. */
export default function OrderDeliveryAddress({ order }: IProps) {
  const rows = [
    { label: "Street & House No.", value: order.street },
    { label: "Division", value: order.state },
    { label: "District", value: order.city },
    { label: "Postal Code", value: order.zipCode },
    { label: "Country", value: order.country },
  ];

  return (
    <div className="flex flex-col gap-3">
      <dl className="grid grid-cols-1 gap-x-5 gap-y-3 text-sm md:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className={row.label === "Street & House No." ? "md:col-span-2" : ""}>
            <dt className="text-xs text-neutralPrimary-500">{row.label}</dt>
            <dd className="font-medium text-neutralPrimary-800">{row.value || "—"}</dd>
          </div>
        ))}
      </dl>
      <p className="flex items-start gap-2 text-xs text-neutralPrimary-500">
        <Lock size={14} className="mt-px shrink-0" />
        The delivery address can&apos;t be changed after the order is placed.
      </p>
    </div>
  );
}
