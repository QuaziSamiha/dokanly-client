"use client";

import Link from "next/link";
import React from "react";
import { useParams } from "next/navigation";
import { useGet } from "@/hooks/api/useGet";
import { IProduct } from "@/modules/product/types/product.types";
import LoadingPage from "@/components/feedback/loading/LoadingPage";
import EditProduct from "./EditProduct";

// Loads the product by slug (any status), then hands it to the form. The form
// takes its starting values once, so the query is never served from cache
// (gcTime 0) and never refetched mid-edit (no refetch on focus).
export default function EditProductPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: product, isLoading, isError } = useGet<IProduct>(
    `/products/admin/slug/${slug}`,
    ["getAdminProduct", slug],
    undefined,
    !!slug,
    { gcTime: 0, refetchOnWindowFocus: false },
  );

  if (isLoading) return <LoadingPage />;

  if (isError || !product) {
    return (
      <section className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-lg font-semibold text-neutralPrimary-800">
          Product not found
        </p>
        <p className="text-sm text-neutralPrimary-500">
          It may have been removed, or the link is wrong.
        </p>
        <Link
          href="/products"
          className="text-sm font-semibold text-greenPrimary-600 hover:text-greenPrimary-700"
        >
          Back to products
        </Link>
      </section>
    );
  }

  // Deleted (archived) products are read-only; the server refuses edits too.
  if (product.status === "ARCHIVED") {
    return (
      <section className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-lg font-semibold text-neutralPrimary-800">
          This product has been deleted
        </p>
        <p className="max-w-md text-sm text-neutralPrimary-500">
          &ldquo;{product.name}&rdquo; is archived, so it can no longer be
          edited. Past orders still show it, and its name can be used for a new
          product.
        </p>
        <Link
          href="/products"
          className="text-sm font-semibold text-greenPrimary-600 hover:text-greenPrimary-700"
        >
          Back to products
        </Link>
      </section>
    );
  }

  return <EditProduct data={product} />;
}
