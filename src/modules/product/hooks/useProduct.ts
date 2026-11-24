"use client";
import { IProduct } from "@/modules/product/types/product.types";
import { useGet } from "@/hooks/api/useGet";
import { useMemo } from "react";

export function useProduct() {
  const {
    data: productData = [],
    isLoading: isProductLoading,
    refetch: productDataRefetch,
  } = useGet<IProduct[]>(
    // "Our Must-Haves" on the home page: live products the admin marked
    // Featured. /products/active excludes drafts and archived products and
    // pages by 9 by default, so ask for the 100 maximum.
    `/products/active`,
    ["getFeaturedProducts"],
    { featured: "true", limit: 100 },
  );
  // if (isProductLoading) {
  //   console.log("loading...");
  // } else {
  //   productData?.map((product) => console.log(product.categoryName));
  // }

  const { hairCare, skinCare, bodyCare, others } = useMemo(() => {
    const hairCare: IProduct[] = [];
    const skinCare: IProduct[] = [];
    const bodyCare: IProduct[] = [];
    const others: IProduct[] = [];

    productData?.forEach((product) => {
      const category = product.categoryName
        ? String(product.categoryName).toLowerCase()
        : "";
      const categoryParentId = product?.categoryParentId;

      // console.log("categoryParentId", categoryParentId);

      if (category === "hair care" || categoryParentId == "1") {
        hairCare.push(product);
      } else if (category === "skin care" || categoryParentId == "2") {
        skinCare.push(product);
      } else if (category === "body care" || categoryParentId == "3") {
        bodyCare.push(product);
      } else {
        others.push(product);
      }
    });

    return { hairCare, skinCare, bodyCare, others };
  }, [productData]);

  return {
    productData,
    hairCare,
    skinCare,
    bodyCare,
    others,
    isProductLoading,
    productDataRefetch,
  };
}
