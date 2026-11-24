"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Cake,
  Calendar,
  Check,
  Clock,
  Copy,
  FileText,
  Fingerprint,
  Globe,
  KeyRound,
  Lock,
  LockOpen,
  LogIn,
  Mail,
  MailWarning,
  Phone,
  ShieldCheck,
  ShieldX,
  User,
  UserRound,
} from "lucide-react";
import CancelButton from "@/components/primitives/button/CancelButton";
import { IModal } from "@/types";
import { IUser } from "@/modules/user/types/user.types";
import { formatEnumString } from "@/lib/utils/string.utils";
import {
  initialsOf,
  isSignInLocked,
  timeAgo,
} from "@/modules/user/utils/user.utils";

type UserStatus = IUser["status"];
type UserRole = IUser["role"];

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

const formatDay = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString(undefined, { dateStyle: "long" })
    : "—";

/** Whole years between the date of birth and today. */
function ageFrom(dateOfBirth?: string | null) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());
  if (beforeBirthday) age--;
  return age >= 0 ? age : null;
}

/** "142 days", "3 months", "2 years". */
function accountAge(createdAt?: string) {
  if (!createdAt) return "—";
  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000),
  );
  if (days < 31) return `${days} day${days === 1 ? "" : "s"}`;
  const months = Math.floor(days / 30.44);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"}`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"}`;
}

const STATUS_STYLES: Record<UserStatus, { pill: string; dot: string }> = {
  ACTIVE: {
    pill: "bg-success-100 text-success-600 ring-success-600/20",
    dot: "bg-success-600",
  },
  INACTIVE: {
    pill: "bg-destructive-100 text-destructive-600 ring-destructive-600/20",
    dot: "bg-destructive-600",
  },
  SUSPENDED: {
    pill: "bg-destructive-100 text-destructive-600 ring-destructive-600/20",
    dot: "bg-destructive-600",
  },
  ARCHIVED: {
    pill: "bg-neutralPrimary-100 text-neutralPrimary-600 ring-neutralPrimary-600/20",
    dot: "bg-neutralPrimary-500",
  },
  PENDING_VERIFICATION: {
    pill: "bg-warningPrimary-100 text-warningPrimary-600 ring-warningPrimary-600/20",
    dot: "bg-warningPrimary-600",
  },
};

// Same colours as the role column in user.columns.tsx
const ROLE_STYLES: Record<UserRole, string> = {
  ADMIN: "bg-blueSecondary-100 text-blueSecondary-600",
  EMPLOYEE: "bg-teal-100 text-teal-600",
  CUSTOMER: "bg-neutralPrimary-100 text-neutralPrimary-600",
};

const PROVIDER_LABELS: Record<IUser["authProvider"], string> = {
  EMAIL: "Email & password",
  GOOGLE: "Google",
  FACEBOOK: "Facebook",
  APPLE: "Apple",
};

// Staggered fade/slide-in for the modal's blocks (tw-animate-css).
const ENTER =
  "animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out fill-mode-backwards motion-reduce:animate-none";
const enterDelay = (ms: number): React.CSSProperties => ({
  animationDelay: `${ms}ms`,
});

// Shared lift-on-hover for cards.
const LIFT =
  "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0";

function StatusPill({ status }: { status: UserStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset transition-transform duration-300 hover:scale-105 ${style.pill}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {status === "ACTIVE" && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 motion-reduce:animate-none ${style.dot}`}
          />
        )}
        <span className={`relative h-1.5 w-1.5 rounded-full ${style.dot}`} />
      </span>
      {formatEnumString(status)}
    </span>
  );
}

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
      className={`group relative min-w-0 cursor-default overflow-hidden rounded-xl p-3 sm:p-4 ${ENTER} ${LIFT} ${className}`}
      style={enterDelay(delay)}
    >
      {/* Decorative glow that grows on hover */}
      <span className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-current opacity-[0.06] transition-transform duration-500 ease-out group-hover:scale-[2.2]" />
      <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide opacity-80 sm:gap-2 sm:text-xs">
        <span className="shrink-0 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-125">
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1.5 origin-left truncate text-lg font-bold transition-transform duration-300 group-hover:scale-105 sm:mt-2 sm:text-xl">
        {value}
      </p>
      {hint && (
        <p className="mt-0.5 line-clamp-2 break-words text-[11px] opacity-70 sm:text-xs">
          {hint}
        </p>
      )}
    </div>
  );
}

