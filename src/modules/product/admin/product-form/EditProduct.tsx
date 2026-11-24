"use client";

import React, { useMemo, useState } from "react";
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
import { useRouter } from "next/navigation";
// import { useDelete } from "@/hooks/api/useDelete";
// import { ARCHIVE_CONFIRM_MESSAGE } from "@/modules/product/constants/product-admin.constants";
import { createSlug } from "@/lib/utils/slug.utils";
import { IProduct } from "@/modules/product/types/product.types";
import { useFormPatch } from "@/hooks/api/useFormPatch";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateProductAndInventoryQueries } from "@/modules/product/utils/product-cache.utils";
// Full page at /products/edit/[id], laid out like the add page.
export default function EditProduct({ data: rowData }: { data: IProduct }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  // console.log(rowData);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  // console.log(removedImageIds);
  const {
    id,
    name,
    // slug,
    size,
    price,
    discountPrice,
    quantity,
    description,
    shortDescription,
    images,
    categoryId,
    type,
    status,
    featured,
    variants,
    bundleItems,
    // stockStatus,
  } = rowData as IProduct;
  // console.log(weight);

  // Sizes and combo lines as the form holds them; an empty row when there are
  // none, so switching the type shows a row to fill in.
  const initialVariants = useMemo(
    () =>
      variants?.length
        ? variants.map((v) => ({
            id: v.id,
            size: v.size,
            price: Number(v.price),
            discountPrice: Number(v.discountPrice) || null,
            quantity: Number(v.quantity),
            status: v.status ?? ("ACTIVE" as const),
          }))
        : [emptyVariant()],
    [variants],
  );
  const initialBundleItems = useMemo(
    () =>
      bundleItems?.length
        ? bundleItems.map((item) => ({
            productId: String(item.productId),
            variantId: item.variantId ? String(item.variantId) : null,
            quantity: item.quantity,
          }))
        : [emptyBundleItem()],
    [bundleItems],
  );

  // ============= REACT HOOK FORM ==============
  const methods = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: name,
      description: description && description,
      shortDescription: shortDescription && shortDescription,
      productImages:
        images?.map((img) => ({
          filePath: img.url,
          name: img.altText || "Product image",
          attachId: img.id,
        })) || [],
      // Sizes and combos may have no pack size of their own.
      size: size != null && Number(size) > 0 ? Number(size) : null,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      quantity: Number(quantity),
      productCategory: categoryId.toString(),
      productType: type ?? "SIMPLE",
      // Archived products never reach this form (EditProductPage stops them).
      productStatus: status && status !== "ARCHIVED" ? status : "ACTIVE",
      featured: !!featured,
      variants: initialVariants,
      bundleItems: initialBundleItems,
      // productStockStatus: stockStatus,
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    formState: { isDirty, dirtyFields },
  } = methods;


  // ======== HANDLE IMAGE REMOVE ===========
  const handleRemoveImage = (attachId: number) => {
    setRemovedImageIds((prev) => [...prev, attachId]);
  };

  // ============= API HOOK ==============
  // ============= DELETE (archive) ==============
  // Switched off until there is a business policy for deleting products.
  // const { mutate: deleteProduct, isPending: isDeleting } =
  //   useDelete("getAdminProducts");
  // const handleDelete = () => {
  //   if (window.confirm(ARCHIVE_CONFIRM_MESSAGE)) {
  //     deleteProduct(`/products/${id}`, {
  //       onSuccess: () => router.push("/products"),
  //     });
  //   }
  // };

  const { mutate: updateProduct, isPending } = useFormPatch<IProduct>(
    (data) => {
      if (data.statusCode >= 200 && data.statusCode < 300) {
        // * Stock changes were booked into Inventory too.
        invalidateProductAndInventoryQueries(queryClient);
        router.push("/products");
      }
    },
    (error) => {
      console.error("Update failed:", error);
    }
  );

  // ============ FORM SUBMIT ===========
  const onSubmit = (data: ProductFormData) => {
    // console.log(data);
    if (!isDirty) {
      toast.info("No changes to save.");
      return;
    }

    const formData: FormData | Record<string, unknown> = new FormData();

    if (dirtyFields.productName) {
      formData.append("name", data.productName);
      formData.append("slug", createSlug(data.productName));
    }
    if (dirtyFields.description) {
      formData.append("description", data?.description ?? "");
    }
    if (dirtyFields.shortDescription) {
      formData.append("shortDescription", data.shortDescription ?? "");
    }
    if (dirtyFields.productCategory) {
      formData.append("categoryId", data.productCategory.toString());
    }
    // The type is fixed once a product is created (the field is read-only).
    if (data.productType === "VARIABLE") {
      // Price and stock live on the sizes. Send the whole list when anything
      // in it changed: sizes left out are removed on the server. A size's
      // stock is sent only when it was edited here; otherwise the server
      // leaves it, so this form can't undo sales made since it was opened.
      if (
        toVariantsPayload(data.variants) !== toVariantsPayload(initialVariants)
      ) {
        formData.append(
          "variants",
          toVariantsPayload(data.variants, initialVariants),
        );
      }
    } else {
      if (dirtyFields.price) {
        formData.append("price", String(data.price));
      }
      if (dirtyFields.discountPrice) {
        formData.append("discountPrice", data?.discountPrice?.toString() || "0");
      }
    }

    if (data.productType === "SIMPLE") {
      if (dirtyFields.quantity) {
        formData.append("quantity", String(data.quantity));
      }
      if (dirtyFields.size) {
        formData.append("size", String(data.size));
      }
    }

    if (data.productType === "COMBO") {
      const items = toBundleItemsPayload(data.bundleItems);
      if (items !== toBundleItemsPayload(initialBundleItems)) {
        formData.append("bundleItems", items);
      }
    }
    if (dirtyFields.productStatus) {
      formData.append("status", data.productStatus);
    }
    if (dirtyFields.featured) {
      formData.append("featured", String(data.featured));
    }
    // if (dirtyFields.productStockStatus) {
    //   formData.append("stockStatus", data?.price);
    // }

    if (data.productImages && data.productImages.length > 0) {
      // Send new files
      data.productImages.forEach((file) => {
        if (file instanceof File) {
          formData.append("newImages", file);
        }
      });

      // Always send the current order of existing images so the server can reorder them
      const existingImageOrder = data.productImages
        .filter(
          (img) =>
            !(img instanceof File) &&
            typeof img === "object" &&
            "attachId" in img &&
            img.attachId,
        )
        .map((img) => (img as { attachId: number }).attachId);

      if (existingImageOrder.length > 0) {
        formData.append("imageOrder", JSON.stringify(existingImageOrder));
      }
    }

    if (removedImageIds.length > 0) {
      formData.append("deleteImageIds", JSON.stringify(removedImageIds));
    }

    // console.log([...formData.entries()]);
    updateProduct({
      endpoint: `/products/${id}`,
      data: formData,
    });
  };

  return (
    <section className={`w-full ${PHONE_ACTION_BAR_SPACE}`}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <ProductFormHeader
            title="Edit Product"
            submitTitle="Save Changes"
            isPending={isPending}
            // onDelete={handleDelete}
            // isDeleting={isDeleting}
          />

          <ProductFormFields
            onRemoveImage={handleRemoveImage}
            asideClassName="lg:top-48"
            productId={id}
            savedStatus={
              status && status !== "ARCHIVED" ? status : undefined
            }
          />
        </form>
      </FormProvider>
    </section>
  );
}
