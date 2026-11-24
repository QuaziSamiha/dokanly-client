"use client";

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { LuBadgeCheck, LuLock, LuMailWarning } from "react-icons/lu";
import CustomTooltip from "@/components/primitives/CustomTooltip";
import { IUser } from "@/modules/user/types/user.types";
import {
  initialsOf,
  isSignInLocked,
  timeAgo,
} from "@/modules/user/utils/user.utils";

const BADGE_BASE =
  "inline-flex items-center gap-1.5 whitespace-nowrap font-medium text-xs w-fit rounded-full px-2.5 py-1 ring-1 ring-inset";

const USER_STATUS: Record<
  IUser["status"],
  { label: string; badge: string; dot: string }
> = {
  ACTIVE: {
    label: "Active",
    badge: "text-emerald-700 bg-emerald-50 ring-emerald-600/20",
    dot: "bg-emerald-500",
  },
  PENDING_VERIFICATION: {
    label: "Pending verification",
    badge: "text-amber-700 bg-amber-50 ring-amber-600/20",
    dot: "bg-amber-500",
  },
  INACTIVE: {
    label: "Inactive",
    badge: "text-rose-700 bg-rose-50 ring-rose-600/20",
    dot: "bg-rose-500",
  },
  SUSPENDED: {
    label: "Suspended",
    badge: "text-rose-700 bg-rose-50 ring-rose-600/20",
    dot: "bg-rose-500",
  },
  ARCHIVED: {
    label: "Archived",
    badge: "text-neutralPrimary-600 bg-neutralPrimary-50 ring-neutralPrimary-500/20",
    dot: "bg-neutralPrimary-400",
  },
};

const USER_ROLE: Record<IUser["role"], { label: string; badge: string }> = {
  ADMIN: {
    label: "Admin",
    badge: "text-blue-700 bg-blue-50 ring-blue-600/20",
  },
  EMPLOYEE: {
    label: "Employee",
    badge: "text-teal-700 bg-teal-50 ring-teal-600/20",
  },
  CUSTOMER: {
    label: "Customer",
    badge: "text-neutralPrimary-700 bg-neutralPrimary-50 ring-neutralPrimary-500/20",
  },
};

const PROVIDER_LABELS: Record<IUser["authProvider"], string> = {
  EMAIL: "Email",
  GOOGLE: "Google",
  FACEBOOK: "Facebook",
  APPLE: "Apple",
};

const formatDay = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { dateStyle: "medium" });

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

/** Profile photo, or the user's initials when there is none or it fails to load. */
function UserAvatar({ user }: { user: IUser }) {
  const [failed, setFailed] = useState(false);

  if (!user.profileImageUrl || failed) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-greenPrimary-500 to-greenPrimary-700 text-sm font-semibold text-white">
        {initialsOf(user.name)}
      </div>
    );
  }
  return (
    // The URL comes from the API host, which next/image's remotePatterns may not list.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={user.profileImageUrl}
      alt={user.name}
      onError={() => setFailed(true)}
      className="h-10 w-10 shrink-0 rounded-full border border-neutralPrimary-200 object-cover"
    />
  );
}

export const getUserColumns = (
  handleView: (data: IUser) => void,
  handleEdit: (data: IUser) => void,
): ColumnDef<IUser>[] => [
  {
    accessorKey: "name",
    header: "User",
    enableSorting: false,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex min-w-[240px] items-center gap-3">
          <UserAvatar user={user} />
          <div className="flex min-w-0 flex-col">
            <span className="flex items-center gap-1">
              <span
                className="max-w-[240px] truncate text-sm font-medium text-neutralPrimary-800"
                title={user.name}
              >
                {user.name}
              </span>
              {user.emailVerified ? (
                <LuBadgeCheck
                  className="h-4 w-4 shrink-0 text-blue-600"
                  title="Email verified"
                />
              ) : (
                <LuMailWarning
                  className="h-4 w-4 shrink-0 text-amber-500"
                  title="Email not verified"
                />
              )}
            </span>
            <span
              className="max-w-[260px] truncate text-xs text-neutralPrimary-500"
              title={user.email}
            >
              {user.email}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Contact",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-col whitespace-nowrap">
        <span className="text-sm tabular-nums text-neutralPrimary-700">
          {row.original.phone || "—"}
        </span>
        <span className="text-xs text-neutralPrimary-500">
          via {PROVIDER_LABELS[row.original.authProvider] ?? row.original.authProvider}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    enableSorting: false,
    cell: ({ row }) => {
      const role = USER_ROLE[row.original.role];
      if (!role) return "—";
      return <span className={`${BADGE_BASE} ${role.badge}`}>{role.label}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => {
      const status = USER_STATUS[row.original.status];
      const locked = isSignInLocked(row.original);
      return (
        <div className="flex flex-col gap-1">
          {status ? (
            <span className={`${BADGE_BASE} ${status.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          ) : (
            "—"
          )}
          {locked && (
            <span
              className={`${BADGE_BASE} text-rose-700 bg-rose-50 ring-rose-600/20`}
              title={`Sign-in locked until ${formatDateTime(row.original.lockedUntil!)}`}
            >
              <LuLock className="h-3 w-3" />
              Locked
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "lastLoginAt",
    header: "Last Sign-in",
    enableSorting: false,
    cell: ({ row }) => {
      const { lastLoginAt } = row.original;
      return lastLoginAt ? (
        <div className="flex flex-col whitespace-nowrap">
          <span className="text-sm text-neutralPrimary-700">
            {timeAgo(lastLoginAt)}
          </span>
          <span className="text-xs text-neutralPrimary-500">
            {formatDateTime(lastLoginAt)}
          </span>
        </div>
      ) : (
        <span className="text-sm text-neutralPrimary-400">Never</span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex flex-col whitespace-nowrap">
        <span className="text-sm text-neutralPrimary-700">
          {formatDay(row.original.createdAt)}
        </span>
        <span className="text-xs text-neutralPrimary-500">
          {timeAgo(row.original.createdAt)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "actions",
    header: "Action",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => handleView(row.original)}>
          <CustomTooltip action="view" content="View" />
        </button>
        <button type="button" onClick={() => handleEdit(row.original)}>
          <CustomTooltip action="edit" content="Edit" />
        </button>
      </div>
    ),
  },
];
