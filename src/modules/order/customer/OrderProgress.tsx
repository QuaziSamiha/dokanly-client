import { cn } from "@/lib/utils";
import {
  IOrderTimelineEntry,
  OrderStatus,
} from "@/modules/order/types/order.types";
import {
  CUSTOMER_STATUS_COPY,
  firstReachedAt,
  formatOrderDate,
  ORDER_PROGRESS_STEPS,
  progressIndex,
} from "@/modules/order/utils/customer-order.utils";
import { Check } from "lucide-react";

/**
 * Placed → Confirmed → Packed → Shipped → Delivered. Horizontal on wide
 * screens, vertical on phones. Reached steps are ticked with their date; the
 * step after them is marked "Up next".
 */
export default function OrderProgress({
  status,
  timeline,
  createdAt,
}: {
  status: OrderStatus;
  timeline: IOrderTimelineEntry[];
  createdAt: string;
}) {
  const current = progressIndex(status);
  const reached = firstReachedAt(timeline);
  //* ==== OLD ORDERS MAY HAVE NO "PENDING" HISTORY ROW; THE ORDER DATE IS WHEN IT WAS PLACED ====
  reached.PENDING ??= createdAt;

  return (
    <ol
      aria-label="Order progress"
      className="flex flex-col sm:grid sm:grid-cols-5 sm:gap-2"
    >
      {ORDER_PROGRESS_STEPS.map((step, i) => {
        const done = i <= current;
        const isNext = i === current + 1;
        const Icon = CUSTOMER_STATUS_COPY[step.status].icon;
        const at = reached[step.status];

        return (
          <li
            key={step.status}
            aria-current={i === current ? "step" : undefined}
            className="relative flex gap-3 pb-6 last:pb-0 sm:flex-col sm:items-center sm:gap-2 sm:pb-0 sm:text-center"
          >
            {/* ==== CONNECTOR TO THE NEXT STEP ==== */}
            {i < ORDER_PROGRESS_STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-[19px] top-10 bottom-0 w-0.5 sm:left-[calc(50%+24px)] sm:right-[calc(-50%+24px)] sm:top-5 sm:bottom-auto sm:h-0.5 sm:w-auto",
                  i < current ? "bg-greenPrimary-500" : "bg-neutralPrimary-200",
                )}
              />
            )}

            <span
              className={cn(
                "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                done && "border-greenPrimary-500 bg-greenPrimary-500 text-white",
                isNext && "border-greenPrimary-400 bg-white text-greenPrimary-600 ring-4 ring-greenPrimary-500/15",
                !done && !isNext && "border-neutralPrimary-200 bg-white text-neutralPrimary-300",
              )}
            >
              {done ? <Check className="h-5 w-5" /> : <Icon className="h-[18px] w-[18px]" />}
            </span>

            <span className="flex flex-col pt-1.5 sm:pt-0">
              <span
                className={cn(
                  "text-sm font-semibold",
                  done || isNext ? "text-neutralPrimary-800" : "text-neutralPrimary-400",
                )}
              >
                {step.label}
              </span>
              <span
                className={cn(
                  "text-xs",
                  isNext ? "font-medium text-greenPrimary-600" : "text-neutralPrimary-500",
                )}
              >
                {done ? (at ? formatOrderDate(at) : "Done") : isNext ? "Up next" : " "}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
