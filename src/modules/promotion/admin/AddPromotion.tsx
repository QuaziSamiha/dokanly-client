"use client";

import React, { useEffect } from "react";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgePercent,
  CalendarRange,
  Eye,
  ShoppingCart,
  TicketPercent,
} from "lucide-react";
import InputField from "@/components/form/InputField";
import TextAreaField from "@/components/form/TextAreaField";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import DateInputField from "@/components/form/DateInputField";
import ToggleButton from "@/components/form/ToggleButton";
import { usePost } from "@/hooks/api/usePost";
import { ResponseSuccessType, IModal } from "@/types";
import { promotionDiscountTypes } from "@/modules/promotion/constants/promotion.constants";
import {
  PROMOTION_LIMITS as L,
  PromotionFormType,
  promotionSchema,
} from "@/modules/promotion/schemas/promotion.schema";
import {
  describeOffer,
  durationDays,
  formatDate,
} from "@/modules/promotion/utils/promotion.utils";
import {
  FieldHint,
  FormActions,
  FormSection,
  OfferPreview,
} from "./PromotionFormParts";

export default function AddPromotion({ setOpen, refetch }: IModal) {
  const { control, trigger, handleSubmit, setValue } =
    useForm<PromotionFormType>({
      resolver: zodResolver(promotionSchema),
      defaultValues: {
        couponCode: "",
        title: "",
        description: "",
        discountType: "PERCENTAGE",
        discountValue: undefined,
        maxDiscountAmount: null,
        minPurchase: null,
        maxPurchase: null,
        usageLimit: null,
        startDate: undefined,
        endDate: undefined,
        isPublic: false,
      },
    });

  const values = useWatch({ control });
  const isPercent = values.discountType === "PERCENTAGE";

  // A fixed discount has no cap, so drop one typed for a percentage.
  useEffect(() => {
    if (!isPercent) setValue("maxDiscountAmount", null);
  }, [isPercent, setValue]);

  const { mutate: addPromotion, isPending } = usePost(
    "/promotions/create-promotion",
    (data: ResponseSuccessType) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        setOpen?.(false);
        refetch?.();
      }
    },
  );

  const onSubmit: SubmitHandler<PromotionFormType> = (data) => {
    const payload: Record<string, unknown> = {
      couponCode: data.couponCode.trim().toUpperCase(),
      discountType: data.discountType,
      discountValue: data.discountValue,
      startDate: data.startDate,
      endDate: data.endDate,
      isPublic: data.isPublic,
      title: data.title || undefined,
      description: data.description || undefined,
      usageLimit: data.usageLimit ?? undefined,
      minPurchase: data.minPurchase ?? undefined,
      maxPurchase: data.maxPurchase ?? undefined,
      maxDiscountAmount: isPercent
        ? (data.maxDiscountAmount ?? undefined)
        : undefined,
    };
    // Leave out what wasn't filled in, so the server applies its defaults.
    Object.keys(payload).forEach(
      (key) => payload[key] === undefined && delete payload[key],
    );
    addPromotion(payload);
  };

  const days = durationDays(values.startDate, values.endDate);
  const validity =
    values.startDate && values.endDate
      ? `Valid ${formatDate(values.startDate)} – ${formatDate(values.endDate)}`
      : undefined;

  return (
    <section className="flex flex-col gap-4 p-4 sm:p-6">
      <div>
        <p className="text-xl font-semibold text-neutralPrimary-800 sm:text-2xl">
          Add Promotion
        </p>
        <p className="text-sm text-neutralPrimary-500">
          Create a coupon code customers can use at checkout. It starts active
          on its start date.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 sm:gap-5"
      >
        <FormSection
          icon={<TicketPercent size={16} />}
          title="Coupon"
          description={`${L.COUPON_CODE_MIN}–${L.COUPON_CODE_MAX} letters, numbers, - or _. Saved in capitals; customers can type it in any case. Title and note are only seen by admins.`}
        >
          <InputField
            labelName="Coupon Code"
            name="couponCode"
            placeholderText="e.g. EID10"
            control={control}
            inlineError
            trigger={trigger}
            isRequired
            requiredMessage="Coupon code is required"
          />
          <InputField
            labelName="Title"
            name="title"
            placeholderText="e.g. Eid Hair Care Sale"
            control={control}
            inlineError
            trigger={trigger}
          />
          <div className="md:col-span-2">
            <TextAreaField
              labelName="Internal Note"
              name="description"
              placeholderText="Who is this code for, where was it shared…"
              control={control}
              trigger={trigger}
              rowNo={3}
            />
          </div>
        </FormSection>

        <FormSection
          icon={<BadgePercent size={16} />}
          title="Discount"
          description="How much the customer saves."
        >
          <SingleSelectSearch
            labelName="Discount Type"
            name="discountType"
            control={control}
            options={promotionDiscountTypes}
            isRequired
          />
          <InputField
            labelName={isPercent ? "Discount (%)" : "Discount (Tk)"}
            name="discountValue"
            inputType="number"
            placeholderText={isPercent ? "e.g. 10" : "e.g. 150"}
            control={control}
            inlineError
            trigger={trigger}
            isRequired
            requiredMessage="Discount value is required"
          />
          {isPercent && (
            <>
              <InputField
                labelName="Maximum Discount (Tk)"
                name="maxDiscountAmount"
                inputType="number"
                placeholderText="Leave empty for no cap"
                control={control}
                inlineError
                trigger={trigger}
              />
              <p className="self-end pb-3 text-xs text-neutralPrimary-400">
                Caps a percentage discount, e.g. 10% off up to Tk 300.
              </p>
            </>
          )}
        </FormSection>

        <FormSection
          icon={<ShoppingCart size={16} />}
          title="Conditions"
          description="Leave empty for no limit."
        >
          <InputField
            labelName="Minimum Order (Tk)"
            name="minPurchase"
            inputType="number"
            placeholderText="e.g. 500"
            control={control}
            inlineError
            trigger={trigger}
          />
          <InputField
            labelName="Maximum Order (Tk)"
            name="maxPurchase"
            inputType="number"
            placeholderText="e.g. 5000"
            control={control}
            inlineError
            trigger={trigger}
          />
          <InputField
            labelName="Usage Limit"
            name="usageLimit"
            inputType="number"
            placeholderText="Total orders, e.g. 200"
            control={control}
            inlineError
            trigger={trigger}
          />
          <p className="self-end pb-3 text-xs text-neutralPrimary-400">
            How many orders in total can use the code. It can be raised later,
            not lowered.
          </p>
        </FormSection>

        <FormSection
          icon={<CalendarRange size={16} />}
          title="Schedule"
          description="Both days are included. It expires automatically after the end date."
        >
          <DateInputField
            name="startDate"
            control={control}
            label="Start Date"
            isRequired
          />
          <DateInputField
            name="endDate"
            control={control}
            label="End Date"
            isRequired
          />
          {days !== null && days > 0 && (
            <FieldHint>
              Runs for {days} day{days === 1 ? "" : "s"}.
            </FieldHint>
          )}
        </FormSection>

        <FormSection
          icon={<Eye size={16} />}
          title="Visibility"
          description="Private codes still work for anyone who types them at checkout."
        >
          <ToggleButton
            name="isPublic"
            control={control}
            label="Show on Storefront"
            activeLabel="Public: listed in the promo bar and offers page"
            inactiveLabel="Private: share the code yourself"
            defaultValue={false}
          />
        </FormSection>

        <OfferPreview
          code={values.couponCode?.trim().toUpperCase()}
          offer={
            values.discountValue
              ? `${describeOffer({
                  discountType: values.discountType ?? "PERCENTAGE",
                  discountValue: values.discountValue,
                  maxDiscountAmount: isPercent
                    ? values.maxDiscountAmount
                    : null,
                  minPurchase: values.minPurchase,
                  maxPurchase: values.maxPurchase,
                })}`
              : "Enter a discount to see the offer"
          }
          validity={validity}
        />

        <FormActions
          onCancel={() => setOpen?.(false)}
          submitTitle="Add Promotion"
          isPending={isPending}
        />
      </form>
    </section>
  );
}
