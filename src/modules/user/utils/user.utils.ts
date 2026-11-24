import { IUser } from "@/modules/user/types/user.types";

/** "3 days ago", "2 months ago", "Just now"; "Never" when there is no date. */
export function timeAgo(value?: string | null) {
  if (!value) return "Never";
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  for (const [unit, size] of units) {
    if (seconds >= size) return rtf.format(-Math.floor(seconds / size), unit);
  }
  return "Just now";
}

/** Up to two initials from a full name: "Samiha Quazi" -> "SQ". */
export const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "?";

/** Sign-in is blocked by too many failed attempts until lockedUntil passes. */
export const isSignInLocked = (user: Pick<IUser, "lockedUntil">) =>
  !!user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now();
