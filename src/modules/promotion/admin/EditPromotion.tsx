"use client";

import React, { useMemo } from "react";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  AlertTriangle,
  Archive,
  CalendarClock,
  Hourglass,
  LockKeyhole,
} from "lucide-react";
import InputField from "@/components/form/InputField";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import DateInputField from "@/components/form/DateInputField";
import ToggleButton from "@/components/form/ToggleButton";
import { usePatch } from "@/hooks/api/usePatch";
import { IModal } from "@/types";
import { IPromotion } from "@/modules/promotion/types/promotion.types";
import { promotionStatus } from "@/modules/promotion/constants/promotion.constants";
import {
  EditPromotionFormType,
  editPromotionSchema,
} from "@/modules/promotion/schemas/promotion.schema";
import {
  PROMOTION_STATUS_STYLES,
  durationDays,
  formatDate,
  formatDiscount,
  formatTk,
  isPercentage,
  startOfDay,
  toPickerDate,
} from "@/modules/promotion/utils/promotion.utils";
import { FormActions, FormSection } from "./PromotionFormParts";

const SETTABLE_STATUSES = ["ACTIVE", "INACTIVE"];

function LockedTerm({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutralPrimary-400">
        {label}
      </p>
      <p className="truncate text-sm font-semibold text-neutralPrimary-700">
        {value}
      </p>
    </div>
  );
}

