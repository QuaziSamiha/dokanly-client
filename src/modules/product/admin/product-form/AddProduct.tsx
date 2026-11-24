"use client";

import React from "react";
import {
  emptyBundleItem,
  emptyVariant,
  ProductFormData,
  productSchema,
  toBundleItemsPayload,
  toVariantsPayload,
} from "@/modules/product/schemas/product.schema";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ProductFormFields from "./ProductFormFields";
import ProductFormHeader, {
  PHONE_ACTION_BAR_SPACE,
} from "./ProductFormHeader";
import { createSlug } from "@/lib/utils/slug.utils";
import { useRouter } from "next/navigation";
import { useFormPost } from "@/hooks/api/useFormPost";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateProductAndInventoryQueries } from "@/modules/product/utils/product-cache.utils";
export interface IProps {
  refetch?: () => void;
}

export default function AddProduct({ refetch }: IProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const methods = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: "",
      shortDescription: "",
      description: "",
      productImages: [],
      size: undefined,
      price: undefined,
      discountPrice: undefined,
      quantity: undefined,
      productCategory: "",
      productType: "SIMPLE",
      productStatus: "ACTIVE",
      featured: false,
      // One empty row each, so switching the type shows a row to fill in.
      variants: [emptyVariant()],
      bundleItems: [emptyBundleItem()],
    },
    mode: "onChange",
  });

  const { handleSubmit, reset } = methods;

  const { mutate: addProduct, isPending } = useFormPost(
    "/products",
    (data: unknown) => {
      const response = data as { statusCode: number };
      if (response.statusCode >= 200 && response.statusCode < 300) {
        // * The typed stock was booked into Inventory too.
        invalidateProductAndInventoryQueries(queryClient);
        reset();
        router.push("/products");
        refetch?.();
      }
    }
  );

  const onSubmit = (data: ProductFormData) => {
    const formData = new FormData();

    formData.append("name", data.productName);
    formData.append("description", data?.description || "");
    formData.append("shortDescription", data?.shortDescription || "");
    formData.append("slug", createSlug(data.productName));
    formData.append("categoryId", String(data.productCategory));
    formData.append("type", data.productType);
    if (data.productType === "VARIABLE") {
      // Price and stock live on the sizes.
      formData.append("variants", toVariantsPayload(data.variants));
    } else {
      formData.append("price", String(data.price));
      formData.append("discountPrice", data?.discountPrice?.toString() || "0");
    }
    if (data.productType === "SIMPLE") {
      formData.append("quantity", String(data.quantity));
      formData.append("size", String(data.size));
    }
    if (data.productType === "COMBO") {
      // A combo's stock comes from its items.
      formData.append("bundleItems", toBundleItemsPayload(data.bundleItems));
    }
    formData.append("status", data.productStatus);
    formData.append("featured", String(data.featured));
    if (data.productImages && data.productImages.length > 0) {
      data.productImages.forEach((file) => {
        if (file instanceof File) {
          formData.append("images", file);
        }
      });
    }

    addProduct(formData as unknown as Record<string, unknown>);
  };

  return (
    <section className={`w-full ${PHONE_ACTION_BAR_SPACE}`}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <ProductFormHeader
            title="Add Product"
            submitTitle="Save Product"
            isPending={isPending}
          />

          <ProductFormFields asideClassName="lg:top-48" />
        </form>
      </FormProvider>
    </section>
  );
}