function Flag({
  on,
  tone = "good",
  icon,
  label,
  text,
  delay = 0,
}: {
  on: boolean;
  /** "bad" turns an "on" flag red, e.g. a locked account. */
  tone?: "good" | "bad";
  icon: React.ReactNode;
  label: string;
  text: string;
  delay?: number;
}) {
  const styles = !on
    ? {
        card: "border-neutralPrimary-100 bg-neutralPrimary-50 hover:border-neutralPrimary-200",
        icon: "bg-neutralPrimary-200 text-neutralPrimary-500",
        text: "text-neutralPrimary-400",
      }
    : tone === "good"
      ? {
          card: "border-greenPrimary-200 bg-greenPrimary-950 hover:border-greenPrimary-400",
          icon: "bg-greenPrimary-600 text-white",
          text: "text-greenPrimary-600",
        }
      : {
          card: "border-destructive-600/20 bg-destructive-100 hover:border-destructive-600/40",
          icon: "bg-destructive-600 text-white",
          text: "text-destructive-600",
        };

  return (
    <div
      style={enterDelay(delay)}
      className={`group flex cursor-default items-center gap-3 rounded-xl border p-3 ${ENTER} ${LIFT} ${styles.card}`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${styles.icon}`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-neutralPrimary-700">{label}</p>
        <p className={`break-words text-xs ${styles.text}`}>{text}</p>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <section
      style={enterDelay(delay)}
      className={`${ENTER} group rounded-xl border border-neutralPrimary-100 bg-white p-3 transition-all duration-300 hover:border-greenPrimary-200 hover:shadow-md sm:p-4`}
    >
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutralPrimary-700">
        <span className="text-greenPrimary-500 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
          {icon}
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

/** One labelled value inside a Section. Empty values show a muted dash. */
function InfoItem({
  icon,
  label,
  value,
  hint,
  copyable,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  hint?: string;
  copyable?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="group/item flex min-w-0 items-start gap-3 rounded-lg p-2 transition-colors duration-200 hover:bg-neutralPrimary-50">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-greenPrimary-950 text-greenPrimary-600 transition-transform duration-300 group-hover/item:scale-110">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutralPrimary-400">
          {label}
        </p>
        {value ? (
          <div className="flex min-w-0 items-center gap-1.5">
            <p
              className={`min-w-0 break-all text-sm font-medium text-neutralPrimary-700 ${
                mono ? "font-mono" : ""
              }`}
            >
              {value}
            </p>
            {copyable && <CopyButton value={value} label={label} />}
          </div>
        ) : (
          <p className="text-sm italic text-neutralPrimary-300">Not provided</p>
        )}
        {hint && value && (
          <p className="text-xs text-neutralPrimary-400">{hint}</p>
        )}
      </div>
    </div>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be blocked (e.g. insecure context); nothing to do.
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? "Copied" : `Copy ${label.toLowerCase()}`}
      aria-label={`Copy ${label.toLowerCase()}`}
      className="shrink-0 rounded p-1 text-neutralPrimary-400 opacity-100 transition-all hover:bg-greenPrimary-950 hover:text-greenPrimary-600 sm:opacity-0 sm:group-hover/item:opacity-100 sm:focus-visible:opacity-100"
    >
      {copied ? (
        <Check size={13} className="text-greenPrimary-600" />
      ) : (
        <Copy size={13} />
      )}
    </button>
  );
}

function AuditRow({
  icon,
  label,
  date,
}: {
  icon: React.ReactNode;
  label: string;
  date?: string | null;
}) {
  return (
    <div className="group flex min-w-0 cursor-default items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blueSecondary-100 text-blueSecondary-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-blueSecondary-600 group-hover:text-white group-hover:shadow-md">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutralPrimary-400">
          {label}
        </p>
        <p className="break-words text-sm text-neutralPrimary-700">
          {formatDateTime(date)}
        </p>
        {date && (
          <p className="text-xs text-neutralPrimary-400">{timeAgo(date)}</p>
        )}
      </div>
    </div>
  );
}

function Avatar({ src, name }: { src?: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  const initials = initialsOf(name);

  if (!src || failed) {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-greenPrimary-500 to-greenPrimary-700 text-xl font-bold text-greenPrimary-50 shadow-md ring-4 ring-white transition-all duration-500 ease-out hover:-rotate-6 hover:scale-110 hover:shadow-xl sm:h-20 sm:w-20 sm:text-2xl">
        {initials}
      </div>
    );
  }
  return (
    // The URL comes from the API host, which next/image's remotePatterns may not list.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      onError={() => setFailed(true)}
      className="h-16 w-16 shrink-0 rounded-full object-cover shadow-md ring-4 ring-white transition-all duration-500 ease-out hover:scale-110 hover:shadow-xl sm:h-20 sm:w-20"
    />
  );
}

/** The most important thing an admin should notice first, if anything. */
function accountNotice(user: IUser, isLocked: boolean) {
  if (isLocked) {
    return {
      tone: "danger" as const,
      title: "Sign-in locked.",
      body: `Too many failed attempts. This account cannot sign in until ${formatDateTime(user.lockedUntil)}.`,
    };
  }
  switch (user.status) {
    case "PENDING_VERIFICATION":
      return {
        tone: "warning" as const,
        title: "Waiting for email verification.",
        body: "The user has not entered the code sent to their email yet, so they cannot sign in.",
      };
    case "SUSPENDED":
      return {
        tone: "danger" as const,
        title: "Account suspended.",
        body: "The user cannot sign in or reset their password until an admin reactivates the account.",
      };
    case "INACTIVE":
      return {
        tone: "danger" as const,
        title: "Account inactive.",
        body: "The user cannot sign in until the account is set back to active.",
      };
    case "ARCHIVED":
      return {
        tone: "neutral" as const,
        title: "Account archived.",
        body: "Kept for records only; the user cannot sign in.",
      };
    default:
      return null;
  }
}

const NOTICE_STYLES = {
  danger:
    "border-destructive-600/20 bg-destructive-100 text-destructive-600",
  warning:
    "border-warningPrimary-200 bg-warningPrimary-100 text-warningPrimary-600",
  neutral:
    "border-neutralPrimary-200 bg-neutralPrimary-50 text-neutralPrimary-600",
};

export default function ViewUser({ data, onClose }: IModal) {
  const user = data as IUser | undefined;

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-2 p-10 text-center text-neutralPrimary-400">
        <UserRound size={32} />
        No user details available.
      </div>
    );
  }

  const isLocked = isSignInLocked(user);
  const canSignIn = user.status === "ACTIVE" && !isLocked;
  const notice = accountNotice(user, isLocked);
  const age = ageFrom(user.dateOfBirth);
  const usesPassword = user.authProvider === "EMAIL";

  return (
    <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
      {/* Hero */}
      <div
        className={`${ENTER} group/hero relative overflow-hidden rounded-2xl bg-gradient-to-br from-greenPrimary-950 via-white to-yellowSecondary-100 p-4 ring-1 ring-greenPrimary-100 transition-shadow duration-500 hover:shadow-lg hover:ring-greenPrimary-200 sm:p-5`}
      >
        {/* Light sheen that sweeps across on hover */}
        <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 transition-all duration-1000 ease-out group-hover/hero:left-full group-hover/hero:opacity-100 motion-reduce:hidden" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Avatar src={user.profileImageUrl} name={user.name} />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="min-w-0 break-words text-xl font-bold text-neutralPrimary-800 sm:text-2xl">
                {user.name}
              </h2>
              {user.emailVerified && (
                <BadgeCheck
                  size={20}
                  aria-label="Email verified"
                  className="shrink-0 text-blueSecondary-600"
                />
              )}
            </div>

            <p className="flex min-w-0 items-center gap-1.5 text-sm text-neutralPrimary-500">
              <Mail size={14} className="shrink-0" />
              <span className="break-all">{user.email}</span>
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={user.status} />
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-transform duration-300 hover:scale-105 ${ROLE_STYLES[user.role]}`}
              >
                {user.role.toLowerCase()}
              </span>
              <span className="text-xs text-neutralPrimary-400">
                ID #{user.id} · Joined {formatDay(user.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account notice */}
      {notice && (
        <div
          style={enterDelay(80)}
          className={`${ENTER} flex items-start gap-3 rounded-xl border p-3 text-sm ${NOTICE_STYLES[notice.tone]}`}
        >
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0 animate-pulse motion-reduce:animate-none"
          />
          <p>
            <span className="font-semibold">{notice.title}</span> {notice.body}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
        <StatTile
          icon={<Calendar size={14} />}
          label="Member For"
          value={accountAge(user.createdAt)}
          hint={`Since ${formatDay(user.createdAt)}`}
          className="bg-greenPrimary-950 text-greenPrimary-700"
          delay={100}
        />
        <StatTile
          icon={<LogIn size={14} />}
          label="Last Sign-in"
          value={timeAgo(user.lastLoginAt)}
          hint={
            user.lastLoginAt
              ? formatDateTime(user.lastLoginAt)
              : "Has not signed in yet"
          }
          className="bg-blueSecondary-50 text-blueSecondary-600"
          delay={170}
        />
        <StatTile
          icon={<KeyRound size={14} />}
          label="Failed Sign-ins"
          value={user.loginAttempts ?? 0}
          hint={
            user.loginAttempts
              ? "In a row since the last success"
              : "No failed attempts"
          }
          className={
            user.loginAttempts
              ? "bg-destructive-100 text-destructive-600"
              : "bg-purpleSecondary-100 text-purpleSecondary-500"
          }
          delay={240}
        />
        <StatTile
          icon={<Fingerprint size={14} />}
          label="Signs In With"
          value={PROVIDER_LABELS[user.authProvider] ?? user.authProvider}
          hint={usesPassword ? "Has a password" : "No password; social login"}
          className="bg-orangeSecondary-100 text-orangeSecondary-500"
          delay={310}
        />
      </div>

      {/* Account state */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Flag
          on={canSignIn}
          icon={canSignIn ? <ShieldCheck size={18} /> : <ShieldX size={18} />}
          label="Sign-in Access"
          text={canSignIn ? "Can sign in" : "Cannot sign in"}
          delay={380}
        />
        <Flag
          on={user.emailVerified}
          icon={user.emailVerified ? <BadgeCheck size={18} /> : <MailWarning size={18} />}
          label="Email"
          text={
            user.emailVerified
              ? user.emailVerifiedAt
                ? `Verified ${timeAgo(user.emailVerifiedAt).toLowerCase()}`
                : "Verified"
              : "Not verified yet"
          }
          delay={440}
        />
        <Flag
          on={isLocked}
          tone="bad"
          icon={isLocked ? <Lock size={18} /> : <LockOpen size={18} />}
          label="Sign-in Lock"
          text={
            isLocked
              ? `Locked until ${formatDateTime(user.lockedUntil)}`
              : "Not locked"
          }
          delay={500}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
        {/* Personal */}
        <Section delay={560} icon={<User size={16} />} title="Personal & Contact">
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <InfoItem icon={<User size={15} />} label="First Name" value={user.firstName} />
            <InfoItem icon={<User size={15} />} label="Last Name" value={user.lastName} />
            <InfoItem
              icon={<Mail size={15} />}
              label="Email"
              value={user.email}
              copyable
            />
            <InfoItem
              icon={<Phone size={15} />}
              label="Phone"
              value={user.phone}
              copyable
            />
            <InfoItem
              icon={<Cake size={15} />}
              label="Date of Birth"
              value={user.dateOfBirth ? formatDay(user.dateOfBirth) : null}
              hint={age !== null ? `${age} years old` : undefined}
            />
            <InfoItem
              icon={<UserRound size={15} />}
              label="Gender"
              value={user.gender}
            />
          </div>
        </Section>

        {/* Security */}
        <Section delay={620} icon={<ShieldCheck size={16} />} title="Security & Access">
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <InfoItem
              icon={<Fingerprint size={15} />}
              label="Sign-in Method"
              value={PROVIDER_LABELS[user.authProvider] ?? user.authProvider}
            />
            {!usesPassword && (
              <InfoItem
                icon={<KeyRound size={15} />}
                label="Provider Account ID"
                value={user.providerId}
                copyable
                mono
              />
            )}
            <InfoItem
              icon={<Globe size={15} />}
              label="Last Sign-in IP"
              value={user.lastLoginIp}
              copyable
              mono
            />
            <InfoItem
              icon={<Globe size={15} />}
              label="Assigned IP"
              value={user.assignedIp}
              copyable
              mono
            />
            <InfoItem
              icon={<Clock size={15} />}
              label="Last Sign-in"
              value={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : null}
            />
            <InfoItem
              icon={<Fingerprint size={15} />}
              label="Public ID"
              value={user.sid}
              copyable
              mono
            />
          </div>
        </Section>
      </div>

      {/* Bio */}
      <Section delay={680} icon={<FileText size={16} />} title="Bio">
        {user.bio ? (
          <p className="whitespace-pre-line break-words text-sm leading-relaxed text-neutralPrimary-600">
            {user.bio}
          </p>
        ) : (
          <p className="text-sm italic text-neutralPrimary-400">No bio added.</p>
        )}
      </Section>

      {/* Audit */}
      <div
        style={enterDelay(740)}
        className={`${ENTER} grid grid-cols-1 gap-3 rounded-xl bg-neutralPrimary-50 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4`}
      >
        <AuditRow icon={<Calendar size={16} />} label="Created" date={user.createdAt} />
        <AuditRow icon={<Clock size={16} />} label="Last Updated" date={user.updatedAt} />
        <AuditRow
          icon={<BadgeCheck size={16} />}
          label="Email Verified"
          date={user.emailVerifiedAt}
        />
      </div>

      <div className="flex justify-end border-t border-neutralPrimary-100 pt-4">
        <CancelButton
          onClick={onClose}
          label="Close"
          className="w-full transition-all hover:-translate-y-0.5 hover:border-greenPrimary-300 hover:bg-greenPrimary-950 hover:text-greenPrimary-700 hover:shadow-md active:translate-y-0 active:scale-95 sm:w-auto"
        />
      </div>
    </div>
  );
}
