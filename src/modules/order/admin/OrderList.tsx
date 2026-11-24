"use client";

import React, { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useGet, useGetAll } from "@/hooks/api/useGet";
import { usePatch } from "@/hooks/api/usePatch";
import { useHandleModalState } from "@/hooks/table/useHandleModalState";
import { useConfirm } from "@/hooks/useConfirm";
import { axiosInstance } from "@/lib/axios/axiosInstance";
import { getBaseUrl } from "@/config/env.config";
import { IConfirmOptions, IPaginationMeta } from "@/types";
import CustomTable from "@/components/data-display/table/CustomTable";
import CustomModal2 from "@/components/primitives/modal/CustomModal2";
import CustomModalStaticTitleFooter from "@/components/primitives/modal/CustomModalStaticTitleFooter";
import InvoicePDF from "@/modules/checkout/public/InvoicePDF";
import {
  IOrder,
  IOrderFilters,
  IOrderStats,
  OrderStatus,
} from "@/modules/order/types/order.types";
import {
  dhakaToday,
  orderToInvoice,
  ordersToCsv,
} from "@/modules/order/utils/order.utils";
import { orderColumns } from "./order.columns";
import ViewOrder from "./ViewOrder";
import EditPlacedOrder from "./EditPlacedOrder";
import OrderStatsCards from "./order-list/OrderStatsCards";
import OrderStatusTabs from "./order-list/OrderStatusTabs";
import OrderFilters from "./order-list/OrderFilters";

// Same responsive steps as the Product and Promotion view modals.
const VIEW_MODAL_WIDTH =
  "w-[calc(100vw-1.5rem)] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-w-5xl";
const EDIT_MODAL_WIDTH =
  "w-[calc(100vw-1.5rem)] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-w-4xl";

const BUTTON_BASE =
  "inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const HEADER_BUTTON = `${BUTTON_BASE} border-neutralPrimary-300 bg-white text-neutralPrimary-600 hover:bg-neutralPrimary-50`;
// * Its own colours, not HEADER_BUTTON plus overrides: two bg/text classes on
// * one element resolve by stylesheet order, which left white text on white.
const PRIMARY_BUTTON = `${BUTTON_BASE} border-greenPrimary-500 bg-greenPrimary-500 text-white hover:bg-greenPrimary-600`;

