"use client";

import React, { useState } from "react";
import {
  Check,
  CheckCheck,
  Copy,
  Hash,
  Mail,
  MessageSquareText,
  NotebookPen,
  Phone,
  RotateCcw,
  UserRound,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";
import CancelButton from "@/components/primitives/button/CancelButton";
import { usePatch } from "@/hooks/api/usePatch";
import { IModal } from "@/types";
import { IContactMessage } from "@/modules/contact/types/contact.types";
import { SenderBadge, StatusPill } from "./contact.columns";
import {
  avatarColor,
  fullDate,
  initials,
  senderName,
  telLink,
  timeAgo,
  whatsappLink,
} from "./contact.utils";

const NOTES_MAX = 2000;

const ENTER =
  "animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out fill-mode-backwards motion-reduce:animate-none";

const copy = async (text: string, what: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${what} copied`);
  } catch {
    toast.error(`Could not copy ${what.toLowerCase()}`);
  }
};

function Section({
  icon,
  title,
  aside,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`${ENTER} flex flex-col rounded-xl border border-neutralPrimary-100 bg-white p-3 sm:p-4`}
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

function DetailRow({
  icon,
  label,
  value,
  href,
  onCopy,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  href?: string;
  onCopy?: () => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutralPrimary-50 text-neutralPrimary-400">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutralPrimary-400">
          {label}
        </p>
        {value ? (
          href ? (
            <a
              href={href}
              className="block truncate text-sm text-neutralPrimary-700 transition-colors hover:text-greenPrimary-600"
            >
              {value}
            </a>
          ) : (
            <p className="truncate text-sm text-neutralPrimary-700">{value}</p>
          )
        ) : (
          <p className="text-sm italic text-neutralPrimary-400">Not given</p>
        )}
      </div>
      {value && onCopy && (
        <button
          type="button"
          onClick={onCopy}
          aria-label={`Copy ${label.toLowerCase()}`}
          className="shrink-0 rounded-md p-1.5 text-neutralPrimary-400 transition-colors hover:bg-neutralPrimary-100 hover:text-neutralPrimary-700"
        >
          <Copy size={14} />
        </button>
      )}
    </div>
  );
}

const ACTION_BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-150 active:scale-[0.98]";

export default function ViewMessage({ data, onClose, refetch }: IModal) {
  const initial = data as IContactMessage | undefined;
  const [message, setMessage] = useState<IContactMessage | undefined>(initial);
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const { mutate: patchMessage, isPending } = usePatch<IContactMessage>();

  if (!message) {
    return (
      <div className="flex flex-col items-center gap-2 p-10 text-center text-neutralPrimary-400">
        <MessageSquareText size={32} />
        No message selected.
      </div>
    );
  }

  const name = senderName(message);
  const whatsapp = whatsappLink(message);
  const replyEmail = message.email || message.user?.email || null;
  const notesChanged = notes.trim() !== (message.notes ?? "");

  const update = (body: Record<string, unknown>) =>
    patchMessage(
      { endpoint: `/contact-messages/${message.id}`, data: body },
      {
        onSuccess: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300 && res.data) {
            setMessage(res.data);
            setNotes(res.data.notes ?? "");
            refetch?.();
          }
        },
      },
    );

  return (
    <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
      {/* Hero */}
      <div
        className={`${ENTER} relative overflow-hidden rounded-2xl bg-gradient-to-br from-greenPrimary-950 via-white to-yellowSecondary-100 p-4 ring-1 ring-greenPrimary-100 sm:p-5`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <span
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold shadow-sm sm:h-16 sm:w-16 sm:text-xl ${avatarColor(
              name,
            )}`}
          >
            {initials(message)}
          </span>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="min-w-0 break-words text-lg font-bold capitalize text-neutralPrimary-800 sm:text-xl">
                {name}
              </h2>
              <StatusPill replied={message.replied} />
              <SenderBadge isCustomer={!!message.userId} />
            </div>
            <p className="text-sm text-neutralPrimary-500">
              Received {timeAgo(message.createdAt)}
              <span className="text-neutralPrimary-400">
                {" "}
                · {fullDate(message.createdAt)}
              </span>
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <a
            href={telLink(message.phone)}
            className={`${ACTION_BASE} bg-greenPrimary-600 text-white shadow-sm hover:bg-greenPrimary-700`}
          >
            <Phone size={16} />
            Call
          </a>
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className={`${ACTION_BASE} bg-[#25D366] text-white shadow-sm hover:brightness-95`}
            >
              <FaWhatsapp size={17} />
              WhatsApp
            </a>
          )}
          {replyEmail && (
            <a
              href={`mailto:${replyEmail}?subject=${encodeURIComponent(
                "Re: your message to Natura Care",
              )}`}
              className={`${ACTION_BASE} border border-neutralPrimary-200 bg-white text-neutralPrimary-700 hover:border-blueSecondary-300 hover:text-blueSecondary-600`}
            >
              <Mail size={16} />
              Email
            </a>
          )}
          <button
            type="button"
            onClick={() => copy(message.phone, "Phone number")}
            className={`${ACTION_BASE} border border-neutralPrimary-200 bg-white text-neutralPrimary-700 hover:border-neutralPrimary-300 hover:bg-neutralPrimary-50`}
          >
            <Copy size={16} />
            Copy phone
          </button>
        </div>
      </div>

      {/* Message */}
      <Section
        icon={<MessageSquareText size={16} />}
        title="Message"
        aside={
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutralPrimary-400">
              {message.message.length.toLocaleString()} characters
            </span>
            <button
              type="button"
              onClick={() => copy(message.message, "Message")}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-neutralPrimary-500 transition-colors hover:bg-neutralPrimary-100 hover:text-neutralPrimary-700"
            >
              <Copy size={12} />
              Copy
            </button>
          </div>
        }
      >
        <div className="max-h-72 overflow-y-auto scrollbar-brand rounded-lg border border-neutralPrimary-100 bg-neutralPrimary-50 p-3 sm:p-4">
          <p className="whitespace-pre-line break-words text-sm leading-relaxed text-neutralPrimary-800 sm:text-base">
            {message.message}
          </p>
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Contact details */}
        <Section icon={<Phone size={16} />} title="Contact Details">
          <div className="space-y-3">
            <DetailRow
              icon={<Phone size={15} />}
              label="Phone"
              value={message.phone}
              href={telLink(message.phone)}
              onCopy={() => copy(message.phone, "Phone number")}
            />
            <DetailRow
              icon={<Mail size={15} />}
              label="Email"
              value={message.email}
              href={message.email ? `mailto:${message.email}` : undefined}
              onCopy={
                message.email
                  ? () => copy(message.email as string, "Email")
                  : undefined
              }
            />
            <DetailRow
              icon={<Hash size={15} />}
              label="Reference"
              value={`#${message.id} · ${message.sid.slice(0, 8)}`}
              onCopy={() => copy(message.sid, "Reference")}
            />
          </div>
        </Section>

        {/* Linked account */}
        <Section icon={<UserRound size={16} />} title="Customer Account">
          {message.user ? (
            <div className="space-y-3">
              <DetailRow
                icon={<UserRound size={15} />}
                label="Name"
                value={message.user.name}
              />
              <DetailRow
                icon={<Mail size={15} />}
                label="Account email"
                value={message.user.email}
                href={`mailto:${message.user.email}`}
                onCopy={() => copy(message.user!.email, "Email")}
              />
              <DetailRow
                icon={<Phone size={15} />}
                label="Account phone"
                value={message.user.phone}
                href={message.user.phone ? telLink(message.user.phone) : undefined}
              />
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-start gap-1 rounded-lg bg-neutralPrimary-50 p-3">
              <p className="text-sm font-medium text-neutralPrimary-600">
                Sent as a guest
              </p>
              <p className="text-xs text-neutralPrimary-400">
                The sender was not signed in, so the message is not linked to an
                account. Use the phone number to get back to them.
              </p>
            </div>
          )}
        </Section>
      </div>

      {/* Reply status */}
      <Section
        icon={<CheckCheck size={16} />}
        title="Reply Status"
        aside={<StatusPill replied={message.replied} />}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-neutralPrimary-500">
            {message.replied
              ? "Marked as replied. Reopen it if the conversation needs a follow-up."
              : "No reply yet. Once you have called or messaged the sender, mark it as replied."}
          </p>
          <button
            type="button"
            disabled={isPending}
            onClick={() => update({ replied: !message.replied })}
            className={`${ACTION_BASE} shrink-0 disabled:cursor-not-allowed disabled:opacity-60 ${
              message.replied
                ? "border border-warningPrimary-200 bg-warningPrimary-50 text-warningPrimary-700 hover:bg-warningPrimary-100"
                : "bg-success-600 text-white shadow-sm hover:bg-success-700"
            }`}
          >
            {message.replied ? <RotateCcw size={15} /> : <Check size={16} />}
            {message.replied ? "Mark as pending" : "Mark as replied"}
          </button>
        </div>
      </Section>

      {/* Internal notes */}
      <Section
        icon={<NotebookPen size={16} />}
        title="Internal Notes"
        aside={
          <span className="text-[11px] text-neutralPrimary-400">
            Only admins can see these
          </span>
        }
      >
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={NOTES_MAX}
          rows={4}
          placeholder="e.g. Called back on 12 Oct, will order the 190 ml bottle."
          className="w-full resize-y scrollbar-brand-field rounded-lg border border-neutralPrimary-200 bg-white p-3 text-sm text-neutralPrimary-700 outline-none transition-all placeholder:text-neutralPrimary-400 focus:border-greenPrimary-400 focus:ring-4 focus:ring-greenPrimary-500/10"
        />
        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span
            className={`text-[11px] ${
              notes.length > NOTES_MAX * 0.9
                ? "text-warningPrimary-600"
                : "text-neutralPrimary-400"
            }`}
          >
            {notes.length.toLocaleString()}/{NOTES_MAX.toLocaleString()}
          </span>
          <div className="flex gap-2">
            {notesChanged && (
              <button
                type="button"
                onClick={() => setNotes(message.notes ?? "")}
                className="flex-1 rounded-lg px-3 py-2 text-sm font-medium text-neutralPrimary-500 transition-colors hover:bg-neutralPrimary-100 sm:flex-none"
              >
                Discard
              </button>
            )}
            <button
              type="button"
              disabled={!notesChanged || isPending}
              onClick={() => update({ notes: notes.trim() || null })}
              className="flex-1 rounded-lg bg-greenPrimary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-greenPrimary-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              {isPending ? "Saving..." : "Save notes"}
            </button>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <div className="flex flex-col-reverse gap-3 border-t border-neutralPrimary-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-neutralPrimary-400">
          Last updated {fullDate(message.updatedAt)}
        </p>
        <CancelButton
          onClick={() => onClose?.()}
          label="Close"
          className="w-full sm:w-auto"
        />
      </div>
    </div>
  );
}
