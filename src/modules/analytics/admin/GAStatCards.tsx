"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { IGASummary } from "@/modules/analytics/types/analytics.types";
import { MdPeople, MdPersonAdd, MdTouchApp, MdWebAsset } from "react-icons/md";

interface Props {
  summary?: IGASummary;
  isLoading: boolean;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

const CARDS = (summary: IGASummary) => [
  {
    label: "Active Users",
    value: summary.activeUsers.toLocaleString(),
    icon: <MdPeople size={22} />,
    color: "text-greenPrimary-600 bg-greenPrimary-50",
  },
  {
    label: "New Users",
    value: summary.newUsers.toLocaleString(),
    icon: <MdPersonAdd size={22} />,
    color: "text-blue-600 bg-blue-50",
  },
  {
    label: "Sessions",
    value: summary.sessions.toLocaleString(),
    icon: <MdTouchApp size={22} />,
    color: "text-purple-600 bg-purple-50",
  },
  {
    label: "Page Views",
    value: summary.pageViews.toLocaleString(),
    icon: <MdWebAsset size={22} />,
    color: "text-orange-600 bg-orange-50",
  },
  {
    label: "Bounce Rate",
    value: `${summary.bounceRate}%`,
    icon: null,
    color: "text-red-500 bg-red-50",
  },
  {
    label: "Avg. Session",
    value: formatDuration(summary.avgSessionDuration),
    icon: null,
    color: "text-teal-600 bg-teal-50",
  },
];

export default function GAStatCards({ summary, isLoading }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {isLoading || !summary
        ? Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))
        : CARDS(summary).map((card) => (
            <div
              key={card.label}
              className="rounded-lg shadow-dashboardCard bg-white p-4 flex flex-col gap-2"
            >
              {card.icon && (
                <span className={`w-9 h-9 rounded-md flex items-center justify-center ${card.color}`}>
                  {card.icon}
                </span>
              )}
              <p className="text-xl font-semibold text-neutralPrimary-800 leading-none">
                {card.value}
              </p>
              <p className="text-xs text-neutralPrimary-500">{card.label}</p>
            </div>
          ))}
    </div>
  );
}
