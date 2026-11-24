"use client";

import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import { ProductFormData } from "@/modules/product/schemas/product.schema";
import useCategory from "@/modules/category/hooks/useCategory";
import {
  productStatus,
  productTypes,
} from "@/modules/product/constants/product-admin.constants";
import FormSection from "./FormSection";
import FeaturedSwitch from "./FeaturedSwitch";

const TYPE_HINT: Record<ProductFormData["productType"], string> = {
  SIMPLE: "One item with one price and stock.",
  VARIABLE: "Comes in sizes, each with its own price and stock.",
  COMBO: "A bundle of other products sold as one item; its stock comes from them.",
};

const STATUS_HINT: Record<ProductFormData["productStatus"], string> = {
  DRAFT: "Hidden from the shop while you finish preparing it.",
  ACTIVE: "Visible in the shop and available to order.",
  INACTIVE:
    "Hidden from the shop and can't be ordered. Customers still see it in their past orders. Set it back to Active any time.",
};

// Shown while a live product is about to be taken off the shop.
const HIDE_WARNING =
  "Saving removes this product from the shop, search and carts. Existing orders are not affected.";

// Sidebar of the product form: publishing status, then where the product lives.
// Archived isn't a choice here: deleting a product archives it.
//
// Draft means "not launched yet", so it is only offered until the product has
// been Active or Inactive; after that it moves between Active and Inactive.
export default function ProductDropdowns({
  savedStatus,
  lockType = false,
}: {
  // Edit page: the status the product has now.
  savedStatus?: ProductFormData["productStatus"];
  // Edit page: the type is chosen once, when the product is created.
  lockType?: boolean;
}) {
  const { control } = useFormContext<ProductFormData>();
  const { childrenCategories, activeCategoryDataLoading } = useCategory();
  const status = useWatch({ control, name: "productStatus" });
  const type = useWatch({ control, name: "productType" });
  const launched = savedStatus === "ACTIVE" || savedStatus === "INACTIVE";
  const statusOptions = useMemo(
    () =>
      launched ? productStatus.filter((s) => s.id !== "DRAFT") : productStatus,
    [launched],
  );
  const hiding = savedStatus === "ACTIVE" && status && status !== "ACTIVE";

  return (
    <>
      <FormSection
        title="Status"
        description={status && STATUS_HINT[status]}
      >
        <SingleSelectSearch
          labelName="Product Status"
          name="productStatus"
          control={control}
          options={statusOptions}
          isRequired
        />
        {hiding && (
          <p
            role="status"
            className="-mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
          >
            {HIDE_WARNING}
          </p>
        )}
        <div className="border-t border-neutralPrimary-200 pt-5">
          <FeaturedSwitch />
        </div>
      </FormSection>

      <FormSection title="Organization">
        <SingleSelectSearch
          labelName="Category"
          name="productCategory"
          control={control}
          options={childrenCategories}
          isLoading={activeCategoryDataLoading}
          isRequired
        />
        <SingleSelectSearch
          labelName="Product Type"
          name="productType"
          control={control}
          options={productTypes}
          isRequired
          isDisabled={lockType}
        />
        {type && (
          <p className="-mt-3 text-sm text-neutralPrimary-500">
            {TYPE_HINT[type]}
            {lockType &&
              " The type can't be changed after the product is created; to sell it as another type, create a new product."}
          </p>
        )}
      </FormSection>
    </>
  );
}
