import type { QueryClient } from "@tanstack/react-query";
import { INVENTORY_KEY } from "@/modules/inventory/constants/inventory.constants";

/**
 * Query keys that show product stock: the admin table and its counts, the edit
 * page, the combo picker (sizes and stock) and the home page's featured grid.
 */
const PRODUCT_QUERY_KEYS = [
  "getAdminProducts",
  "getProductStats",
  "getAdminProduct",
  "getBundleOptions",
  "getFeaturedProducts",
];

/** Refetch every product screen, e.g. after Inventory posted stock. */
export const invalidateProductQueries = (queryClient: QueryClient) =>
  PRODUCT_QUERY_KEYS.forEach((key) =>
    queryClient.invalidateQueries({ queryKey: [key] }),
  );

/**
 * After a product save: the server books the form's stock through the
 * inventory ledger, so Inventory's screens change as well as the product ones.
 */
export const invalidateProductAndInventoryQueries = (
  queryClient: QueryClient,
) => {
  invalidateProductQueries(queryClient);
  queryClient.invalidateQueries({ queryKey: [INVENTORY_KEY] });
};
