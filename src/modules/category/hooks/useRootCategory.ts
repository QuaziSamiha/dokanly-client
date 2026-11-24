import { useMemo } from "react";
import { useGet } from "@/hooks/api/useGet";
import { ICategoryOption } from "@/modules/category/types/category.types";

// GET /categories/active/roots: ACTIVE top-level categories (depth 0), already
// in display order. Used for the parent field of the category forms.
export default function useRootCategory() {
  const { data, isLoading: rootCategoryLoading } = useGet<unknown>(
    `categories/active/roots`,
    ["getActiveRootCategory"],
  );

  const rootCategories = useMemo(
    () =>
      Array.isArray(data)
        ? (data as ICategoryOption[]).map(({ id, name }) => ({ id, name }))
        : [],
    [data],
  );

  return { rootCategories, rootCategoryLoading };
}
