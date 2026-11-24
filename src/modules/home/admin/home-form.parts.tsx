import React from "react";
import { CircleAlert } from "lucide-react";
import { FieldValues, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ModalFooter from "@/components/primitives/modal/ModalFooter";
import CancelButton from "@/components/primitives/button/CancelButton";
import SubmitButton from "@/components/form/SubmitButton";
import { formatDateDDMMYYYY } from "@/lib/utils/date.utils";
import { IHomeContent } from "@/modules/home/types/home-content.types";

/**
 * Padding of every home content form inside its modal. ModalHeader and
 * ModalFooter pull themselves into it with matching negative margins, so a
 * form always keeps its bottom padding, with or without the pinned bar.
 */
export const HOME_FORM_WRAPPER = "w-full p-4 sm:p-6";

/**
 * Cancel + primary action, pinned to the bottom of the modal so they never
 * need scrolling to. Must be the last child of the <form>.
 */
export const FormActions = ({
  onCancel,
  submitTitle,
  isPending,
}: {
  onCancel: () => void;
  submitTitle: string;
  isPending?: boolean;
}) => (
  <ModalFooter>
    <CancelButton onClick={onCancel} className="h-11 w-full sm:w-auto" />
    <SubmitButton
      submitTitle={submitTitle}
      isPending={isPending}
      buttonWidth="w-full sm:w-auto"
    />
  </ModalFooter>
);

// ============ INACTIVE LOCK ============
// * An inactive item is hidden from the home page, so only its status can be
// * edited. The form locks the other fields, discards their unsaved edits and
// * sends only the status.

/**
 * Validates the whole form normally, but only `status` while Inactive is
 * selected: the other fields are locked and never sent, so a stored value
 * that fails today's rules (e.g. an old link without https://) can't block
 * hiding the item.
 */
export function inactiveAwareResolver<T extends FieldValues>(
  schema: z.ZodObject<{ status: z.ZodType } & z.ZodRawShape>,
): Resolver<T> {
  const full = zodResolver(schema) as unknown as Resolver<T>;
  const statusOnly = zodResolver(
    z.looseObject({ status: schema.shape.status }),
  ) as unknown as Resolver<T>;
  return (values, context, options) =>
    ((values as { status?: string }).status === "INACTIVE" ? statusOnly : full)(
      values,
      context,
      options,
    );
}

export const InactiveLockNotice = ({
  item,
  fields,
}: {
  /** e.g. "platform", "article" */
  item: string;
  /** e.g. "link, position and icon" */
  fields: string;
}) => (
  <div
    role="status"
    className="flex w-full items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-800"
  >
    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
    <span>
      This {item} is inactive, so its {fields} are locked. Set the status to{" "}
      <strong>Active</strong> to edit them.
    </span>
  </div>
);

/**
 * Wraps the fields an inactive item may not change. `<fieldset disabled>`
 * natively disables every input and button inside, including the upload
 * box's replace and remove buttons; the fade shows it at a glance.
 */
export const LockableFieldset = ({
  locked,
  children,
}: {
  locked: boolean;
  children: React.ReactNode;
}) => (
  <fieldset
    disabled={locked}
    aria-disabled={locked}
    className={`flex w-full min-w-0 flex-col gap-6 transition-opacity duration-200 ${
      locked ? "pointer-events-none opacity-50 select-none" : ""
    }`}
  >
    {children}
  </fieldset>
);

/**
 * Building blocks for the home content forms: labelled groups of fields and
 * a one-line audit footer, so long edit forms read as sections instead of a
 * single stack of full-width rows.
 */

export const FormSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section className="flex w-full flex-col gap-4">
    <div className="flex flex-col gap-0.5">
      <h3 className="text-sm font-semibold text-neutralPrimary-800">{title}</h3>
      {description && (
        <p className="text-xs leading-relaxed text-neutralPrimary-500">
          {description}
        </p>
      )}
    </div>
    {children}
  </section>
);

export const FormDivider = () => (
  <hr className="w-full border-neutralPrimary-200" />
);

/** "Created by Samiha on Oct 11, 2026 · Last updated by … on …" */
export const AuditMeta = ({ item }: { item?: IHomeContent }) => {
  if (!item?.createdAt) return null;
  return (
    <p className="w-full border-t border-neutralPrimary-200 pt-4 text-xs leading-relaxed text-neutralPrimary-500">
      Created
      {item.createdBy?.name && (
        <>
          {" "}by{" "}
          <span className="font-medium text-neutralPrimary-700">
            {item.createdBy.name}
          </span>
        </>
      )}{" "}
      on {formatDateDDMMYYYY(item.createdAt)}
      {item.updatedBy && item.updatedAt && (
        <>
          <span className="mx-1.5 text-neutralPrimary-300">·</span>
          Last updated by{" "}
          <span className="font-medium text-neutralPrimary-700">
            {item.updatedBy.name}
          </span>{" "}
          on {formatDateDDMMYYYY(item.updatedAt)}
        </>
      )}
    </p>
  );
};
