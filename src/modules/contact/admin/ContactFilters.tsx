"use client";

import React from "react";
import SegmentedFilter, {
  SegmentedOption,
} from "@/components/form/SegmentedFilter";
import {
  ContactPeriodFilter,
  ContactSenderFilter,
  ContactStatusFilter,
  IContactMessageStats,
} from "@/modules/contact/types/contact.types";

export interface IContactFilters {
  status?: ContactStatusFilter;
  sender?: ContactSenderFilter;
  received?: ContactPeriodFilter;
}

export default function ContactFilters({
  filters,
  stats,
  onChange,
}: {
  filters: IContactFilters;
  stats?: IContactMessageStats;
  onChange: (patch: Partial<IContactFilters>) => void;
}) {
  const statusOptions: SegmentedOption<ContactStatusFilter>[] = [
    { value: undefined, label: "All", count: stats?.total },
    {
      value: "pending",
      label: "Awaiting reply",
      count: stats?.pending,
      dot: "bg-warningPrimary-500",
    },
    {
      value: "replied",
      label: "Replied",
      count: stats?.replied,
      dot: "bg-success-500",
    },
  ];

  const senderOptions: SegmentedOption<ContactSenderFilter>[] = [
    { value: undefined, label: "All" },
    { value: "customer", label: "Customers", count: stats?.customers },
    { value: "guest", label: "Guests", count: stats?.guests },
  ];

  const periodOptions: SegmentedOption<ContactPeriodFilter>[] = [
    { value: undefined, label: "Any time" },
    { value: "today", label: "Today", count: stats?.today },
    { value: "week", label: "Last 7 days", count: stats?.last7Days },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <SegmentedFilter
        label="Status"
        options={statusOptions}
        value={filters.status}
        onChange={(status) => onChange({ status })}
      />
      <SegmentedFilter
        label="Sender"
        options={senderOptions}
        value={filters.sender}
        onChange={(sender) => onChange({ sender })}
      />
      <SegmentedFilter
        label="Received"
        options={periodOptions}
        value={filters.received}
        onChange={(received) => onChange({ received })}
      />
    </div>
  );
}
