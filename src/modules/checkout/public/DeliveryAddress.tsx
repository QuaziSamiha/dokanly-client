"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { ArrowLeft, Plus } from "lucide-react";
import InputField from "@/components/form/InputField";
import { useUserAddress } from "@/modules/address/hooks/useUserAddress";
import { useUser } from "@/modules/user/hooks/useUser";
import { UserAddressRadioField } from "@/components/form/UserAddressRadioField";
import DivisionDistrictFields from "@/modules/address/components/DivisionDistrictFields";
import CheckoutSection from "./CheckoutSection";

interface IProps {
  setAddNewAddress: React.Dispatch<React.SetStateAction<boolean>>;
  addNewAddress: boolean;
}

export default function DeliveryAddress({
  setAddNewAddress,
  addNewAddress,
}: IProps) {
  const { control, trigger, setValue } = useFormContext();
  const { customerAddresses, isUserAddressLoading } = useUserAddress();
  const { userId } = useUser();

  const showSaved = !!userId && !addNewAddress && customerAddresses.length > 0;
  const showForm = !userId || addNewAddress || customerAddresses.length === 0;

  return (
    <CheckoutSection
      id="checkout-address"
      step={2}
      title="Delivery address"
      description={
        showSaved
          ? "Choose where we should deliver."
          : "Your division decides the delivery charge."
      }
      aside={
        userId && addNewAddress && customerAddresses.length > 0 ? (
          <button
            type="button"
            onClick={() => setAddNewAddress(false)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutralPrimary-300 px-3 py-1.5 text-sm font-medium text-neutralPrimary-600 transition-colors hover:bg-neutralPrimary-50"
          >
            <ArrowLeft size={14} />
            Saved addresses
          </button>
        ) : undefined
      }
    >
      {showSaved && (
        <div className="flex flex-col items-start gap-4">
          {isUserAddressLoading ? (
            <div className="w-full space-y-3">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-24 animate-pulse rounded-xl border border-neutralPrimary-200 bg-neutralPrimary-50"
                />
              ))}
            </div>
          ) : (
            <UserAddressRadioField
              control={control}
              name="addressId"
              isRequired
              options={customerAddresses}
              defaultValue={customerAddresses[0]?.id}
            />
          )}
          <button
            type="button"
            onClick={() => setAddNewAddress(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-greenPrimary-400 px-4 py-2.5 text-sm font-semibold text-greenPrimary-600 transition-colors hover:bg-greenPrimary-950"
          >
            <Plus size={16} />
            Deliver to a new address
          </button>
        </div>
      )}

      {showForm && (
        <>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <InputField
                name="street"
                labelName="Street & House No."
                placeholderText="e.g. House 12, Road 5, Dhanmondi"
                control={control}
                trigger={trigger}
                isRequired
              />
            </div>
            <DivisionDistrictFields
              control={control}
              setValue={setValue}
              divisionName="region"
              districtName="city"
              isRequired
            />
            <InputField
              name="zipCode"
              labelName="Postal Code"
              placeholderText="e.g. 1209"
              control={control}
              trigger={trigger}
              isRequired
            />
          </div>
          {userId && (
            <p className="mt-4 text-xs text-neutralPrimary-500">
              This address will be saved to your account for next time.
            </p>
          )}
        </>
      )}
    </CheckoutSection>
  );
}
