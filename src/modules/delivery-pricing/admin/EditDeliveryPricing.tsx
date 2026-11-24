"use client";

import InputField from "@/components/form/InputField";
import SubmitButton from "@/components/form/SubmitButton";
import { usePatch } from "@/hooks/api/usePatch";
import {
  DELIVERY_CHARGE_MAX,
  DELIVERY_CHARGE_MIN,
  DeliveryChargeFormType,
  deliveryPricingSchema,
} from "@/modules/delivery-pricing/schemas/delivery-pricing.schema";
import { IModal } from "@/types";
import { IDeliveryPricing } from "@/modules/delivery-pricing/types/delivery-pricing.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Banknote, CalendarDays, Eye, Info, Truck } from "lucide-react";
import React from "react";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  ActivePill,
  formatCharge,
  formatDateTime,
  formatDays,
  getMethodMeta,
} from "./delivery-pricing.columns";

// "before → after" line for a field the admin has changed.
function ChangeRow({
  label,
  from,
  to,
}: {
  label: string;
  from: string;
  to: string;
}) {
  return (
    <li className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <span className="w-28 text-neutralPrimary-500">{label}</span>
      <span className="text-neutralPrimary-400 line-through">{from}</span>
      <ArrowRight size={14} className="text-neutralPrimary-400" />
      <span className="font-semibold text-greenPrimary-600">{to}</span>
    </li>
  );
}