export default function OrderList() {
  const url = getBaseUrl();
  const { modalData, isOpen, handleOpen, handleClose } =
    useHandleModalState<IOrder>();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<IOrderFilters>({});
  const [isLive, setIsLive] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // * Undefined values are dropped by axios, so only set filters are sent.
  const filterParams = { search: searchTerm || undefined, sortOrder, ...filters };
  const queryParams = { page: currentPage, limit: pageSize, ...filterParams };

  const {
    data: orderData,
    isLoading: isOrderLoading,
    isFetching: isOrderFetching,
    refetch: refetchOrder,
  } = useGetAll<{ data: IOrder[]; meta: IPaginationMeta }>(
    `/order`,
    ["getAllCustomerOrders", JSON.stringify(queryParams)],
    queryParams,
  );

  const {
    data: stats,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useGet<IOrderStats>(`/order/stats`, ["getOrderStats"]);

  const refreshAll = useCallback(() => {
    refetchOrder();
    refetchStats();
  }, [refetchOrder, refetchStats]);

  // --- Real-time: courier webhooks push updates to each order's room ---
  useEffect(() => {
    const socket = io(url);
    socket.on("connect", () => setIsLive(true));
    socket.on("disconnect", () => setIsLive(false));

    (orderData?.data || []).forEach((order) => {
      socket.emit("joinOrderRoom", order.sid);
    });

    socket.on("orderUpdated", () => {
      refreshAll();
    });

    return () => {
      socket.disconnect();
    };
  }, [orderData?.data, refreshAll, url]);

  // * Any filter change starts again from page 1.
  const applyFilters = (patch: Partial<IOrderFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setCurrentPage(1);
  };
  const applySearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);
  const resetFilters = () => {
    setFilters({});
    setSearchTerm("");
    setCurrentPage(1);
  };

  // --- Quick status changes from the row menu ---
  const { mutate: patchOrder } = usePatch<IOrder>(() => refreshAll());
  const { confirm } = useConfirm();
  const changeStatus = async (
    order: IOrder,
    status: OrderStatus,
    options: IConfirmOptions,
  ) => {
    if (await confirm(options)) {
      patchOrder({ endpoint: `order/update-order/${order.id}`, data: { status } });
    }
  };

  const handleDownloadInvoice = async (order: IOrder) => {
    const blob = await pdf(
      <InvoicePDF invoiceData={orderToInvoice(order)} />,
    ).toBlob();
    saveAs(blob, `invoice-${order.orderId}.pdf`);
  };

  // * Exports every order matching the current filters, not just this page.
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = (await axiosInstance.get(`/order`, {
        params: filterParams,
      })) as unknown as { data: IOrder[] };
      const rows = Array.isArray(response?.data) ? response.data : [];
      if (!rows.length) {
        toast.info("No orders to export");
        return;
      }
      saveAs(ordersToCsv(rows), `orders-${dhakaToday()}.csv`);
      toast.success(`Exported ${rows.length} order${rows.length === 1 ? "" : "s"}`);
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const columns = orderColumns({
    onView: (row) => handleOpen("view", row),
    onEdit: (row) => handleOpen("edit", row),
    onDownloadInvoice: handleDownloadInvoice,
    onConfirm: (row) =>
      changeStatus(row, "CONFIRMED", {
        title: `Confirm order ${row.orderId}?`,
        description:
          row.paymentMethod === "CASH_ON_DELIVERY" && !row.trackingId
            ? "It will be sent to Steadfast for pickup right away."
            : undefined,
        confirmLabel: "Confirm order",
        variant: "info",
      }),
    onCancel: (row) =>
      changeStatus(row, "CANCELLED", {
        title: `Cancel order ${row.orderId}?`,
        description:
          "All of its items will be put back into stock. A cancelled order can't be reopened.",
        confirmLabel: "Cancel order",
        cancelLabel: "Keep order",
        variant: "warning",
      }),
  });

  const orders = Array.isArray(orderData?.data) ? orderData.data : [];
  const hasFilters =
    !!searchTerm || Object.values(filters).some((value) => value !== undefined);
  // * A new key remounts the table so its own pagination goes back to page 1.
  const tableKey = JSON.stringify({ filterParams, pageSize });

  return (
    <section className="flex flex-col gap-5">
      {/* Header */}
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-neutralPrimary-700 sm:text-2xl">
              Order
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                isLive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-neutralPrimary-100 text-neutralPrimary-500"
              }`}
              title={
                isLive
                  ? "Courier updates appear here as they happen"
                  : "Live updates are off; use Refresh"
              }
            >
              <span className="relative flex h-1.5 w-1.5">
                {isLive && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75 motion-reduce:animate-none" />
                )}
                <span
                  className={`relative h-1.5 w-1.5 rounded-full ${isLive ? "bg-emerald-500" : "bg-neutralPrimary-400"}`}
                />
              </span>
              {isLive ? "Live" : "Offline"}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-neutralPrimary-500">
            Confirm, track and manage every order from the shop.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSortOrder((s) => (s === "desc" ? "asc" : "desc"))}
            className={HEADER_BUTTON}
            title="Change the order of the list"
          >
            {sortOrder === "desc" ? (
              <ArrowDownWideNarrow size={16} />
            ) : (
              <ArrowUpNarrowWide size={16} />
            )}
            {sortOrder === "desc" ? "Newest first" : "Oldest first"}
          </button>
          <button
            type="button"
            onClick={refreshAll}
            disabled={isOrderFetching}
            className={HEADER_BUTTON}
          >
            <RefreshCw size={16} className={isOrderFetching ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className={PRIMARY_BUTTON}
            title={hasFilters ? "Export the orders matching your filters" : "Export all orders"}
          >
            <Download size={16} className={isExporting ? "animate-bounce" : ""} />
            {isExporting ? "Exporting…" : "Export CSV"}
          </button>
        </div>
      </section>

      <OrderStatsCards
        stats={stats}
        isLoading={isStatsLoading}
        onShowPending={() => applyFilters({ status: "PENDING" })}
        onShowUnpaid={() =>
          applyFilters({ status: undefined, paymentStatus: "PENDING" })
        }
        onShowToday={() =>
          applyFilters({ dateFrom: dhakaToday(), dateTo: dhakaToday() })
        }
      />

      <div className="flex flex-col gap-3">
        <OrderStatusTabs
          value={filters.status}
          stats={stats}
          onChange={(status) => applyFilters({ status })}
        />
        <OrderFilters
          filters={filters}
          search={searchTerm}
          onFiltersChange={applyFilters}
          onSearchChange={applySearch}
          onReset={resetFilters}
        />
      </div>

      <CustomTable<IOrder>
        key={tableKey}
        data={orders}
        columns={columns}
        isLoading={isOrderLoading}
        pageCount={orderData?.meta?.totalPages || 1}
        totalItems={orderData?.meta?.totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        showSearchbar={false}
      />

      <CustomModal2
        open={isOpen("view")}
        onOpenChange={handleClose}
        dialogWidth={VIEW_MODAL_WIDTH}
        dialogHeight="max-h-[min(85vh,calc(100dvh-7rem))] sm:max-h-[min(80vh,calc(100dvh-7rem))] scrollbar-brand"
      >
        <ViewOrder
          data={modalData}
          onClose={handleClose}
          onEdit={(order) => handleOpen("edit", order)}
          onDownloadInvoice={handleDownloadInvoice}
          onChanged={refreshAll}
        />
      </CustomModal2>

      <CustomModalStaticTitleFooter
        open={isOpen("edit")}
        onOpenChange={handleClose}
        dialogWidth={EDIT_MODAL_WIDTH}
        dialogHeight="h-[min(85vh,calc(100dvh-7rem))]"
      >
        <EditPlacedOrder
          data={modalData}
          setOpen={handleClose}
          onClose={handleClose}
          refetch={refreshAll}
          isLoading={isOrderLoading}
        />
      </CustomModalStaticTitleFooter>
    </section>
  );
}
