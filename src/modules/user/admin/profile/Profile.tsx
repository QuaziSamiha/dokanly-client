"use client";

import CustomModal2 from "@/components/primitives/modal/CustomModal2";
import ProfileAvatar from "@/components/primitives/ProfileAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/modules/user/hooks/useCurrentUser";
import { IUser } from "@/modules/user/types/user.types";
import { formatDate } from "@/lib/utils/date.utils";
import { formatEnumString } from "@/lib/utils/string.utils";
import {
  BadgeCheck,
  CalendarDays,
  Camera,
  ChevronRight,
  Circle,
  CircleAlert,
  CircleCheck,
  Clock,
  History,
  KeyRound,
  LogIn,
  LucideIcon,
  Mail,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import React, { useState } from "react";
import ChangePassword from "./ChangePassword";
import EditPersonalInfo from "./EditPersonalInfo";
import EditProfilePhoto from "./EditProfilePhoto";

// ============ BADGE STYLES (SAME PALETTE AS THE USER LIST) ============
const roleBadgeStyle = (role?: string) => {
  switch (role) {
    case "ADMIN":
      return "text-blueSecondary-700 bg-blueSecondary-100";
    case "EMPLOYEE":
      return "text-teal-700 bg-teal-100";
    case "CUSTOMER":
      return "text-gray-700 bg-gray-100";
    default:
      return "text-blueSecondary-700 bg-blueSecondary-100";
  }
};

const statusBadgeStyle = (status?: string) => {
  switch (status) {
    case "ACTIVE":
      return {
        badge: "text-success-700 bg-success-100",
        dot: "bg-success-500",
      };
    case "INACTIVE":
      return {
        badge: "text-destructive-700 bg-destructive-100",
        dot: "bg-destructive-500",
      };
    case "PENDING_VERIFICATION":
      return { badge: "text-yellow-700 bg-yellow-100", dot: "bg-yellow-500" };
    default:
      return {
        badge: "text-blueSecondary-700 bg-blueSecondary-100",
        dot: "bg-blueSecondary-500",
      };
  }
};

// ============ "3 HOURS AGO" STYLE TIMESTAMPS FOR THE ACTIVITY STRIP ============
const relativeTime = (date?: string | null) => {
  if (!date) return undefined;
  const diffSeconds = (new Date(date).getTime() - Date.now()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, seconds] of units) {
    if (Math.abs(diffSeconds) >= seconds) {
      return rtf.format(Math.round(diffSeconds / seconds), unit);
    }
  }
  return "just now";
};

// ============ SMALL PRESENTATIONAL HELPERS ============
function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`bg-white border border-neutralPrimary-300/70 rounded-2xl shadow-[0_1px_3px_rgba(16,24,40,0.06)] ${className}`}
    >
      {children}
    </section>
  );
}

