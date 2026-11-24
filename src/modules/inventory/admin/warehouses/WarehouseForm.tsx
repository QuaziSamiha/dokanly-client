"use client";

import React from "react";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, MapPin, Settings2 } from "lucide-react";
import InputField from "@/components/form/InputField";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import ToggleButton from "@/components/form/ToggleButton";
import { FormActions, FormSection } from "@/modules/promotion/admin/PromotionFormParts";
import {
  INVENTORY_API,
  settableStatusOptions,
  warehouseTypeOptions,
} from "@/modules/inventory/constants/inventory.constants";
import { useInventoryMutation } from "@/modules/inventory/hooks/useInventory";
import {
  WarehouseFormType,
  warehouseSchema,
} from "@/modules/inventory/schemas/inventory.schema";
import type { IWarehouse } from "@/modules/inventory/types/inventory.types";
import { Callout, ModalTitle } from "../shared/InventoryUi";

/** Add (no `warehouse`) or edit a warehouse. */
export default function WarehouseForm({
  warehouse,
  onClose,
}: {
  warehouse?: IWarehouse;
  onClose: () => void;
}) {
  const isEdit = !!warehouse;
  const { control, trigger, handleSubmit } = useForm<WarehouseFormType>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      code: warehouse?.code ?? "",
      name: warehouse?.name ?? "",
      type: warehouse?.type ?? "WAREHOUSE",
      status: warehouse?.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      isSellable: warehouse?.isSellable ?? true,
      isDefault: warehouse?.isDefault ?? false,
      street: warehouse?.street ?? "",
      city: warehouse?.city ?? "",
      phone: warehouse?.phone ?? "",
    },
  });
  const values = useWatch({ control });

  const { mutate, isPending } = useInventoryMutation(onClose);

  const onSubmit: SubmitHandler<WarehouseFormType> = (data) => {
    const payload = {
      ...data,
      code: data.code.trim().toUpperCase(),
      // Empty text clears the field on the server.
      street: data.street || null,
      city: data.city || null,
      phone: data.phone || null,
    };
    mutate(
      isEdit
        ? { method: "patch", endpoint: `${INVENTORY_API.WAREHOUSES}/${warehouse.id}`, data: payload }
        : { endpoint: INVENTORY_API.WAREHOUSES, data: payload },
    );
  };

  const startsCounting =
    isEdit &&
    (warehouse.isSellable && warehouse.status === "ACTIVE") !==
      (values.isSellable && values.status === "ACTIVE");

  return (
    <section className="flex flex-col gap-4 p-4 sm:p-6">
      <ModalTitle
        title={isEdit ? `Edit ${warehouse.code}` : "Add Warehouse"}
        subtitle="A place that holds stock: the main store room, a city hub, or a bookkeeping location such as quarantine."
      />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:gap-5">
        <FormSection icon={<Building2 size={16} />} title="Identity" description="The code is shown on every stock screen and report.">
          <InputField labelName="Code" name="code" placeholderText="e.g. DHK-HUB" control={control} trigger={trigger} isRequired requiredMessage="Code is required" />
          <InputField labelName="Name" name="name" placeholderText="e.g. Dhaka Hub (Mirpur)" control={control} trigger={trigger} isRequired requiredMessage="Name is required" />
          <SingleSelectSearch labelName="Type" name="type" control={control} options={warehouseTypeOptions} isRequired />
          <SingleSelectSearch labelName="Status" name="status" control={control} options={settableStatusOptions} isRequired />
        </FormSection>

        <FormSection icon={<Settings2 size={16} />} title="Selling" description="How this location's stock is used.">
          <ToggleButton name="isSellable" control={control} label="Sell from this stock" activeLabel="Counts toward the shop" inactiveLabel="Not offered to customers" />
          <ToggleButton
            name="isDefault"
            control={control}
            label="Default warehouse"
            activeLabel="Orders reserve from here"
            inactiveLabel="Not the default"
            disabled={warehouse?.isDefault}
          />
          {startsCounting && (
            <div className="md:col-span-2">
              <Callout tone="warning">
                {values.isSellable && values.status === "ACTIVE"
                  ? "Saving adds this warehouse's available stock to the shop's stock."
                  : "Saving removes this warehouse's available stock from the shop's stock."}
              </Callout>
            </div>
          )}
          {warehouse?.isDefault && (
            <p className="-mt-4 text-xs text-neutralPrimary-400 md:col-span-2">
              To change the default, make another warehouse the default.
            </p>
          )}
        </FormSection>

        <FormSection icon={<MapPin size={16} />} title="Location" description="Optional.">
          <InputField labelName="Street" name="street" placeholderText="House, road, area" control={control} trigger={trigger} />
          <InputField labelName="City" name="city" placeholderText="e.g. Dhaka" control={control} trigger={trigger} />
          <InputField labelName="Phone" name="phone" placeholderText="e.g. 01711000000" control={control} trigger={trigger} />
        </FormSection>

        <FormActions onCancel={onClose} submitTitle={isEdit ? "Save Changes" : "Add Warehouse"} isPending={isPending} />
      </form>
    </section>
  );
}