export default function EditDeliveryPricing({
  data,
  isLoading,
  setOpen,
  refetch,
}: IModal) {
  const rowData = data as IDeliveryPricing | undefined;
  const {
    control,
    trigger,
    handleSubmit,
    formState: { isDirty, dirtyFields },
  } = useForm<DeliveryChargeFormType>({
    resolver: zodResolver(deliveryPricingSchema),
    defaultValues: {
      deliveryMethod: rowData?.deliveryMethod,
      deliveryCharge: rowData?.baseCharge,
      estimatedDays: rowData?.estimatedDays,
    },
  });

  const [charge, days] = useWatch({
    control,
    name: ["deliveryCharge", "estimatedDays"],
  });

  const { mutate: updateDeliveryPricing, isPending } =
    usePatch<IDeliveryPricing>(
      (data) => {
        if (data.statusCode >= 200 && data.statusCode < 300) {
          setOpen?.(false);
          refetch?.();
        }
      },
      (error) => {
        console.error("Update failed:", error);
      }
    );

  if (!rowData) {
    return (
      <div className="flex flex-col items-center gap-2 p-10 text-center text-neutralPrimary-400">
        <Truck size={32} />
        No delivery pricing details available.
      </div>
    );
  }

  const method = getMethodMeta(rowData.deliveryMethod);

  // Typing a value and then restoring it still leaves the field dirty, so
  // compare with the saved values too.
  const chargeChanged = charge != null && charge !== rowData.baseCharge;
  const daysChanged = days != null && days !== rowData.estimatedDays;
  const hasChanges = chargeChanged || daysChanged;

  const onSubmit: SubmitHandler<DeliveryChargeFormType> = (data) => {
    const payload: Record<string, unknown> = {};
    if (dirtyFields.deliveryCharge && data.deliveryCharge !== rowData.baseCharge) {
      payload.baseCharge = data.deliveryCharge;
    }
    if (dirtyFields.estimatedDays && data.estimatedDays !== rowData.estimatedDays) {
      payload.estimatedDays = data.estimatedDays;
    }

    if (!isDirty || Object.keys(payload).length === 0) {
      toast.info("No changes detected!");
      setOpen?.(false);
      return;
    }

    updateDeliveryPricing({
      endpoint: `/delivery-pricing/${rowData.id}`,
      data: payload,
    });
  };

  return (
    <section className="p-4 sm:p-6 flex flex-col gap-5">
      {/* Header: the method is fixed, so it is shown here rather than as a disabled field */}
      <div className="flex items-start gap-3 sm:gap-4">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${method.tile}`}
        >
          <method.Icon size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutralPrimary-400">
            Edit Delivery Pricing
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-neutralPrimary-800">
              {method.label}
            </h2>
            <ActivePill isActive={rowData.isActive} />
          </div>
          <p className="text-sm text-neutralPrimary-500">{method.hint}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
          <div className="flex flex-col gap-1.5">
            <InputField
              labelName="Delivery Charge (BDT)"
              name="deliveryCharge"
              inputType="number"
              placeholderText="e.g. 60"
              IconComponent={Banknote}
              control={control}
              trigger={trigger}
              isLoading={isLoading}
              autoFocus
              inlineError
              isRequired
            />
            <p className="pl-0.5 text-xs text-neutralPrimary-400">
              Between {DELIVERY_CHARGE_MIN} and {DELIVERY_CHARGE_MAX} BDT. Now{" "}
              {formatCharge(rowData.baseCharge)}.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <InputField
              labelName="Estimated Delivery (days)"
              name="estimatedDays"
              inputType="number"
              placeholderText="e.g. 3"
              IconComponent={CalendarDays}
              control={control}
              trigger={trigger}
              isLoading={isLoading}
              inlineError
              isRequired
            />
            <p className="pl-0.5 text-xs text-neutralPrimary-400">
              Whole days, at least 1. Now {formatDays(rowData.estimatedDays)}.
            </p>
          </div>
        </div>

        {/* What the customer will see at checkout */}
        <div className="rounded-xl border border-neutralPrimary-100 bg-neutralPrimary-50/60 p-3 sm:p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutralPrimary-400">
            <Eye size={14} />
            Checkout preview
          </p>
          <div className="flex items-center justify-between gap-3 rounded-lg bg-white p-3 ring-1 ring-neutralPrimary-100">
            <div className="flex min-w-0 items-center gap-3">
              <method.Icon size={18} className="shrink-0 text-greenPrimary-500" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutralPrimary-800">
                  {method.label}
                </p>
                <p className="text-xs text-neutralPrimary-500">
                  Delivered in {formatDays(days)}
                </p>
              </div>
            </div>
            <span className="shrink-0 text-sm font-bold text-neutralPrimary-800 tabular-nums">
              {formatCharge(charge)}
            </span>
          </div>

          {hasChanges ? (
            <ul className="mt-3 flex flex-col gap-1.5">
              {chargeChanged && (
                <ChangeRow
                  label="Charge"
                  from={formatCharge(rowData.baseCharge)}
                  to={formatCharge(charge)}
                />
              )}
              {daysChanged && (
                <ChangeRow
                  label="Delivery time"
                  from={formatDays(rowData.estimatedDays)}
                  to={formatDays(days)}
                />
              )}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-neutralPrimary-400">
              No changes yet.
            </p>
          )}
        </div>

        <p className="flex items-start gap-2 text-xs text-neutralPrimary-400">
          <Info size={14} className="mt-0.5 shrink-0" />
          New orders use the new values right away. Orders already placed keep
          the charge they were placed with. Last updated{" "}
          {formatDateTime(rowData.updatedAt)}.
        </p>

        {/* Stacked full-width on phones (primary action on top), inline on sm+ */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-end sm:justify-end">
          <button
            type="button"
            onClick={() => setOpen?.(false)}
            className="h-11 w-full sm:w-auto border border-neutral-300 font-semibold text-sm md:text-base text-neutral-600 rounded-lg cursor-pointer px-5 hover:bg-neutral-100 transition-colors duration-200"
          >
            Cancel
          </button>
          <SubmitButton
            submitTitle={isPending ? "Saving..." : "Save Changes"}
            isPending={isPending || !hasChanges}
            buttonWidth="w-full sm:w-fit"
          />
        </div>
      </form>
    </section>
  );
}
