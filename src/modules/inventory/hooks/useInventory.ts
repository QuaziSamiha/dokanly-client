"use client";

import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGetAll } from "@/hooks/api/useGet";
import { axiosInstance } from "@/lib/axios/axiosInstance";
import { IGenericErrorResponse, IPaginationMeta } from "@/types";
import {
  INVENTORY_API,
  INVENTORY_KEY,
} from "@/modules/inventory/constants/inventory.constants";
import type {
  IStockLevel,
  IStockLot,
  ISupplier,
  IWarehouse,
} from "@/modules/inventory/types/inventory.types";
import {
  compact,
  stockItemKey,
} from "@/modules/inventory/utils/inventory.utils";
import { invalidateProductQueries } from "@/modules/product/utils/product-cache.utils";

/** The product fields the pickers need (GET /products, admin view). */
type ProductOptionRow = {
  id: number;
  name: string;
  sku: string | null;
  status: string;
  type: "SIMPLE" | "VARIABLE" | "COMBO";
  variants?: {
    id: number;
    size: string;
    sku?: string | null;
    status: string;
  }[];
  bundleItems?: unknown[];
};

type Envelope<T> = {
  statusCode: number;
  message: string;
  data: T;
  meta?: IPaginationMeta;
};

/**
 * GET an inventory endpoint. The query key carries the params, and every key
 * starts with INVENTORY_KEY so a mutation can refresh all inventory screens.
 */
export function useInventoryQuery<T>(
  endpoint: string,
  params: Record<string, unknown> = {},
  enabled = true,
) {
  const clean = compact(params);
  const query = useGetAll<Envelope<T>>(
    endpoint,
    [INVENTORY_KEY, endpoint, JSON.stringify(clean)],
    clean,
    undefined,
    enabled,
  );
  return {
    data: query.data?.data,
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}

type MutationInput = {
  method?: "post" | "patch" | "delete";
  endpoint: string;
  data?: Record<string, unknown>;
};

/**
 * POST / PATCH / DELETE with the app's toast behaviour. The axios interceptor
 * resolves with the { statusCode, message, data } envelope and rejects with
 * { statusCode, message }, so failures land in onError. Every inventory query
 * is refreshed on success, and so are the product screens: posted stock moves
 * the shop numbers (a product's, a size's, and the combos it is in).
 */
export function useInventoryMutation<T = unknown>(
  onSuccess?: (data: T) => void,
) {
  const queryClient = useQueryClient();
  return useMutation<Envelope<T>, IGenericErrorResponse, MutationInput>({
    mutationFn: async ({ method = "post", endpoint, data = {} }) => {
      const response =
        method === "delete"
          ? await axiosInstance.delete(endpoint)
          : await axiosInstance[method](endpoint, data);
      return response as unknown as Envelope<T>;
    },
    onSuccess: (result) => {
      toast.success(result.message ?? "Saved");
      queryClient.invalidateQueries({ queryKey: [INVENTORY_KEY] });
      invalidateProductQueries(queryClient);
      onSuccess?.(result.data);
    },
    onError: (error) => {
      const message = Array.isArray(error?.message)
        ? error.message.join(", ")
        : error?.message;
      toast.error(message || "Something went wrong. Please try again.");
    },
  });
}

/**
 * { id, name } options for the pickers, plus the raw rows. Product options are
 * stock items: a product without sizes ("12"), or each size of a VARIABLE
 * product ("12:41"). Combos with items hold no stock, so they aren't offered.
 */
export function useInventoryOptions({
  withLots = false,
}: { withLots?: boolean } = {}) {
  const warehouses = useInventoryQuery<IWarehouse[]>(INVENTORY_API.WAREHOUSES);
  const suppliers = useInventoryQuery<ISupplier[]>(INVENTORY_API.SUPPLIERS);
  const products = useGetAll<Envelope<ProductOptionRow[]>>(
    INVENTORY_API.PRODUCTS,
    [INVENTORY_KEY, "product-options"],
  );
  const lots = useInventoryQuery<IStockLot[]>(
    INVENTORY_API.LOTS,
    { onlyWithStock: true },
    withLots,
  );

  return useMemo(() => {
    const warehouseRows = warehouses.data ?? [];
    const productRows = (products.data?.data ?? []).filter(
      (p) => p.status !== "ARCHIVED",
    );
    const stockItems = productRows.flatMap((p) => {
      if (p.type === "VARIABLE") {
        return (p.variants ?? []).map((v) => {
          const sku = v.sku ?? p.sku;
          const name = `${p.name} - ${v.size}${v.status === "INACTIVE" ? " (inactive)" : ""}`;
          return {
            id: stockItemKey(p.id, v.id),
            name: sku ? `${name} (${sku})` : name,
            label: `${p.name} - ${v.size}`,
          };
        });
      }
      if (p.type === "COMBO" && (p.bundleItems?.length ?? 0) > 0) return [];
      return [
        {
          id: stockItemKey(p.id),
          name: p.sku ? `${p.name} (${p.sku})` : p.name,
          label: p.name,
        },
      ];
    });
    return {
      warehouses: warehouseRows,
      activeWarehouseOptions: warehouseRows
        .filter((w) => w.status === "ACTIVE")
        .map((w) => ({ id: w.id, name: `${w.code} · ${w.name}` })),
      supplierOptions: (suppliers.data ?? [])
        .filter((s) => s.status === "ACTIVE")
        .map((s) => ({ id: s.id, name: `${s.code} · ${s.name}` })),
      productOptions: stockItems.map(({ id, name }) => ({ id, name })),
      /** "Name - 100ml" for a stock-item key. */
      productName: (key: string) => stockItems.find((i) => i.id === key)?.label,
      lots: lots.data ?? [],
      isLoading: warehouses.isLoading || suppliers.isLoading || products.isLoading,
    };
  }, [warehouses.data, warehouses.isLoading, suppliers.data, suppliers.isLoading, products.data, products.isLoading, lots.data]);
}

/** On-hand per stock item (keyed by stockItemKey) in one warehouse, for the "on hand" hints in forms. */
export function useWarehouseStock(warehouseId?: number) {
  const { data } = useInventoryQuery<IStockLevel[]>(
    INVENTORY_API.STOCK,
    { warehouseId },
    !!warehouseId,
  );
  return useMemo(() => {
    const byItem = new Map<string, IStockLevel>();
    (data ?? []).forEach((row) =>
      byItem.set(stockItemKey(row.product.id, row.product.variantId), row),
    );
    return byItem;
  }, [data]);
}
