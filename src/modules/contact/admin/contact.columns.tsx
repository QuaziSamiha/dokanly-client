import type { ReactNode } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Check, Eye, Phone, RotateCcw, UserRound } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IContactMessage } from "@/modules/contact/types/contact.types";
import {
  avatarColor,
  fullDate,
  initials,
  senderName,
  telLink,
  timeAgo,
} from "./contact.utils";

export function StatusPill({ replied }: { replied: boolean }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
        replied
          ? "bg-success-50 text-success-700 ring-success-600/20"
          : "bg-warningPrimary-50 text-warningPrimary-700 ring-warningPrimary-600/20"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          replied ? "bg-success-500" : "bg-warningPrimary-500"
        }`}
      />
      {replied ? "Replied" : "Pending"}
    </span>
  );
}

export function SenderBadge({ isCustomer }: { isCustomer: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        isCustomer
          ? "bg-blueSecondary-50 text-blueSecondary-600"
          : "bg-neutralPrimary-100 text-neutralPrimary-500"
      }`}
    >
      {isCustomer && <UserRound size={10} />}
      {isCustomer ? "Customer" : "Guest"}
    </span>
  );
}

function IconAction({
  label,
  onClick,
  className,
  children,
  disabled,
}: {
  label: string;
  onClick: () => void;
  className: string;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={onClick}
          disabled={disabled}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export const getMessageColumns = (
  handleView: (data: IContactMessage) => void,
  handleToggleReplied: (data: IContactMessage) => void,
  updatingId?: number | null,
): ColumnDef<IContactMessage>[] => [
  {
    accessorKey: "sender",
    header: "Sender",
    enableSorting: false,
    cell: ({ row }) => {
      const m = row.original;
      const name = senderName(m);
      return (
        <button
          type="button"
          onClick={() => handleView(m)}
          className="flex min-w-[11rem] max-w-[16rem] items-start gap-3 text-left sm:max-w-none"
        >
          <span className="relative shrink-0">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${avatarColor(
                name,
              )}`}
            >
              {initials(m)}
            </span>
            {!m.replied && (
              <span
                title="Awaiting reply"
                className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-warningPrimary-500 ring-2 ring-white"
              />
            )}
          </span>
          <span className="min-w-0 space-y-0.5">
            <span
              className={`block truncate capitalize text-neutralPrimary-800 ${
                m.replied ? "font-medium" : "font-semibold"
              }`}
            >
              {name}
            </span>
            <SenderBadge isCustomer={!!m.userId} />
            {/* Phones: phone, preview and time live here; their columns are hidden. */}
            <span className="block truncate text-xs text-neutralPrimary-500 md:hidden">
              {m.phone}
            </span>
            <span className="line-clamp-1 text-xs text-neutralPrimary-400 sm:hidden">
              {m.message}
            </span>
            <span className="block text-[11px] text-neutralPrimary-400 sm:hidden">
              {timeAgo(m.createdAt)}
            </span>
          </span>
        </button>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    enableSorting: false,
    meta: { className: "hidden md:table-cell" },
    cell: ({ row }) => (
      <a
        href={telLink(row.original.phone)}
        className="inline-flex items-center gap-1.5 whitespace-nowrap text-neutralPrimary-600 transition-colors hover:text-greenPrimary-600"
      >
        <Phone size={13} className="shrink-0 text-neutralPrimary-400" />
        {row.original.phone}
      </a>
    ),
  },
  {
    accessorKey: "message",
    header: "Message",
    enableSorting: false,
    meta: { className: "hidden sm:table-cell" },
    cell: ({ row }) => (
      <p
        className={`line-clamp-2 min-w-[12rem] max-w-md break-words ${
          row.original.replied ? "text-neutralPrimary-500" : "text-neutralPrimary-700"
        }`}
      >
        {row.original.message}
      </p>
    ),
  },
  {
    // Sorted by the server on createdAt; the id only labels the column.
    accessorKey: "createdAt",
    header: "Received",
    enableSorting: true,
    meta: { className: "hidden sm:table-cell" },
    cell: ({ row }) => (
      <div className="whitespace-nowrap" title={fullDate(row.original.createdAt)}>
        <p className="text-neutralPrimary-700">{timeAgo(row.original.createdAt)}</p>
        <p className="text-xs text-neutralPrimary-400">
          {fullDate(row.original.createdAt)}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "replied",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => <StatusPill replied={row.original.replied} />,
  },
  {
    accessorKey: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => {
      const m = row.original;
      return (
        <div className="flex items-center gap-1.5">
          <IconAction
            label="View details"
            onClick={() => handleView(m)}
            className="border-neutralPrimary-200 text-neutralPrimary-500 hover:border-greenPrimary-300 hover:bg-greenPrimary-950 hover:text-greenPrimary-700"
          >
            <Eye size={16} />
          </IconAction>
          <IconAction
            label={m.replied ? "Mark as pending" : "Mark as replied"}
            onClick={() => handleToggleReplied(m)}
            disabled={updatingId === m.id}
            className={
              m.replied
                ? "border-neutralPrimary-200 text-neutralPrimary-500 hover:border-warningPrimary-300 hover:bg-warningPrimary-50 hover:text-warningPrimary-700"
                : "border-success-200 text-success-600 hover:bg-success-50"
            }
          >
            {m.replied ? <RotateCcw size={15} /> : <Check size={16} />}
          </IconAction>
        </div>
      );
    },
  },
];
