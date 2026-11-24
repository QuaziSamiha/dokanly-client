import { format, formatDistanceToNowStrict, isValid } from "date-fns";
import { IContactMessage } from "@/modules/contact/types/contact.types";

export const senderName = (m: Pick<IContactMessage, "firstName" | "lastName">) =>
  [m.firstName, m.lastName].filter(Boolean).join(" ");

export const initials = (m: Pick<IContactMessage, "firstName" | "lastName">) =>
  `${m.firstName?.charAt(0) ?? ""}${m.lastName?.charAt(0) ?? ""}`.toUpperCase() ||
  "?";

// Same sender, same colour: picked from the name so it stays stable.
const AVATAR_COLORS = [
  "bg-greenPrimary-950 text-greenPrimary-700",
  "bg-blueSecondary-100 text-blueSecondary-600",
  "bg-purpleSecondary-100 text-purpleSecondary-500",
  "bg-orangeSecondary-100 text-orangeSecondary-500",
  "bg-yellowSecondary-100 text-yellowSecondary-800",
];

export const avatarColor = (seed: string) => {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

/** "5 minutes ago" */
export const timeAgo = (value?: string) => {
  const date = value ? new Date(value) : null;
  return date && isValid(date)
    ? formatDistanceToNowStrict(date, { addSuffix: true })
    : "—";
};

/** "12 Oct 2026, 2:45 PM" */
export const fullDate = (value?: string) => {
  const date = value ? new Date(value) : null;
  return date && isValid(date) ? format(date, "d MMM yyyy, h:mm a") : "—";
};

/**
 * WhatsApp needs the number in international form without "+". Only
 * Bangladeshi mobile numbers are converted: landlines have no WhatsApp.
 * "01750256844" / "+8801750256844" -> "8801750256844"; anything else -> null.
 */
export const whatsappNumber = (phone?: string | null) => {
  const digits = (phone ?? "").replace(/\D/g, "");
  const match = digits.match(/^(?:88)?(01[3-9]\d{8})$/);
  return match ? `88${match[1]}` : null;
};

export const whatsappLink = (message: IContactMessage) => {
  const number = whatsappNumber(message.phone);
  if (!number) return null;
  const text = `Hi ${message.firstName}, this is Natura Care replying to your message.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
};

/** tel: link without spaces or brackets, keeping a leading "+". */
export const telLink = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
