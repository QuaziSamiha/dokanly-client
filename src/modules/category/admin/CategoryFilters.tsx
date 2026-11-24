"use client";

import React from "react";
import SegmentedFilter, {
  SegmentedOption,
} from "@/components/form/SegmentedFilter";
import { CategoryStatus } from "@/modules/category/types/category.types";

export type CategoryLevel = "root" | "sub";

export interface ICategoryFilters {
  status?: CategoryStatus;
  level?: CategoryLevel;
}

const STATUS_OPTIONS: SegmentedOption<CategoryStatus>[] = [
  { value: undefined, label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const LEVEL_OPTIONS: SegmentedOption<CategoryLevel>[] = [
  { value: undefined, label: "All" },
  { value: "root", label: "Root" },
  { value: "sub", label: "Subcategory" },
];

export default function CategoryFilters({
  filters,
  onChange,
}: {
  filters: ICategoryFilters;
  onChange: (patch: Partial<ICategoryFilters>) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <SegmentedFilter
        label="Status"
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={(status) => onChange({ status })}
      />
      <SegmentedFilter
        label="Level"
        options={LEVEL_OPTIONS}
        value={filters.level}
        onChange={(level) => onChange({ level })}
      />
    </div>
  );
}
