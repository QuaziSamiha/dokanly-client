"use client";

import React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  AlertTriangle,
  CalendarClock,
  FileText,
  History,
  Info,
  Receipt,
  Truck,
} from "lucide-react";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import SubmitButton from "@/components/form/SubmitButton";
import { usePatch } from "@/hooks/api/usePatch";
import {
  UpdateFreeDeliverySchema,
  UpdateFreeDeliveryType,
} from "@/modules/free-delivery/schemas/free-delivery.schema";
import { IFreeDelivery } from "@/modules/free-delivery/types/free-delivery.types";
import { IModal } from "@/types";
import {
  STATUS_STYLES,
  StatusPill,
  formatAmount,
  formatDateTime,
} from "./free-delivery.columns";

const STATUS_OPTIONS = [
  { id: "ACTIVE", name: "Active — offer it at checkout" },
  { id: "INACTIVE", name: "Inactive — turn it off" },
];

// Staggered fade/slide-in for the modal's blocks (tw-animate-css).
const ENTER =
  "animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out fill-mode-backwards motion-reduce:animate-none";
const enterDelay = (ms: number): React.CSSProperties => ({
  animationDelay: `${ms}ms`,
});

function StatTile({
  icon,
  label,
  value,
  hint,
  className,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: string;
  className: string;
  delay?: number;
}) {
  return (
    <div
      style={enterDelay(delay)}
      className={`min-w-0 rounded-xl p-3 sm:p-4 ${ENTER} ${className}`}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide opacity-80 sm:text-xs">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1.5 truncate text-lg font-bold sm:text-xl">{value}</p>
      {hint && (
        <p className="mt-0.5 line-clamp-2 text-[11px] opacity-70 sm:text-xs">
          {hint}
        </p>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  aside,
  children,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <section
      style={enterDelay(delay)}
      className={`${ENTER} rounded-xl border border-neutralPrimary-100 bg-white p-3 sm:p-4`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-neutralPrimary-700">
          <span className="text-greenPrimary-500">{icon}</span>
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

export default function EditFreeDelivery({
  setOpen,
  data,
  refetch,
  isLoading,
}: IModal) {
  const rowData = data as IFreeDelivery | undefined;

  const {
    control,
    handleSubmit,
    formState: { isDirty, dirtyFields },
  } = useForm({
    resolver: zodResolver(UpdateFreeDeliverySchema),
    defaultValues: { status: rowData?.status },
  });

  const selectedStatus = useWatch({ control, name: "status" });
  const willActivate =
    rowData?.status !== "ACTIVE" && selectedStatus === "ACTIVE";
  const willDeactivate =
    rowData?.status === "ACTIVE" && selectedStatus === "INACTIVE";

  const { mutate: updateFreeDelivery, isPending } = usePatch(
    (response) => {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        setOpen?.(false);
        refetch?.();
      }
    },
    (error) => {
      console.error("Update failed:", error);
    },
  );

  if (!rowData) {
    return (
      <div className="flex flex-col items-center gap-2 p-10 text-center text-neutralPrimary-400">
        <Truck size={32} />
        No free delivery details available.
      </div>
    );
  }

  const history = rowData.changeHistory ?? [];

  const onSubmit = (formData: UpdateFreeDeliveryType) => {
    // Only the status can change; the server ignores a status that is already set.
    if (!isDirty || !dirtyFields.status || formData.status === rowData.status) {
      toast.info("No changes detected!");
      setOpen?.(false);
      return;
    }

    updateFreeDelivery({
      endpoint: `/free-delivery-settings/update-free-delivery/${rowData.id}`,
      data: { status: formData.status },
    });
  };

  return (
    <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
      {/* Hero */}
      <div
        className={`${ENTER} relative overflow-hidden rounded-2xl bg-gradient-to-br from-greenPrimary-950 via-white to-yellowSecondary-100 p-4 ring-1 ring-greenPrimary-100 sm:p-5`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-greenPrimary-500 to-greenPrimary-700 text-white shadow-md sm:h-16 sm:w-16">
            <Truck size={28} />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutralPrimary-400">
              Edit Free Delivery Setting
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-neutralPrimary-800 sm:text-2xl">
                Orders from {formatAmount(rowData.minOrderAmount)}
              </h2>
              <StatusPill status={rowData.status} />
            </div>
            <p className="text-sm text-neutralPrimary-500">
              {rowData.status === "ACTIVE"
                ? "Customers whose subtotal reaches this amount get free delivery at checkout."
                : "Not offered at checkout. Activate it to make it the current offer."}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
        <StatTile
          icon={<Receipt size={14} />}
          label="Minimum Order"
          value={formatAmount(rowData.minOrderAmount)}
          hint="Subtotal needed for free delivery"
          className="bg-greenPrimary-950 text-greenPrimary-700"
          delay={80}
        />
        <StatTile
          icon={<History size={14} />}
          label="Status Changes"
          value={history.length}
          hint={
            history.length
              ? `Last on ${formatDateTime(history[history.length - 1].updatedAt)}`
              : "Never changed"
          }
          className="bg-blueSecondary-50 text-blueSecondary-600"
          delay={140}
        />
        <StatTile
          icon={<CalendarClock size={14} />}
          label="Created"
          value={new Date(rowData.createdAt).toLocaleDateString(undefined, {
            dateStyle: "medium",
          })}
          hint={
            rowData.createdByName
              ? `by ${rowData.createdByName}${rowData.createdByRole ? ` (${rowData.createdByRole.toLowerCase()})` : ""}`
              : "Creator no longer exists"
          }
          className="col-span-2 bg-purpleSecondary-100 text-purpleSecondary-500 md:col-span-1"
          delay={200}
        />
      </div>

      {/* Description */}
      <Section delay={260} icon={<FileText size={16} />} title="Description">
        {rowData.description ? (
          <p className="whitespace-pre-line break-words text-sm leading-relaxed text-neutralPrimary-600">
            {rowData.description}
          </p>
        ) : (
          <p className="text-sm italic text-neutralPrimary-400">
            No description added.
          </p>
        )}
      </Section>

      {/* Status form */}
      <Section delay={320} icon={<Truck size={16} />} title="Status">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <SingleSelectSearch
            labelName="Status"
            name="status"
            control={control}
            options={STATUS_OPTIONS}
            isLoading={isLoading}
            isRequired
          />

          {willActivate && (
            <div className="flex items-start gap-3 rounded-xl border border-warningPrimary-200 bg-warningPrimary-100 p-3 text-sm text-warningPrimary-600">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <p>
                <span className="font-semibold">Only one offer can be active.</span>{" "}
                Activating this one turns off the free delivery offer that is
                active now.
              </p>
            </div>
          )}
          {willDeactivate && (
            <div className="flex items-start gap-3 rounded-xl border border-warningPrimary-200 bg-warningPrimary-100 p-3 text-sm text-warningPrimary-600">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <p>
                <span className="font-semibold">Free delivery will be off.</span>{" "}
                Checkout won&apos;t offer free delivery until another setting is
                activated.
              </p>
            </div>
          )}
          <p className="flex items-start gap-2 text-xs text-neutralPrimary-400">
            <Info size={14} className="mt-0.5 shrink-0" />
            The amount and description can&apos;t be edited, so orders keep the
            terms they were placed under. To change them, add a new setting.
          </p>

          {/* Stacked full-width on phones (primary action on top), inline on sm+ */}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-end sm:justify-end">
            <button
              type="button"
              onClick={() => setOpen?.(false)}
              className="h-11 w-full sm:w-auto border border-neutral-300 font-semibold text-sm md:text-base text-neutral-600 rounded-lg cursor-pointer px-5 hover:bg-neutral-100 transition-colors duration-200"
            >
              Cancel
            </button>
            <SubmitButton
              submitTitle="Save Changes"
              isPending={isPending}
              buttonWidth="w-full sm:w-fit"
            />
          </div>
        </form>
      </Section>

      {/* Change history, newest first */}
      <Section
        delay={380}
        icon={<History size={16} />}
        title="Change History"
        aside={
          history.length > 0 && (
            <span className="text-[11px] text-neutralPrimary-400">
              {history.length} change{history.length === 1 ? "" : "s"}
            </span>
          )
        }
      >
        {history.length > 0 ? (
          <ol className="relative ml-2 space-y-4 border-l-2 border-neutralPrimary-100">
            {[...history].reverse().map((item, index) => {
              const dot = (STATUS_STYLES[item.status] ?? STATUS_STYLES.INACTIVE)
                .dot;
              return (
                <li
                  key={`${item.updatedAt}-${index}`}
                  style={enterDelay(440 + index * 60)}
                  className={`${ENTER} relative pl-5`}
                >
                  <span
                    className={`absolute -left-[7px] top-1.5 h-3 w-3 rounded-full ring-4 ring-white ${dot}`}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-neutralPrimary-600">
                      Changed to{" "}
                      <StatusPill status={item.status} />
                    </p>
                    <span className="text-xs text-neutralPrimary-400">
                      {formatDateTime(item.updatedAt)}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blueSecondary-100 text-[11px] font-semibold text-blueSecondary-600">
                      {item.updatedByName?.charAt(0).toUpperCase() ?? "?"}
                    </span>
                    <p className="text-xs text-neutralPrimary-500">
                      by{" "}
                      <span className="font-semibold text-neutralPrimary-700">
                        {item.updatedByName}
                      </span>{" "}
                      ({item.updatedByRole?.toLowerCase()})
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="text-sm italic text-neutralPrimary-400">
            The status has not been changed since this setting was created.
          </p>
        )}
      </Section>
    </div>
  );
}
