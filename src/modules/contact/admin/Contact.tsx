"use client";

import React, { useCallback, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useGet, useGetAll } from "@/hooks/api/useGet";
import { usePatch } from "@/hooks/api/usePatch";
import { IPaginationMeta } from "@/types";
import CustomTable from "@/components/data-display/table/CustomTable";
import CustomModal2 from "@/components/primitives/modal/CustomModal2";
import {
  IContactMessage,
  IContactMessageStats,
} from "@/modules/contact/types/contact.types";
import ContactFilters, { IContactFilters } from "./ContactFilters";
import ViewMessage from "./ViewMessage";
import { getMessageColumns } from "./contact.columns";

// The dialog has no max-width of its own, so this steps from near full-width
// on phones down to a comfortable reading width on large screens.
const VIEW_MODAL_WIDTH =
  "w-[calc(100vw-1.5rem)] sm:w-[90vw] md:w-[80vw] lg:w-[65vw] xl:w-[55vw] max-w-4xl";

export default function Contact() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState("");
  // An inbox reads newest first.
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<IContactFilters>({});

  const [selected, setSelected] = useState<IContactMessage | undefined>();
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const queryParams = {
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined,
    sortOrder,
    status: filters.status,
    sender: filters.sender,
    received: filters.received,
  };

  const {
    data: messageData,
    isLoading: isMessageLoading,
    isFetching: isMessageFetching,
    refetch: refetchMessages,
  } = useGetAll<{ data: IContactMessage[]; meta: IPaginationMeta }>(
    `/contact-messages`,
    [
      "getAllMessages",
      String(currentPage),
      String(pageSize),
      searchTerm,
      sortOrder,
      filters.status ?? "",
      filters.sender ?? "",
      filters.received ?? "",
    ],
    queryParams,
  );

  const { data: stats, refetch: refetchStats } = useGet<IContactMessageStats>(
    "/contact-messages/stats",
    ["getContactMessageStats"],
  );

  const refreshAll = useCallback(() => {
    refetchMessages();
    refetchStats();
  }, [refetchMessages, refetchStats]);

  const { mutate: patchMessage } = usePatch<IContactMessage>();

  const handleToggleReplied = (message: IContactMessage) => {
    setUpdatingId(message.id);
    patchMessage(
      {
        endpoint: `/contact-messages/${message.id}`,
        data: { replied: !message.replied },
      },
      {
        onSettled: () => setUpdatingId(null),
        onSuccess: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) refreshAll();
        },
      },
    );
  };

  const handleView = (message: IContactMessage) => {
    setSelected(message);
    setIsViewOpen(true);
  };

  const columns = getMessageColumns(handleView, handleToggleReplied, updatingId);
  const messages = Array.isArray(messageData?.data) ? messageData.data : [];
  const replyRate = stats?.total
    ? Math.round((stats.replied / stats.total) * 100)
    : 0;

  return (
    <section className="flex flex-col gap-5 sm:gap-6">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-neutralPrimary-700 sm:text-2xl">
              Messages
            </h1>
            {!!stats?.pending && (
              <span className="rounded-full bg-warningPrimary-50 px-2 py-0.5 text-xs font-semibold text-warningPrimary-700 ring-1 ring-inset ring-warningPrimary-600/20">
                {stats.pending} pending
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-neutralPrimary-500">
            Questions sent from the Contact Us page. Reply by phone or
            WhatsApp, then mark them as replied.
          </p>
          {!!stats?.total && (
            <p className="mt-1 text-xs text-neutralPrimary-400">
              {replyRate}% reply rate
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={refreshAll}
          disabled={isMessageFetching}
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-neutralPrimary-200 bg-white px-3.5 py-2 text-sm font-medium text-neutralPrimary-600 shadow-sm transition-colors hover:border-greenPrimary-300 hover:bg-greenPrimary-950 hover:text-greenPrimary-700 disabled:opacity-60"
        >
          <RefreshCw
            size={15}
            className={isMessageFetching ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </header>

      <CustomTable<IContactMessage>
        data={messages}
        columns={columns}
        isLoading={isMessageLoading}
        pageCount={messageData?.meta?.totalPages || 1}
        totalItems={messageData?.meta?.totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onSearchChange={setSearchTerm}
        toolbar={
          <ContactFilters
            filters={filters}
            stats={stats}
            onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
          />
        }
        pageResetKey={`${filters.status}|${filters.sender}|${filters.received}|${searchTerm}`}
        onSortChange={(_field, order) => setSortOrder(order)}
        searchPlaceholder="Search name, phone or message..."
      />

      <CustomModal2
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        dialogWidth={VIEW_MODAL_WIDTH}
        // The fixed site header sits above the dialog layer, so the height
        // leaves room for it; 90vh let the top of the dialog slide under it.
        dialogHeight="max-h-[calc(100dvh-8rem)] scrollbar-brand"
      >
        <ViewMessage
          key={selected?.id}
          data={selected}
          onClose={() => setIsViewOpen(false)}
          refetch={refreshAll}
        />
      </CustomModal2>
    </section>
  );
}
