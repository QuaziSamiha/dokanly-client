import InputField from "@/components/form/InputField";
import TextAreaField from "@/components/form/TextAreaField";
import { usePost } from "@/hooks/api/usePost";
import CategoryFormDialog from "@/modules/category/admin/CategoryFormDialog";
import {
  CreateFreeDeliverySchema,
  CreateFreeDeliveryType,
} from "@/modules/free-delivery/schemas/free-delivery.schema";
import { CategoryCreateResponse, IModal } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";

export default function AddFreeDelivery({ setOpen, refetch }: IModal) {
  const { control, trigger, handleSubmit } = useForm({
    resolver: zodResolver(CreateFreeDeliverySchema),
  });

  const { mutate: AddFreeDelivery, isPending } = usePost(
    "/free-delivery-settings/create-free-delivery",
    (data: CategoryCreateResponse) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        setOpen?.(false);
        refetch?.();
      }
    },
  );

  const onSubmit = (data: CreateFreeDeliveryType) => {
    // console.log(data);
    const payload = {
      minOrderAmount: data?.minOrderAmount,
      description: data?.description,
    };
    AddFreeDelivery(payload);
  };

  return (
    <CategoryFormDialog
      title="Add free delivery setting"
      description="Orders whose subtotal reaches this amount get free delivery once the setting is active."
      submitLabel="Add setting"
      pendingLabel="Adding…"
      isPending={isPending}
      onSubmit={handleSubmit(onSubmit)}
      onClose={() => setOpen?.(false)}
    >
      <InputField
        labelName="Minimum Order Amount"
        name="minOrderAmount"
        inputType="number"
        placeholderText="Enter minimum amount..."
        control={control}
        trigger={trigger}
        isRequired
      />
      <TextAreaField
        labelName="Description"
        placeholderText="Write Description"
        name="description"
        control={control}
        trigger={trigger}
      />
    </CategoryFormDialog>
  );
}
