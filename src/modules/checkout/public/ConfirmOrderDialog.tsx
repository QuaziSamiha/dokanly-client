"use client";

import React from "react";
import { Banknote, Loader2, MapPin, Package, Phone, UserRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatTk } from "@/modules/cart/utils/cart-pricing.utils";

export interface IOrderReview {
  name: string;
  phone: string;
  address: string;
  zoneLabel?: string;
  units: number;
  grandTotal: number;
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 text-neutralPrimary-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutralPrimary-400">{label}</p>
        <p className="text-sm text-neutralPrimary-800 [overflow-wrap:anywhere]">{children}</p>
      </div>
    </div>
  );
}

/** Last look before the order is placed; its button submits #checkout-form. */
export default function ConfirmOrderDialog({
  open,
  onOpenChange,
  review,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: IOrderReview;
  isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl p-5 sm:p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-bold text-neutralPrimary-800">
            Confirm your order
          </DialogTitle>
          <DialogDescription>Please check your details before placing the order.</DialogDescription>
        </DialogHeader>

        <div className="divide-y divide-neutralPrimary-100 rounded-xl border border-neutralPrimary-200 px-4">
          <Row icon={<UserRound size={16} />} label="Name">{review.name}</Row>
          <Row icon={<Phone size={16} />} label="Phone">{review.phone}</Row>
          <Row icon={<MapPin size={16} />} label="Deliver to">
            {review.address}
            {review.zoneLabel && <span className="text-neutralPrimary-500"> · {review.zoneLabel}</span>}
          </Row>
          <Row icon={<Package size={16} />} label="Items">
            {review.units} item{review.units === 1 ? "" : "s"}
          </Row>
          <Row icon={<Banknote size={16} />} label="Pay on delivery">
            <span className="text-base font-bold text-greenPrimary-700">{formatTk(review.grandTotal)}</span>
          </Row>
        </div>

        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="h-11 cursor-pointer rounded-lg border border-neutralPrimary-300 px-5 text-sm font-semibold text-neutralPrimary-600 transition-colors hover:bg-neutralPrimary-50 disabled:opacity-50"
          >
            Go back
          </button>
          <button
            type="submit"
            form="checkout-form"
            disabled={isPending}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-greenPrimary-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-greenPrimary-600 disabled:cursor-wait disabled:opacity-70"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            {isPending ? "Placing order…" : "Place order"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