export default function EditPromotion({
  data,
  isLoading,
  setOpen,
  onClose,
  refetch,
}: IModal) {
  const promotion = data as IPromotion;
  const close = () => (onClose ? onClose() : setOpen?.(false));

  const isArchived = promotion?.status === "ARCHIVED";
  const isExpired = promotion?.status === "EXPIRED";
  const isInactive = promotion?.status === "INACTIVE";
  // The start date can still move until the promotion begins.
  const canEditStart =
    !!promotion &&
    !isArchived &&
    !isExpired &&
    startOfDay(promotion.startDate) > startOfDay(new Date());

  // Only Active/Inactive can be picked; keep the current status visible.
  const statusOptions = useMemo(
    () =>
      isArchived || isExpired
        ? [
            ...promotionStatus,
            {
              id: promotion.status,
              name: isExpired
                ? "Expired (pick a new end date)"
                : PROMOTION_STATUS_STYLES[promotion.status].label,
            },
          ]
        : promotionStatus,
    [isArchived, isExpired, promotion?.status],
  );

  const schema = useMemo(
    () =>
      editPromotionSchema({
        status: promotion?.status,
        startDate: promotion?.startDate,
        canEditStart,
        usageLimit: promotion?.usageLimit,
        usedCount: promotion?.usedCount ?? 0,
      }),
    [promotion, canEditStart],
  );

  const {
    control,
    trigger,
    handleSubmit,
    formState: { dirtyFields },
  } = useForm<EditPromotionFormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: promotion?.status,
      startDate: toPickerDate(promotion?.startDate),
      endDate: toPickerDate(promotion?.endDate),
      usageLimit: promotion?.usageLimit ?? null,
      isPublic: promotion?.isPublic ?? false,
    },
  });

  const [status, startDate, endDate] = useWatch({
    control,
    name: ["status", "startDate", "endDate"],
  });
  const effectiveStart = canEditStart ? startDate : promotion?.startDate;
  const days = durationDays(effectiveStart, endDate);

  const { mutate: updatePromotion, isPending } = usePatch<IPromotion>(
    (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        close();
        refetch?.();
      }
    },
    (error) => {
      console.error("Update failed:", error);
    },
  );

  const onSubmit: SubmitHandler<EditPromotionFormType> = (values) => {
    const payload: Record<string, unknown> = {};

    if (dirtyFields.status && SETTABLE_STATUSES.includes(values.status)) {
      payload.status = values.status;
    }
    if (canEditStart && dirtyFields.startDate) {
      payload.startDate = values.startDate;
    }
    if (dirtyFields.endDate) payload.endDate = values.endDate;
    if (dirtyFields.usageLimit && values.usageLimit != null) {
      payload.usageLimit = values.usageLimit;
    }
    if (dirtyFields.isPublic) payload.isPublic = values.isPublic;

    if (Object.keys(payload).length === 0) {
      toast.info("No changes detected!");
      close();
      return;
    }

    // The server only edits a paused promotion when the status is sent too.
    if (isInactive && !payload.status) payload.status = values.status;

    updatePromotion({
      endpoint: `/promotions/update-promotion/${promotion.id}`,
      data: payload,
    });
  };

  if (!promotion) return null;

  const statusStyle = PROMOTION_STATUS_STYLES[promotion.status];

  const statusField = (
    <SingleSelectSearch
      labelName="Status"
      name="status"
      control={control}
      options={statusOptions}
      isLoading={isLoading}
      isDisabled={isArchived}
    />
  );

  return (
    <section className="flex flex-col gap-4 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xl font-semibold text-neutralPrimary-800 sm:text-2xl">
            {isArchived ? "Promotion (Archived)" : "Edit Promotion"}
          </p>
          {promotion.title && (
            <p className="truncate text-sm text-neutralPrimary-500">
              {promotion.title}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg border-2 border-dashed border-greenPrimary-400 bg-greenPrimary-950 px-2.5 py-0.5 font-mono text-sm font-bold tracking-[0.15em] text-greenPrimary-700">
            {promotion.couponCode}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyle.pill}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
            {statusStyle.label}
          </span>
        </div>
      </div>

      {/* State notices */}
      {isArchived && (
        <div className="flex items-start gap-3 rounded-xl border border-warningPrimary-200 bg-warningPrimary-100 p-3 text-sm text-warningPrimary-600">
          <Archive size={18} className="mt-0.5 shrink-0" />
          <p>
            <span className="font-semibold">This promotion was archived.</span>{" "}
            It can no longer be edited or used.
          </p>
        </div>
      )}
      {isExpired && (
        <div className="flex items-start gap-3 rounded-xl border border-neutralPrimary-200 bg-neutralPrimary-50 p-3 text-sm text-neutralPrimary-600">
          <Hourglass size={18} className="mt-0.5 shrink-0" />
          <p>
            <span className="font-semibold">Expired.</span> Pick an end date
            from today onward to switch it back on. It becomes Active unless
            you also choose Inactive.
          </p>
        </div>
      )}
      {isInactive && (
        <div className="flex items-start gap-3 rounded-xl border border-warningPrimary-200 bg-warningPrimary-100 p-3 text-sm text-warningPrimary-600">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>
            <span className="font-semibold">Paused.</span> Customers can&apos;t
            use it until the status is set to Active.
          </p>
        </div>
      )}

      {/* Terms that can't change */}
      <div className="rounded-xl border border-neutralPrimary-100 bg-neutralPrimary-50 p-3 sm:p-4">
        <div className="mb-3 flex items-start gap-2.5">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutralPrimary-200 text-neutralPrimary-500">
            <LockKeyhole size={15} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-neutralPrimary-800">
              Locked Terms
            </h3>
            <p className="text-xs text-neutralPrimary-400">
              Fixed once created, because orders may already have used them.
              To change them, archive this promotion and create a new one.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
          <LockedTerm
            label="Discount"
            value={`${formatDiscount(promotion)} ${isPercentage(promotion) ? "off" : "flat"}`}
          />
          {isPercentage(promotion) && (
            <LockedTerm
              label="Max. Discount"
              value={formatTk(promotion.maxDiscountAmount)}
            />
          )}
          <LockedTerm
            label="Min. Order"
            value={formatTk(promotion.minPurchase)}
          />
          <LockedTerm
            label="Max. Order"
            value={formatTk(promotion.maxPurchase)}
          />
          {!canEditStart && (
            <LockedTerm
              label="Starts"
              value={formatDate(promotion.startDate)}
            />
          )}
          <LockedTerm
            label="Used"
            value={`${promotion.usedCount} time${promotion.usedCount === 1 ? "" : "s"}`}
          />
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 sm:gap-5"
      >
        <FormSection
          icon={<CalendarClock size={16} />}
          title="Availability"
          description={
            canEditStart
              ? "What can still change: when it runs, how often it can be used, and who sees it."
              : "What can still change: when it ends, how often it can be used, and who sees it."
          }
        >
          {!canEditStart && statusField}
          {canEditStart && (
            <DateInputField
              name="startDate"
              control={control}
              label="Start Date"
              isRequired
            />
          )}
          <div className="flex flex-col gap-1">
            <DateInputField
              name="endDate"
              control={control}
              label="End Date"
              isRequired
              disabled={isArchived}
            />
            {!isArchived && days !== null && days > 0 && (
              <p className="text-xs text-neutralPrimary-400">
                Runs {effectiveStart ? formatDate(effectiveStart) : "…"} –{" "}
                {endDate ? formatDate(endDate) : "…"} ({days} day
                {days === 1 ? "" : "s"})
                {isExpired && status === "EXPIRED" && dirtyFields.endDate
                  ? "; it will be re-activated"
                  : ""}
              </p>
            )}
          </div>
          {canEditStart && (
            <>
              {statusField}
              <p className="self-end pb-3 text-xs text-neutralPrimary-400">
                Not started yet, so the start date can still move. It locks
                once the promotion begins.
              </p>
            </>
          )}
          <InputField
            labelName="Usage Limit"
            name="usageLimit"
            inputType="number"
            placeholderText={
              promotion.usageLimit ? undefined : "Unlimited; enter a number to cap it"
            }
            control={control}
            inlineError
            trigger={trigger}
            isLoading={isLoading}
            disabled={isArchived}
          />
          <p className="self-end pb-3 text-xs text-neutralPrimary-400">
            {promotion.usageLimit
              ? `Can only be raised. Currently ${promotion.usageLimit}, used ${promotion.usedCount}.`
              : `No limit yet. Used ${promotion.usedCount} time${promotion.usedCount === 1 ? "" : "s"} so far.`}
          </p>
          <div className="md:col-span-2">
            <ToggleButton
              name="isPublic"
              control={control}
              label="Show on Storefront"
              activeLabel="Public: listed in the promo bar and offers page"
              inactiveLabel="Private: works only when typed at checkout"
              defaultValue={false}
              disabled={isArchived}
            />
          </div>
        </FormSection>

        <FormActions
          onCancel={close}
          cancelLabel={isArchived ? "Close" : "Cancel"}
          submitTitle="Save Changes"
          isPending={isPending}
          hideSubmit={isArchived}
        />
      </form>
    </section>
  );
}
