"use client";

import InputField from "@/components/form/InputField";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import SubmitButton from "@/components/form/SubmitButton";
import { usePost } from "@/hooks/api/usePost";
import {
  DeliveryChargeFormType,
  deliveryPricingSchema,
} from "@/modules/delivery-pricing/schemas/delivery-pricing.schema";
import { ResponseSuccessType, IModal } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";

export const deliveryPricing = [
  {
    id: "INSIDE_DHAKA",
    name: "Inside Dhaka",
  },
  {
    id: "OUTSIDE_DHAKA",
    name: "Outside Dhaka",
  },
];

export default function AddDeliveryPricing({ setOpen, refetch }: IModal) {
  const { control, trigger, handleSubmit } = useForm<DeliveryChargeFormType>({
    resolver: zodResolver(deliveryPricingSchema),
    defaultValues: {
      deliveryMethod: undefined,
      deliveryCharge: undefined,
      estimatedDays: undefined,
    },
  });

  const { mutate: addDeliveryPricing, isPending } = usePost(
    "/delivery-pricing",
    (data: ResponseSuccessType) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        setOpen?.(false);
        refetch?.();
      }
    },
  );

  const onSubmit: SubmitHandler<DeliveryChargeFormType> = (data) => {
    // console.log(data);
    const payload = {
      deliveryMethod: data.deliveryMethod,
      baseCharge: data.deliveryCharge,
      estimatedDays: data.estimatedDays,
    };
    console.log(payload);
    addDeliveryPricing(payload);
  };
  return (
    <section className="p-6 flex flex-col gap-4">
      <p className="text-2xl font-semibold text-neutralPrimary-800">
        New Delivery Pricing
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <SingleSelectSearch
          labelName="Delivery Method"
          name="deliveryMethod"
          control={control}
          options={deliveryPricing}
          // defaultValue={"PERCENTAGE"}
          isRequired
        />
        <div className="grid max-md:grid-cols-1 grid-cols-2 gap-6">
          <InputField
            labelName="Delivery Charge"
            name="deliveryCharge"
            inputType="number"
            placeholderText="Enter delivery charge..."
            control={control}
            trigger={trigger}
            isRequired
          />
          <InputField
            labelName="Estimated Days"
            name="estimatedDays"
            inputType="number"
            placeholderText="Enter estimated days..."
            control={control}
            trigger={trigger}
            isRequired
          />
        </div>
        <div className="flex items-end justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen?.(false)}
            className="border border-neutral-300 font-semibold text-base text-neutral-600 rounded-lg cursor-pointer px-5 py-2.5"
          >
            Cancel
          </button>
          <SubmitButton
            submitTitle="Add"
            isPending={isPending}
            buttonWidth="w-fit"
          />
        </div>
      </form>
    </section>
  );
}
