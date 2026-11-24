"use client";

import { useFormContext, useWatch } from "react-hook-form";
import ImageInput from "@/components/form/file-upload/ImageInput";
import { ProductFormData } from "@/modules/product/schemas/product.schema";
import GeneralInformation from "./GeneralInformation";
import ProductPricing from "./ProductPricing";
import ProductInventory from "./ProductInventory";
import ProductVariation from "./ProductVariation";
import ComboItems from "./ComboItems";
import ProductDropdowns from "./ProductDropdowns";
import FormSection from "./FormSection";

// Body shared by the add page and the edit modal. Main column in the order a
// product is usually written up; status and category stay beside it on wide
// screens and drop below it on small ones.
//
// The product type picks the price and stock cards:
//   Simple   — Pricing + Inventory (unchanged).
//   Variable — Variation: one row per size, each with its own price and stock.
//   Combo    — Combo products + Pricing; its stock comes from the items.
export default function ProductFormFields({
  onRemoveImage,
  asideClassName = "lg:top-6",
  productId,
  savedStatus,
}: {
  onRemoveImage?: (attachId: number) => void;
  // Sticky offset for the sidebar; the add page clears its sticky header.
  asideClassName?: string;
  // Edit page: keeps the combo from listing itself as an item.
  productId?: number;
  // Edit page: the status the product has now (an Active one is locked).
  savedStatus?: ProductFormData["productStatus"];
}) {
  const { control } = useFormContext<ProductFormData>();
  const productType = useWatch({ control, name: "productType" });

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <GeneralInformation />
        {productType === "VARIABLE" && <ProductVariation />}
        {productType === "COMBO" && <ComboItems excludeId={productId} />}
        {productType !== "VARIABLE" && <ProductPricing />}
        {productType === "SIMPLE" && <ProductInventory />}
        {/* Images last, after the details, prices and stock. */}
        <FormSection
          title="Media"
          description="The first image is the main photo. Up to 5 MB each."
        >
          <ImageInput
            label="Images"
            name="productImages"
            control={control}
            isRequired={true}
            multiple={true}
            maxFileSize={5 * 1024 * 1024} // 5MB
            onRemoveImage={onRemoveImage}
          />
        </FormSection>
      </div>

      {/* Sticky only on screens tall enough to show the whole sidebar
          (~520px) below the sticky header; on shorter laptops a sticky
          sidebar would hide Product Type until the end of the page. */}
      <aside
        className={`flex flex-col gap-6 lg:[@media(min-height:760px)]:sticky ${asideClassName}`}
      >
        <ProductDropdowns savedStatus={savedStatus} lockType={!!productId} />
      </aside>
    </div>
  );
}