function CardHeader({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 rounded-xl bg-greenPrimary-950 text-greenPrimary-600 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </span>
        <div className="flex flex-col">
          <p className="text-base font-semibold text-neutralPrimary-800">
            {title}
          </p>
          {description && (
            <p className="text-sm text-neutralPrimary-500">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

function OutlineButton({
  label,
  icon: Icon = Pencil,
  onClick,
  disabled,
}: {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 border border-neutralPrimary-300 px-3.5 py-2 rounded-lg cursor-pointer text-neutralPrimary-700 text-sm font-medium bg-white hover:border-greenPrimary-300 hover:text-greenPrimary-600 hover:bg-greenPrimary-950 disabled:cursor-not-allowed disabled:opacity-60 transition-colors duration-200"
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
  adornment,
  emptyAction,
}: {
  icon: LucideIcon;
  label: string;
  value?: string | null;
  adornment?: React.ReactNode;
  emptyAction?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-neutralPrimary-200 bg-neutralPrimary-50 p-4 min-w-0">
      <span className="w-9 h-9 rounded-lg bg-white border border-neutralPrimary-200 text-neutralPrimary-500 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </span>
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-xs font-medium text-neutralPrimary-500">{label}</p>
        {value ? (
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <p className="text-sm font-semibold text-neutralPrimary-800 break-all">
              {value}
            </p>
            {adornment}
          </div>
        ) : emptyAction ? (
          //* ==== AN EMPTY FIELD INVITES THE FIX RATHER THAN SHOWING A DASH ====
          <button
            type="button"
            onClick={emptyAction.onClick}
            className="flex items-center gap-1 text-sm font-semibold text-greenPrimary-500 hover:text-greenPrimary-700 cursor-pointer w-fit"
          >
            <Plus className="w-3.5 h-3.5" />
            {emptyAction.label}
          </button>
        ) : (
          <p className="text-sm text-neutralPrimary-400">Not provided</p>
        )}
      </div>
    </div>
  );
}

function SecurityRow({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3 min-w-0">
        <span className="w-9 h-9 rounded-lg bg-neutralPrimary-100 text-neutralPrimary-600 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" />
        </span>
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-semibold text-neutralPrimary-800">
            {title}
          </p>
          <div className="text-sm text-neutralPrimary-500">{description}</div>
        </div>
      </div>
      {action}
    </div>
  );
}

function StatItem({
  icon: Icon,
  label,
  primary,
  secondary,
}: {
  icon: LucideIcon;
  label: string;
  primary?: string;
  secondary?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-6 md:px-8 py-4">
      <Icon className="w-5 h-5 text-greenPrimary-500 shrink-0" />
      <div className="flex flex-col min-w-0">
        <p className="text-xs font-medium text-neutralPrimary-500">{label}</p>
        <p
          className="text-sm font-semibold text-neutralPrimary-800 truncate"
          title={secondary}
        >
          {primary ?? "—"}
        </p>
      </div>
    </div>
  );
}

/**
 * The signed-in user's profile. Used by the admin "Profile" page and, with
 * variant="customer", by the customer's "Account Details" page, which hides
 * the staff-only role and status badges.
 */
export default function Profile({
  variant = "admin",
}: {
  variant?: "admin" | "customer";
} = {}) {
  const isCustomer = variant === "customer";
  const {
    currentUserData: user,
    isCurrentUserLoading,
    currentUserRefetch,
  } = useCurrentUser<IUser>();

  const [isPhotoEditOpen, setIsPhotoEditOpen] = useState(false);
  const [isInfoEditOpen, setIsInfoEditOpen] = useState(false);
  const [isPasswordEditOpen, setIsPasswordEditOpen] = useState(false);

  const name = user?.name || user?.email;
  //* ==== SOCIAL ACCOUNTS HAVE NO PASSWORD TO CHANGE — THE API REJECTS
  //* change-password FOR THEM, SO THE UI DOES NOT OFFER AN ACTION THAT
  //* CANNOT SUCCEED. ====
  const isEmailAuth = user?.authProvider === "EMAIL";
  const status = statusBadgeStyle(user?.status);

  //* ==== EACH UNFINISHED STEP OPENS THE MODAL THAT COMPLETES IT. EMAIL
  //* VERIFICATION HAS NO ACTION HERE, SO IT IS SHOWN BUT NOT CLICKABLE. ====
  const completionSteps = [
    {
      label: "Add a profile photo",
      done: !!user?.profileImageUrl,
      onClick: () => setIsPhotoEditOpen(true),
    },
    {
      label: "Add your full name",
      done: !!user?.firstName && !!user?.lastName,
      onClick: () => setIsInfoEditOpen(true),
    },
    {
      label: "Add a phone number",
      done: !!user?.phone,
      onClick: () => setIsInfoEditOpen(true),
    },
    { label: "Verify your email", done: !!user?.emailVerified },
  ];
  const completedCount = completionSteps.filter((s) => s.done).length;
  const completionPercent = Math.round(
    (completedCount / completionSteps.length) * 100,
  );

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-2xl font-semibold text-neutralPrimary-800">
          {isCustomer ? "Account Details" : "My Profile"}
        </p>
        <p className="text-sm text-neutralPrimary-500">
          Manage your personal details, photo and password.
        </p>
      </div>

      {/* ================= HERO / IDENTITY CARD ================= */}
      <Card className="overflow-hidden">
        <div className="relative h-28 md:h-36 bg-linear-to-br from-greenPrimary-700 via-greenPrimary-500 to-greenPrimary-200 overflow-hidden">
          {/* ==== DECORATIVE SHAPES — PURELY VISUAL ==== */}
          <span className="absolute -top-16 -right-10 w-56 h-56 rounded-full bg-white/10" />
          <span className="absolute -bottom-24 right-40 w-48 h-48 rounded-full bg-white/10" />
          <span className="absolute top-6 left-1/3 w-20 h-20 rounded-full bg-greenPrimary-50/20" />
        </div>

        <div className="flex flex-col md:flex-row md:items-end gap-4 px-6 md:px-8 pb-6">
          <div className="relative -mt-12 md:-mt-14 w-fit shrink-0">
            {isCurrentUserLoading ? (
              <Skeleton className="w-24 h-24 md:w-28 md:h-28 rounded-full ring-4 ring-white" />
            ) : (
              <div className="rounded-full ring-4 ring-white shadow-md">
                <ProfileAvatar
                  src={user?.profileImageUrl}
                  name={name}
                  sizeClass="w-24 h-24 md:w-28 md:h-28"
                  fallbackTextClass="text-3xl"
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsPhotoEditOpen(true)}
              disabled={!user}
              aria-label="Change profile photo"
              title="Change profile photo"
              className="absolute bottom-0.5 right-0.5 w-8 h-8 rounded-full bg-greenPrimary-600 text-white ring-2 ring-white flex items-center justify-center shadow hover:bg-greenPrimary-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 transition-colors duration-200"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-1 flex-wrap items-end justify-between gap-4 min-w-0">
            {isCurrentUserLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            ) : (
              <div className="flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-xl md:text-2xl font-semibold text-neutralPrimary-800">
                    {name}
                  </p>
                  {user && !isCustomer && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${roleBadgeStyle(user.role)}`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {formatEnumString(user.role)}
                      </span>
                      <span
                        className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${status.badge}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                        />
                        {formatEnumString(user.status)}
                      </span>
                    </div>
                  )}
                </div>
                {user?.email && (
                  <p className="flex items-center gap-1.5 text-sm text-neutralPrimary-500 break-all">
                    <Mail className="w-4 h-4 shrink-0" />
                    {user.email}
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsInfoEditOpen(true)}
              disabled={!user}
              className="flex items-center gap-2 bg-greenPrimary-600 hover:bg-greenPrimary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 transition-colors duration-200"
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* ==== ACTIVITY STRIP ==== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-neutralPrimary-200 bg-neutralPrimary-50/70 divide-y sm:divide-y-0 sm:divide-x divide-neutralPrimary-200">
          {isCurrentUserLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-6 md:px-8 py-4">
                <Skeleton className="h-9 w-full" />
              </div>
            ))
          ) : (
            <>
              <StatItem
                icon={CalendarDays}
                label="Member since"
                primary={
                  user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })
                    : undefined
                }
                secondary={
                  user?.createdAt ? formatDate(user.createdAt) : undefined
                }
              />
              <StatItem
                icon={Clock}
                label="Last login"
                primary={relativeTime(user?.lastLoginAt)}
                secondary={
                  user?.lastLoginAt ? formatDate(user.lastLoginAt) : undefined
                }
              />
              <StatItem
                icon={History}
                label="Last updated"
                primary={relativeTime(user?.updatedAt)}
                secondary={
                  user?.updatedAt ? formatDate(user.updatedAt) : undefined
                }
              />
            </>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="flex flex-col gap-6 min-w-0 xl:col-span-2">
          {/* ================= PERSONAL INFORMATION ================= */}
          <Card className="p-6 md:p-8">
            <CardHeader
              icon={UserRound}
              title="Personal Information"
              description="Your name and contact details."
              action={
                <OutlineButton
                  label="Edit"
                  onClick={() => setIsInfoEditOpen(true)}
                  disabled={!user}
                />
              }
            />

            {isCurrentUserLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-[74px] w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoTile
                  icon={UserRound}
                  label="First name"
                  value={user?.firstName}
                />
                <InfoTile
                  icon={UserRound}
                  label="Last name"
                  value={user?.lastName}
                  emptyAction={{
                    label: "Add last name",
                    onClick: () => setIsInfoEditOpen(true),
                  }}
                />
                <InfoTile
                  icon={Mail}
                  label="Email address"
                  value={user?.email}
                  adornment={
                    user?.emailVerified ? (
                      <BadgeCheck
                        className="w-4 h-4 text-success-600"
                        aria-label="Verified"
                      />
                    ) : undefined
                  }
                />
                <InfoTile
                  icon={Phone}
                  label="Phone number"
                  value={user?.phone}
                  emptyAction={{
                    label: "Add phone number",
                    onClick: () => setIsInfoEditOpen(true),
                  }}
                />
              </div>
            )}
          </Card>

          {/* ================= SECURITY ================= */}
          <Card className="p-6 md:p-8">
            <CardHeader
              icon={ShieldCheck}
              title="Security"
              description="Sign-in and verification."
            />

            {isCurrentUserLoading ? (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-neutralPrimary-200">
                <SecurityRow
                  icon={KeyRound}
                  title="Password"
                  description={
                    isEmailAuth ? (
                      <span className="tracking-[0.2em]">••••••••••</span>
                    ) : (
                      "Not available for social sign-in"
                    )
                  }
                  action={
                    isEmailAuth && (
                      <OutlineButton
                        label="Change"
                        icon={KeyRound}
                        onClick={() => setIsPasswordEditOpen(true)}
                        disabled={!user}
                      />
                    )
                  }
                />
                <SecurityRow
                  icon={LogIn}
                  title="Sign-in method"
                  description={
                    user?.authProvider
                      ? formatEnumString(user.authProvider)
                      : "—"
                  }
                />
                <SecurityRow
                  icon={Mail}
                  title="Email verification"
                  description={
                    user?.emailVerified ? (
                      <span className="flex items-center gap-1 text-success-600 font-medium">
                        <CircleCheck className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-700 font-medium">
                        <CircleAlert className="w-3.5 h-3.5" />
                        Not verified
                      </span>
                    )
                  }
                />
              </div>
            )}
          </Card>
        </div>

        {/* ================= PROFILE COMPLETION ================= */}
        {/* ==== STICKY ON WIDE SCREENS SO IT STAYS IN VIEW BESIDE THE LONGER MAIN COLUMN ==== */}
        <Card className="p-6 xl:sticky xl:top-26">
          <CardHeader
            icon={Sparkles}
            title="Profile completion"
            description={
              isCurrentUserLoading
                ? undefined
                : completionPercent === 100
                  ? "Your profile is complete."
                  : `${completedCount} of ${completionSteps.length} steps done`
            }
            action={
              isCurrentUserLoading ? (
                <Skeleton className="h-6 w-12" />
              ) : (
                <span className="text-lg font-bold leading-none text-greenPrimary-600">
                  {completionPercent}%
                </span>
              )
            }
          />

          <div
            role="progressbar"
            aria-label="Profile completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={isCurrentUserLoading ? 0 : completionPercent}
            className="-mt-2 h-2 w-full rounded-full bg-neutralPrimary-100 overflow-hidden"
          >
            <div
              className="h-full rounded-full bg-linear-to-r from-greenPrimary-500 to-greenPrimary-200 transition-[width] duration-500"
              style={{
                width: `${isCurrentUserLoading ? 0 : completionPercent}%`,
              }}
            />
          </div>

          {!isCurrentUserLoading && (
            <ul className="flex flex-col gap-1 mt-5">
              {completionSteps.map((step) => {
                const actionable = !step.done && step.onClick;
                const content = (
                  <>
                    {step.done ? (
                      <CircleCheck className="w-4 h-4 text-success-600 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-neutralPrimary-300 shrink-0" />
                    )}
                    <span
                      className={`flex-1 text-left ${step.done ? "text-neutralPrimary-500" : "font-medium text-neutralPrimary-800"}`}
                    >
                      {step.label}
                    </span>
                    {step.done ? (
                      <span className="text-xs font-medium text-success-600">
                        Done
                      </span>
                    ) : (
                      actionable && (
                        <ChevronRight className="w-4 h-4 text-neutralPrimary-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-greenPrimary-500" />
                      )
                    )}
                  </>
                );
                return (
                  <li key={step.label}>
                    {actionable ? (
                      <button
                        type="button"
                        onClick={step.onClick}
                        className="group w-full flex items-center gap-2.5 text-sm px-3 py-2.5 rounded-lg bg-neutralPrimary-50 hover:bg-greenPrimary-950 cursor-pointer transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary-500/40"
                      >
                        {content}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2.5 text-sm px-3 py-2.5">
                        {content}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* ================= EDIT PHOTO MODAL ================= */}
      <CustomModal2
        open={isPhotoEditOpen}
        onOpenChange={setIsPhotoEditOpen}
        dialogWidth="w-[30vw] max-lg:w-[90vw]"
      >
        {user && (
          <EditProfilePhoto
            user={user}
            onClose={() => setIsPhotoEditOpen(false)}
            refetch={currentUserRefetch}
          />
        )}
      </CustomModal2>

      {/* ================= EDIT PERSONAL INFO MODAL ================= */}
      <CustomModal2
        open={isInfoEditOpen}
        onOpenChange={setIsInfoEditOpen}
        dialogWidth="w-[40vw] max-lg:w-[90vw]"
      >
        {user && (
          <EditPersonalInfo
            user={user}
            onClose={() => setIsInfoEditOpen(false)}
            refetch={currentUserRefetch}
          />
        )}
      </CustomModal2>

      {/* ================= CHANGE PASSWORD MODAL ================= */}
      <CustomModal2
        open={isPasswordEditOpen}
        onOpenChange={setIsPasswordEditOpen}
        dialogWidth="w-[35vw] max-lg:w-[90vw]"
      >
        {user && (
          <ChangePassword
            userId={user.id}
            email={user.email}
            onClose={() => setIsPasswordEditOpen(false)}
          />
        )}
      </CustomModal2>
    </section>
  );
}
