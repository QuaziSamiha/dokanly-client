"use client";

import { useFormContext } from "react-hook-form";
import InputField from "@/components/form/InputField";
import { ProductFormData } from "@/modules/product/schemas/product.schema";
import { TextEditor } from "@/components/form/TextEditor";
import FormSection from "./FormSection";

export default function GeneralInformation({
  isLoading = false,
}: {
  isLoading?: boolean;
}) {
  const { control, trigger } = useFormContext<ProductFormData>();

  return (
    <FormSection
      title="Product details"
      description="The name and descriptions customers see on the product page."
    >
      <InputField
        inlineError
        labelName="Product Name"
        name="productName"
        placeholderText="e.g. Onion Hair Oil"
        control={control}
        trigger={trigger}
        isRequired
        isLoading={isLoading}
      />
      <TextEditor
        labelName="Short Description"
        name="shortDescription"
        placeholderText="One or two lines shown on product cards"
        control={control}
        trigger={trigger}
        isLoading={isLoading}
        compact
      />
      <TextEditor
        labelName="Description"
        name="description"
        placeholderText="Benefits, ingredients and how to use"
        control={control}
        trigger={trigger}
        isLoading={isLoading}
      />
    </FormSection>
  );
}
