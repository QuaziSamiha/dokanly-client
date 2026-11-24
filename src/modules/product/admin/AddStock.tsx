"use client";

import InputField from "@/components/form/InputField";
// import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import SubmitButton from "@/components/form/SubmitButton";
// import { deliveryCity } from "@/modules/checkout/constants/checkout.constants";
import { IModal } from "@/types";
import React from "react";
import { useForm } from "react-hook-form";

export default function AddStock({ setOpen }: IModal) {
  const { control, trigger, handleSubmit } = useForm();
  const onSubmit = (data: unknown) => {
    console.log(data);
  };
  return (
    <section className="p-6 flex flex-col gap-4">
      <p className="text-2xl font-semibold text-neutralPrimary-800">
        Add Stock
      </p>
      <form
        action=""
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        {/* <SingleSelectSearch
          labelName="Product List"
          name="products"
          control={control}
          options={deliveryCity}
          isRequired
        /> */}
        <div className="flex max-lg:flex-col items-center justify-center gap-6">
          <InputField
            labelName="Size"
            name="productSize"
            placeholderText="Enter product size..."
            control={control}
            trigger={trigger}
          />
          <InputField
            labelName="Quantity"
            name="quantity"
            placeholderText="Enter quantity..."
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
          <SubmitButton submitTitle="Add Stock" buttonWidth="w-fit" />
        </div>
      </form>
    </section>
  );
}
