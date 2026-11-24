"use client";

import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Contact, Truck } from "lucide-react";
import InputField from "@/components/form/InputField";
import TextAreaField from "@/components/form/TextAreaField";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import { FormActions, FormSection } from "@/modules/promotion/admin/PromotionFormParts";
import {
  INVENTORY_API,
  settableStatusOptions,
} from "@/modules/inventory/constants/inventory.constants";
import { useInventoryMutation } from "@/modules/inventory/hooks/useInventory";
import {
  SupplierFormType,
  supplierSchema,
} from "@/modules/inventory/schemas/inventory.schema";
import type { ISupplier } from "@/modules/inventory/types/inventory.types";
import { ModalTitle } from "../shared/InventoryUi";

/** Add (no `supplier`) or edit a supplier. */
export default function SupplierForm({
  supplier,
  onClose,
}: {
  supplier?: ISupplier;
  onClose: () => void;
}) {
  const isEdit = !!supplier;
  const { control, trigger, handleSubmit } = useForm<SupplierFormType>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      code: supplier?.code ?? "",
      name: supplier?.name ?? "",
      status: supplier?.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      contactName: supplier?.contactName ?? "",
      phone: supplier?.phone ?? "",
      email: supplier?.email ?? "",
      address: supplier?.address ?? "",
      leadTimeDays: supplier?.leadTimeDays ?? null,
      notes: supplier?.notes ?? "",
    },
  });

  const { mutate, isPending } = useInventoryMutation(onClose);

  const onSubmit: SubmitHandler<SupplierFormType> = (data) => {
    const payload = {
      ...data,
      code: data.code.trim().toUpperCase(),
      contactName: data.contactName || null,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      leadTimeDays: data.leadTimeDays ?? null,
      notes: data.notes || null,
    };
    mutate(
      isEdit
        ? { method: "patch", endpoint: `${INVENTORY_API.SUPPLIERS}/${supplier.id}`, data: payload }
        : { endpoint: INVENTORY_API.SUPPLIERS, data: payload },
    );
  };

  return (
    <section className="flex flex-col gap-4 p-4 sm:p-6">
      <ModalTitle
        title={isEdit ? `Edit ${supplier.code}` : "Add Supplier"}
        subtitle="Who you buy stock from. Only ACTIVE suppliers can get new purchase orders."
      />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:gap-5">
        <FormSection icon={<Truck size={16} />} title="Supplier">
          <InputField labelName="Code" name="code" placeholderText="e.g. SUP-AROMA" control={control} trigger={trigger} isRequired requiredMessage="Code is required" />
          <InputField labelName="Company Name" name="name" placeholderText="e.g. Aroma Packaging Ltd." control={control} trigger={trigger} isRequired requiredMessage="Name is required" />
          <SingleSelectSearch labelName="Status" name="status" control={control} options={settableStatusOptions} isRequired />
          <InputField labelName="Lead Time (days)" name="leadTimeDays" inputType="number" placeholderText="e.g. 7" control={control} trigger={trigger} />
        </FormSection>

        <FormSection icon={<Contact size={16} />} title="Contact" description="Optional.">
          <InputField labelName="Contact Person" name="contactName" placeholderText="e.g. Rafiq Hasan" control={control} trigger={trigger} />
          <InputField labelName="Phone" name="phone" placeholderText="e.g. 01811000000" control={control} trigger={trigger} />
          <InputField labelName="Email" name="email" inputType="email" placeholderText="sales@example.com" control={control} trigger={trigger} />
          <InputField labelName="Address" name="address" placeholderText="Factory or office address" control={control} trigger={trigger} />
          <div className="md:col-span-2">
            <TextAreaField labelName="Notes" name="notes" placeholderText="Payment terms, minimum order..." control={control} trigger={trigger} rowNo={3} />
          </div>
        </FormSection>

        <FormActions onCancel={onClose} submitTitle={isEdit ? "Save Changes" : "Add Supplier"} isPending={isPending} />
      </form>
    </section>
  );
}
