"use client";

import { useGet, useGetAll } from "@/hooks/api/useGet";
import { useUser } from "@/modules/user/hooks/useUser";
import {
  CustomerOrderGroup,
  ICustomerOrderDetails,
  ICustomerOrderSummary,
  IOrder,
} from "@/modules/order/types/order.types";
import { IPaginationMeta } from "@/types";

export const CUSTOMER_ORDERS_KEY = "getUserOrders";
export const CUSTOMER_ORDER_SUMMARY_KEY = "getUserOrderSummary";
export const CUSTOMER_ORDER_DETAILS_KEY = "getUserOrderDetails";

interface IUserOrdersQuery {
  page?: number;
  limit?: number;
  search?: string;
  group?: CustomerOrderGroup;
}

/** The signed-in customer's orders, one page at a time. */
export function useUserOrders({ page = 1, limit = 10, search, group }: IUserOrdersQuery = {}) {
  const { userId } = useUser();

  const { data, isLoading, isFetching, refetch } = useGetAll<{
    data: IOrder[];
    meta: IPaginationMeta;
  }>(
    "/order/user-order",
    [CUSTOMER_ORDERS_KEY, String(page), String(limit), search ?? "", group ?? ""],
    { page, limit, search: search || undefined, group },
    { enabled: !!userId, placeholderData: (previous) => previous },
  );

  return {
    customerOrders: Array.isArray(data?.data) ? data.data : [],
    meta: data?.meta,
    isUserOrdersLoading: isLoading,
    isUserOrdersFetching: isFetching,
    userOrdersRefetch: refetch,
  };
}

/** Counts and totals for the account overview and the order tabs. */
export function useUserOrderSummary() {
  const { userId } = useUser();
  const { data, isLoading } = useGet<ICustomerOrderSummary>(
    "/order/user-order/summary",
    [CUSTOMER_ORDER_SUMMARY_KEY],
    undefined,
    !!userId,
  );
  return { orderSummary: data, isOrderSummaryLoading: isLoading };
}

/** One of the customer's own orders with its timeline. */
export function useUserOrderDetails(orderId?: number) {
  const { userId } = useUser();
  const { data, isLoading, isError, refetch } = useGet<ICustomerOrderDetails>(
    `/order/user-order/${orderId}`,
    [CUSTOMER_ORDER_DETAILS_KEY, String(orderId)],
    undefined,
    !!userId && !!orderId,
    { retry: false },
  );
  return {
    order: data,
    isOrderLoading: isLoading,
    isOrderError: isError,
    orderRefetch: refetch,
  };
}
