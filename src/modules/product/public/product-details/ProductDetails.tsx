"use client";

import CustomBreadCrumb from "@/components/primitives/CustomBreadCrumb";
import Hero from "@/components/layout/hero/Hero";
import React, { useEffect, useMemo } from "react";
import DetailsWithAction from "./DetailsWithAction";
// import * as pixel from "@/lib/analytics/fpixel"; // * LEGACY: direct Meta Pixel call — superseded by GTM dataLayer push below
import { trackEvent } from "@/lib/analytics/gtm.events";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, PackageSearch } from "lucide-react";
import { useGet } from "@/hooks/api/useGet";
import ProductImages from "./ProductImages";
import { IProduct } from "@/modules/product/types/product.types";
import CarouselWithTitle from "@/modules/product/public/product-details/CarouselWithTitle";
import ProductImagesSkeleton from "./ProductImagesSkeleton";
import ProductDescription from "./ProductDescription";
import { Skeleton } from "@/components/ui/skeleton";
import { productItemId, productPricing, productStock } from "./product-details.utils";
import { toPlainText } from "@/modules/product/utils/product-text.utils";

const RELATED_LIMIT = 12;

export default function ProductDetails() {
  const params = useParams();

  const queryKey =
    typeof params.slug === "string" ? params.slug : "getProductDetails";
  const {
    data: productDetailsData,
    isLoading: isProductDetailsLoading,
    isError: isProductDetailsError,
  } = useGet<IProduct>(`/products/slug/${params.slug}`, [queryKey]);

  const shouldFetchCategory = !!productDetailsData?.categoryId;
  const { data: relevantData, isLoading: isRelevantDataLoading } = useGet<
    IProduct[]
  >(
    `/products/filter?categoryId=${productDetailsData?.categoryId}&status=ACTIVE`,
    [`getRelevantCategory+${productDetailsData?.categoryId}`],
    undefined,
    shouldFetchCategory
  );

  // * Don't recommend the product the customer is already looking at
  const relatedProducts = useMemo(
    () =>
      (relevantData ?? [])
        .filter((product) => product.id !== productDetailsData?.id)
        .slice(0, RELATED_LIMIT),
    [relevantData, productDetailsData?.id]
  );

  useEffect(() => {
    if (productDetailsData) {
      // * LEGACY: direct Meta Pixel call — kept for rollback safety, superseded by trackEvent() below
      // pixel.event("ViewContent", {
      //   content_ids: [productDetailsData.sku ? productDetailsData.sku : `PROD_${productDetailsData.id}`],
      //   content_type: "product",
      //   content_name: productDetailsData.name,
      //   value: Number(productDetailsData.price),
      //   currency: "BDT",
      // });

      trackEvent({
        name: "view_item",
        params: {
          item_id: productItemId(productDetailsData),
          item_name: productDetailsData.name,
          value: Number(productDetailsData.price),
          currency: "BDT",
        },
      });
    }
  }, [productDetailsData]);

  const product = productDetailsData;
  const categoryName = product?.category?.name || product?.categoryName;
  const pricing = product ? productPricing(product) : null;
  const stock = product ? productStock(product) : null;
  const isNotFound = !isProductDetailsLoading && (isProductDetailsError || !product);

  const crumbs = categoryName ? [{ label: categoryName, link: "/product" }] : [];

  return (
    <section className="w-full overflow-x-clip">
      <Hero
        heroHeading={categoryName || "Our Products"}
        customBreadCrumb={
          <CustomBreadCrumb
            previousItemLinks={crumbs}
            currentItem={product?.name || "Product Details"}
          />
        }
      />

      <main className="container mx-auto px-4 pt-4 pb-12 sm:pb-16 lg:pt-10 2xl:px-0">
        {/* //* ========== MOBILE BREADCRUMB (hero is hidden below lg) ========= */}
        <nav aria-label="Breadcrumb" className="mb-4 lg:hidden">
          <ol className="flex min-w-0 items-center gap-1 text-xs text-neutralPrimary-500">
            <li className="shrink-0">
              <Link href="/" className="hover:text-greenPrimary-600">
                Home
              </Link>
            </li>
            {crumbs.map((crumb) => (
              <li key={crumb.label} className="flex shrink-0 items-center gap-1">
                <ChevronRight className="size-3.5 shrink-0" aria-hidden />
                <Link href={crumb.link} className="hover:text-greenPrimary-600">
                  {crumb.label}
                </Link>
              </li>
            ))}
            <li className="flex min-w-0 items-center gap-1">
              <ChevronRight className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate font-medium text-neutralPrimary-700" aria-current="page">
                {product?.name || "Product"}
              </span>
            </li>
          </ol>
        </nav>

        {isNotFound ? (
          <ProductNotFound />
        ) : (
          <div className="flex min-w-0 flex-col gap-10 sm:gap-14">
            {/* //* ========== GALLERY + BUY BOX ========= */}
            <div className="grid grid-cols-1 items-start gap-5 sm:gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-14">
              {/* Capped below lg so the square gallery doesn't fill a whole tablet screen */}
              <div className="mx-auto w-full max-w-xl min-w-0 lg:sticky lg:top-32 lg:max-w-none">
                {isProductDetailsLoading || !product ? (
                  <ProductImagesSkeleton />
                ) : (
                  <ProductImages
                    key={product.id}
                    images={product.images ?? []}
                    productName={product.name}
                    percentOff={pricing?.percentOff}
                    isOutOfStock={stock?.isOutOfStock}
                  />
                )}
              </div>
              {isProductDetailsLoading || !product ? (
                <DetailsSkeleton />
              ) : (
                <DetailsWithAction key={product.id} product={product} />
              )}
            </div>

            {product?.description && <ProductDescription html={product.description} />}

            <CarouselWithTitle
              products={relatedProducts}
              title="You May Also Like"
              isLoading={shouldFetchCategory && isRelevantDataLoading}
            />
          </div>
        )}
      </main>

      {product && pricing && stock && (
        <script
          type="application/ld+json"
          // * Product rich results (price, availability) for search engines
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: product.name,
              sku: product.sku,
              description: product.seoDescription || toPlainText(product.shortDescription),
              image: product.images?.map((image) => image.url),
              brand: { "@type": "Brand", name: "Natura Care" },
              offers: {
                "@type": "Offer",
                priceCurrency: "BDT",
                price: pricing.unit,
                availability: stock.isOutOfStock
                  ? "https://schema.org/OutOfStock"
                  : "https://schema.org/InStock",
              },
            }).replace(/</g, "\\u003c"),
          }}
        />
      )}
    </section>
  );
}

function DetailsSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5 lg:max-w-none">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-3 w-24 rounded-sm" />
        <Skeleton className="h-7 w-full rounded-md sm:h-10" />
        <Skeleton className="h-7 w-2/3 rounded-md sm:h-10" />
      </div>
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full rounded-sm" />
        <Skeleton className="h-4 w-5/6 rounded-sm" />
      </div>
      <Skeleton className="h-11 w-40 rounded-lg" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Skeleton className="h-12 rounded-lg" />
        <Skeleton className="h-12 rounded-lg" />
      </div>
    </div>
  );
}

function ProductNotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center sm:py-24">
      <span className="flex size-16 items-center justify-center rounded-full bg-greenPrimary-950 text-greenPrimary-500">
        <PackageSearch className="size-8" />
      </span>
      <h1 className="text-2xl font-semibold text-neutralPrimary-800">
        Product not found
      </h1>
      <p className="text-neutralPrimary-500">
        This product may have been removed or is no longer available.
      </p>
      <Link
        href="/product"
        className="rounded-lg bg-greenPrimary-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-greenPrimary-600"
      >
        Browse all products
      </Link>
    </div>
  );
}
