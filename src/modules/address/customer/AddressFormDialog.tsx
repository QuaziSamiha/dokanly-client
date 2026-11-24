"use client";

import InputField from "@/components/form/InputField";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { axiosInstance } from "@/lib/axios/axiosInstance";
import DivisionDistrictFields from "@/modules/address/components/DivisionDistrictFields";
import { USER_ADDRESS_KEY } from "@/modules/address/hooks/useUserAddress";
import {
  AddressFormData,
  addressFormSchema,
} from "@/modules/address/schemas/address.schema";
import { IAddress } from "@/modules/address/types/address.types";
import { IGenericErrorResponse } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

const EMPTY: AddressFormData = {
  street: "",
  state: "",
  city: "",
  zipCode: "",
  isDefault: false,
};

/** Add a new address, or edit `address` when one is given. */
export default function AddressFormDialog({
  open,
  onOpenChange,
  address,
  isFirstAddress,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: IAddress | null;
  /** The first address always becomes the default, so the checkbox is shown ticked and locked. */
  isFirstAddress?: boolean;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!address;

  const {
    control,
    trigger,
    handleSubmit,
    reset,
    setValue,
    formState: { isDirty },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: EMPTY,
  });

  //* ==== FILL THE FORM EACH TIME IT OPENS (ADD = BLANK, EDIT = THE ADDRESS) ====
  useEffect(() => {
    if (!open) return;
    reset(
      address
        ? {
            street: address.street,
            state: address.state ?? "",
            city: address.city,
            zipCode: address.zipCode,
            isDefault: address.isDefault,
          }
        : { ...EMPTY, isDefault: !!isFirstAddress },
    );
  }, [open, address, isFirstAddress, reset]);

  const { mutate: save, isPending } = useMutation<
    unknown,
    IGenericErrorResponse,
    AddressFormData
  >({
    mutationFn: (data) =>
      isEdit
        ? axiosInstance.patch(`/address/${address!.id}`, data)
        : axiosInstance.post("/address", data),
    onSuccess: () => {
      toast.success(isEdit ? "Address updated" : "Address saved", {
        className: isEdit ? "toast-update" : undefined,
      });
      queryClient.invalidateQueries({ queryKey: [USER_ADDRESS_KEY] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error?.message || "Could not save the address");
    },
  });

  const onSubmit: SubmitHandler<AddressFormData> = (data) => {
    if (isEdit && !isDirty) {
      onOpenChange(false);
      return;
    }
    save({ ...data, isDefault: data.isDefault || undefined });
  };

  const lockDefault = isFirstAddress || (isEdit && address?.isDefault);

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      {/* The fixed site header (96px, 144px from lg with the promo bar) sits above dialogs, so centre the dialog below it with a 16px gap */}
      <DialogContent className="w-[calc(100vw-2rem)] max-w-xl gap-0 rounded-2xl border-0 bg-white p-0 shadow-xl overflow-y-auto top-[calc(50%+3rem)] max-h-[calc(100dvh-8rem)] lg:top-[calc(50%+4.5rem)] lg:max-h-[calc(100dvh-11rem)]">
        <div className="border-b border-neutralPrimary-100 px-6 py-5">
          <DialogTitle className="text-lg font-semibold text-neutralPrimary-800">
            {isEdit ? "Edit address" : "Add a new address"}
          </DialogTitle>
          <DialogDescription className="text-sm text-neutralPrimary-500">
            Your division decides the delivery charge at checkout.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 px-6 py-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
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
              divisionName="state"
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

            <Controller
              control={control}
              name="isDefault"
              render={({ field }) => (
                <label className="sm:col-span-2 flex items-start gap-3 rounded-xl border border-neutralPrimary-200 bg-neutralPrimary-50 p-3.5 cursor-pointer has-[:disabled]:cursor-default">
                  <Checkbox
                    checked={!!field.value || !!lockDefault}
                    onCheckedChange={(v) => field.onChange(v === true)}
                    disabled={!!lockDefault}
                    className="mt-0.5"
                  />
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold text-neutralPrimary-800">
                      Use as my default address
                    </span>
                    <span className="text-xs text-neutralPrimary-500">
                      {lockDefault
                        ? isFirstAddress
                          ? "Your first address is your default."
                          : "This is your default. To change it, make another address the default."
                        : "Checkout will pick this address for you."}
                    </span>
                  </span>
                </label>
              )}
            />
          </div>

          <div className="flex flex-col-reverse gap-2 rounded-b-2xl border-t border-neutralPrimary-100 bg-neutralPrimary-50 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-11 w-full sm:w-auto rounded-lg border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-greenPrimary-500 px-6 text-sm font-semibold text-white shadow-sm hover:bg-greenPrimary-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Save address"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
