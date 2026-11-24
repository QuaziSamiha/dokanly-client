import { useMemo } from "react";
import { useGet } from "@/hooks/api/useGet";
import { ICategoryOption } from "@/modules/category/types/category.types";

// Select value meaning "no parent". Radix Select can't use "" as an item value.
export const TOP_LEVEL_PARENT = "0";

// GET /categories/active is flat and sorted by sortOrder/name across all levels,
// so rebuild tree order (parent before its children) for indented dropdowns.
export function toTreeOrder(categories: ICategoryOption[]): ICategoryOption[] {
  const byParent = new Map<number | null, ICategoryOption[]>();
  const ids = new Set(categories.map((c) => c.id));
  categories.forEach((c) => {
    // A parent that isn't in the list (hidden/inactive) is treated as a root.
    const key = c.parentId !== null && ids.has(c.parentId) ? c.parentId : null;
    byParent.set(key, [...(byParent.get(key) ?? []), c]);
  });

  const ordered: ICategoryOption[] = [];
  const walk = (parentId: number | null) => {
    byParent.get(parentId)?.forEach((c) => {
      ordered.push(c);
      walk(c.id);
    });
  };
  walk(null);
  return ordered;
}

// Ids of a category and everything under it, from the flat option list.
export function subtreeIds(
  categories: ICategoryOption[],
  rootId: number,
): Set<number> {
  const result = new Set<number>([rootId]);
  let grew = true;
  while (grew) {
    grew = false;
    categories.forEach((c) => {
      if (c.parentId !== null && result.has(c.parentId) && !result.has(c.id)) {
        result.add(c.id);
        grew = true;
      }
    });
  }
  return result;
}

export const indentedName = (c: ICategoryOption) =>
  `${"— ".repeat(c.depth)}${c.name}`;

export default function useCategory() {
  const { data: activeCategoryData, isLoading: activeCategoryDataLoading } =
    useGet<unknown>(`categories/active`, ["getAllActiveCategory"]);

  const activeCategories = useMemo(
    () =>
      Array.isArray(activeCategoryData)
        ? toTreeOrder(activeCategoryData as ICategoryOption[])
        : [],
    [activeCategoryData],
  );

  const allActiveCategory = useMemo(
    () => activeCategories.map((c) => ({ id: c.id, name: indentedName(c) })),
    [activeCategories],
  );

  const parentCategories = useMemo(
    () =>
      activeCategories
        .filter((c) => c.parentId === null)
        .map(({ id, name }) => ({ id, name })),
    [activeCategories],
  );

  const childrenCategories = useMemo(
    () =>
      activeCategories
        .filter((c) => c.parentId !== null)
        .map((c) => ({ id: c.id, name: indentedName(c) })),
    [activeCategories],
  );

  return {
    activeCategories,
    allActiveCategory,
    parentCategories,
    childrenCategories,
    activeCategoryDataLoading,
  };
}
