"use client";

import React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useHandleModalState } from "@/hooks/table/useHandleModalState";
import { useGetAll } from "@/hooks/api/useGet";
import { IMeta } from "@/types";
import CustomModal2 from "@/components/primitives/modal/CustomModal2";
import { Skeleton } from "@/components/ui/skeleton";
import { ISupport } from "@/modules/support/types/support.types";
import { SUPPORT_POLICIES } from "@/modules/support/constants/support.constants";
import { getPolicyHealth } from "@/modules/support/utils/support.utils";
import EditSupport, { ISupportEditTarget } from "./EditSupport";
import SupportPolicyCard from "./SupportPolicyCard";

export default function Support() {
  const { modalData, isOpen, handleOpen, handleClose } =
    useHandleModalState<ISupportEditTarget>();

  // * There is one record per policy type, so a single page holds them all.
  const {
    data: supportData,
    isLoading: isSupportLoading,
    refetch: refetchSupport,
  } = useGetAll<{ data: ISupport[]; meta: IMeta }>(
    `/support/all-support`,
    ["getAllSupport", "admin"],
    { page: 1, limit: SUPPORT_POLICIES.length * 5 },
  );

  const records = supportData?.data ?? [];
  const policies = SUPPORT_POLICIES.map((meta) => {
    const record = records.find((r) => r.type === meta.type);
    return { meta, record, health: getPolicyHealth(meta, record, records) };
  });
  const needsAttention = policies.filter((p) => p.health.level !== "ok");
  const liveCount = policies.length - needsAttention.length;

  return (
    <section className="flex flex-col gap-6">
      {/* --- Page header --- */}
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-neutralPrimary-700 sm:text-2xl">
          Store Policies
        </h1>
        <p className="max-w-3xl text-sm text-neutral-500">
          These pages are linked from the storefront footer. Customers read them
          before buying, and they set expectations for delivery, returns and data
          handling, so keep them accurate and up to date.
        </p>
      </header>

      {/* --- Overview banner --- */}
      {!isSupportLoading &&
        (needsAttention.length > 0 ? (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>
              <span className="font-semibold">
                {needsAttention.length} of {policies.length} policies need
                attention:
              </span>{" "}
              {needsAttention.map((p) => p.meta.title).join(", ")}.{" "}
              {liveCount > 0 && `${liveCount} ${liveCount === 1 ? "is" : "are"} in good shape.`}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 className="size-4 shrink-0" aria-hidden />
            <p className="font-medium">
              All {policies.length} policies are live and complete.
            </p>
          </div>
        ))}

      {/* --- Policy cards --- */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {isSupportLoading
          ? SUPPORT_POLICIES.map((meta) => (
              <Skeleton key={meta.type} className="h-[300px] w-full rounded-xl" />
            ))
          : policies.map(({ meta, record, health }) => (
              <SupportPolicyCard
                key={meta.type}
                meta={meta}
                record={record}
                health={health}
                onEdit={() => handleOpen("edit", { type: meta.type, record })}
              />
            ))}
      </div>

      <CustomModal2
        open={isOpen("edit")}
        onOpenChange={handleClose}
        dialogWidth="w-[calc(100vw-1.5rem)] sm:w-[90vw] lg:w-[80vw] xl:w-[70vw] max-w-5xl"
        dialogHeight="max-h-[90vh] gap-0"
      >
        <EditSupport
          data={modalData}
          setOpen={handleClose}
          onClose={handleClose}
          refetch={refetchSupport}
        />
      </CustomModal2>
    </section>
  );
}
