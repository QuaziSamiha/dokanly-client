"use client";

import ConfirmModal from "@/components/primitives/modal/ConfirmModal";
import { cn } from "@/lib/utils";
import { axiosInstance } from "@/lib/axios/axiosInstance";
import {
  CUSTOMER_ORDER_DETAILS_KEY,
  CUSTOMER_ORDER_SUMMARY_KEY,
  CUSTOMER_ORDERS_KEY,
} from "@/modules/order/hooks/useUserOrders";
import { IGenericErrorResponse } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { toast } from "sonner";

const QUICK_REASONS = [
  "Ordered by mistake",
  "Want to change items",
  "Want to change the address",
  "Found a better price",
  "Delivery takes too long",
];

const REASON_MAX = 500;

/** Asks why, then cancels the order. Stock is returned by the server. */
export default function CancelOrderDialog({
  orderId,
  orderNumber,
  open,
  onOpenChange,
}: {
  orderId: number;
  orderNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");

  const { mutate: cancelOrder, isPending } = useMutation<
    unknown,
    IGenericErrorResponse
  >({
    mutationFn: () =>
      axiosInstance.patch(`/order/user-order/${orderId}/cancel`, {
        reason: reason.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success(`Order ${orderNumber} has been cancelled`, { className: "toast-delete" });
      queryClient.invalidateQueries({ queryKey: [CUSTOMER_ORDER_DETAILS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CUSTOMER_ORDERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [CUSTOMER_ORDER_SUMMARY_KEY] });
      setReason("");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error?.message || "Could not cancel the order");
      //* ==== THE ORDER MAY HAVE MOVED ON (E.G. JUST CONFIRMED); SHOW ITS REAL STATE ====
      queryClient.invalidateQueries({ queryKey: [CUSTOMER_ORDER_DETAILS_KEY] });
    },
  });

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={() => cancelOrder()}
      isPending={isPending}
      variant="danger"
      title={`Cancel order ${orderNumber}?`}
      description="This can't be undone. If you still want these products, you can order them again any time."
      confirmLabel="Yes, cancel order"
      cancelLabel="Keep order"
    >
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-neutralPrimary-700">
          Why are you cancelling?{" "}
          <span className="font-normal text-neutralPrimary-400">(optional)</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              disabled={isPending}
              onClick={() => setReason(reason === r ? "" : r)}
              aria-pressed={reason === r}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
                reason === r
                  ? "border-greenPrimary-500 bg-greenPrimary-950 text-greenPrimary-700"
                  : "border-neutralPrimary-300 text-neutralPrimary-600 hover:border-neutralPrimary-400",
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value.slice(0, REASON_MAX))}
          disabled={isPending}
          rows={3}
          placeholder="Tell us more (helps us improve)"
          className="w-full resize-none rounded-lg border border-neutralPrimary-300 p-3 text-sm text-neutralPrimary-800 placeholder:text-neutralPrimary-400 focus:border-greenPrimary-400 focus:outline-none focus:ring-4 focus:ring-greenPrimary-500/15"
        />
        <p className="self-end text-[11px] text-neutralPrimary-400">
          {reason.length}/{REASON_MAX}
        </p>
      </div>
    </ConfirmModal>
  );
}
