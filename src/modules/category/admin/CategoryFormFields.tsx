"use client";

import {
  Control,
  UseFormTrigger,
  useController,
  useFormState,
  useWatch,
} from "react-hook-form";
import { AlertTriangle, Lock } from "lucide-react";
import InputField from "@/components/form/InputField";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import TextAreaField from "@/components/form/TextAreaField";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { ISingleSelectOption } from "@/types";
import {
  CATEGORY_DESCRIPTION_MAX,
  CategoryFormData,
} from "@/modules/category/schemas/category.schema";
import { CategoryStatus } from "@/modules/category/types/category.types";
import { slugify } from "@/modules/category/utils/category.utils";
import {
  fieldBox,
  fieldError,
  fieldInput,
  fieldLabel,
} from "@/components/form/formStyles";

const hint = "text-xs text-neutralPrimary-500 pl-0.5";

type StatusOption = { value: CategoryStatus; label: string; help: string };

const STATUS_OPTIONS: StatusOption[] = [
  { value: "ACTIVE", label: "Active", help: "Shown in the shop" },
  { value: "INACTIVE", label: "Inactive", help: "Hidden from the shop" },
  // Archiving is turned off for now
  // { value: "ARCHIVED", label: "Archived", help: "Retired and hidden" },
];

// Still shown for a category that is already archived, so its saved status
// stays visible and selected.
const ARCHIVED_OPTION: StatusOption = {
  value: "ARCHIVED",
  label: "Archived",
  help: "Retired and hidden",
};

type ParentField =
  | { editable: true; options: ISingleSelectOption[]; loading?: boolean }
  | { editable: false; name: string };

interface ICategoryFormFields {
  control: Control<CategoryFormData>;
  trigger: UseFormTrigger<CategoryFormData>;
  nameRef?: React.RefObject<HTMLInputElement | null>;
  /** A select on create; read-only on edit, because the parent is fixed. */
  parent: ParentField;
  showStatus?: boolean;
  /** Edit only: the saved slug, to warn when a rename changes the URL. */
  currentSlug?: string;
  /** Edit only: shown in the status warnings. */
  childrenCount?: number;
  productCount?: number;
  /** Edit only: the parent's name when the parent isn't ACTIVE. */
  inactiveParent?: string;
  isLoading?: boolean;
}

/**
 * Fields shared by the add and edit category forms, in one column so the eye
 * moves straight down on every screen size. Each field carries a short hint
 * that explains its effect on the shop.
 */
export default function CategoryFormFields({
  control,
  trigger,
  nameRef,
  parent,
  showStatus = false,
  currentSlug,
  childrenCount = 0,
  productCount = 0,
  inactiveParent,
  isLoading = false,
}: ICategoryFormFields) {
  const [name, description] = useWatch({
    control,
    name: ["categoryName", "description"],
  });
  const { errors } = useFormState({ control });

  const slug = slugify(name ?? "");
  const renamesUrl =
    currentSlug !== undefined && slug !== "" && slug !== currentSlug;
  const descriptionLength = description?.length ?? 0;

  return (
    <>
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <InputField
          labelName="Category name"
          name="categoryName"
          placeholderText="e.g. Hair Care"
          control={control}
          trigger={trigger}
          isLoading={isLoading}
          inputRef={nameRef}
          autoFocus
          inlineError
          isRequired
        />
        {!errors.categoryName &&
          (renamesUrl ? (
            <p className="flex items-start gap-1.5 pl-0.5 text-xs text-warningPrimary-700">
              <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden />
              <span>
                The URL changes from <Slug>{currentSlug}</Slug> to{" "}
                <Slug>{slug}</Slug>. Links to the old URL will stop working.
              </span>
            </p>
          ) : slug || currentSlug ? (
            <p className={hint}>
              URL: <Slug>{slug || currentSlug}</Slug>
            </p>
          ) : (
            <p className={hint}>Must be unique within its parent category.</p>
          ))}
      </div>

      {/* Parent */}
      {parent.editable ? (
        <div className="flex flex-col gap-1.5">
          <SingleSelectSearch
            labelName="Parent category"
            name="categoryParentId"
            control={control}
            options={parent.options}
            isLoading={parent.loading || isLoading}
          />
          <p className={hint}>
            Choose &ldquo;None&rdquo; for a top-level category. The parent
            can&apos;t be changed later.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <label htmlFor="categoryParent" className={fieldLabel}>
            Parent category
          </label>
          <div
            className={cn(
              fieldBox,
              "bg-neutralPrimary-50 hover:border-neutralPrimary-300",
            )}
          >
            <input
              id="categoryParent"
              value={parent.name}
              readOnly
              aria-describedby="categoryParentHint"
              className={cn(
                fieldInput,
                "cursor-default text-neutralPrimary-600",
              )}
            />
            <Lock
              className="size-4 shrink-0 text-neutralPrimary-400"
              aria-hidden
            />
          </div>
          <p id="categoryParentHint" className={hint}>
            Set when the category was created and can&apos;t be changed.
          </p>
        </div>
      )}

      {/* Status */}
      {showStatus && (
        <StatusField
          control={control}
          childrenCount={childrenCount}
          productCount={productCount}
          inactiveParent={inactiveParent}
        />
      )}

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <TextAreaField
          labelName="Description"
          name="description"
          placeholderText="A short line about what this category contains (optional)"
          control={control}
          trigger={trigger}
          rowNo={4}
          isLoading={isLoading}
          // Grows with the text up to ~6 lines (8 on sm+), then scrolls inside
          // so a long description never stretches the dialog
          textareaClassName="max-h-36 overflow-y-auto scrollbar-brand-field sm:max-h-44"
        />
        <p
          className={cn(
            "self-end text-xs tabular-nums",
            descriptionLength > CATEGORY_DESCRIPTION_MAX
              ? "text-destructive-500 font-medium"
              : "text-neutralPrimary-400",
          )}
          aria-live="polite"
        >
          {descriptionLength.toLocaleString()}/
          {CATEGORY_DESCRIPTION_MAX.toLocaleString()}
        </p>
      </div>
    </>
  );
}

function Slug({ children }: { children: React.ReactNode }) {
  return (
    <code className="break-all rounded bg-neutralPrimary-100 px-1 py-0.5 font-mono text-[11px] text-neutralPrimary-700">
      {children}
    </code>
  );
}

/** Status as option cards: every choice and its effect is visible at once. */
function StatusField({
  control,
  childrenCount,
  productCount,
  inactiveParent,
}: {
  control: Control<CategoryFormData>;
  childrenCount: number;
  productCount: number;
  inactiveParent?: string;
}) {
  const {
    field,
    fieldState: { error, isDirty },
  } = useController({ name: "status", control });
  const { defaultValues } = useFormState({ control });

  const options =
    defaultValues?.status === "ARCHIVED"
      ? [...STATUS_OPTIONS, ARCHIVED_OPTION]
      : STATUS_OPTIONS;

  // The server refuses ACTIVE -> INACTIVE while a subcategory or a product
  // under this category is still active. The counts here include inactive
  // ones, so this warns; the server has the final say.
  const deactivating = isDirty && field.value === "INACTIVE";
  const blockers = [
    childrenCount > 0 &&
      `its ${childrenCount} subcategor${childrenCount === 1 ? "y" : "ies"}`,
    productCount > 0 &&
      `its ${productCount} product${productCount === 1 ? "" : "s"}`,
  ].filter(Boolean);
  // An active category can't sit under an inactive one, so Active is locked
  // until the parent is active. A category already ACTIVE under an inactive
  // parent (data from before this rule) keeps the option.
  const activeLocked =
    inactiveParent !== undefined && defaultValues?.status !== "ACTIVE";
  const hiddenWithChildren =
    field.value && field.value !== "ACTIVE" && childrenCount > 0;

  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className={cn(fieldLabel, "mb-2")}>Status</legend>
      <RadioGroup
        value={field.value}
        onValueChange={field.onChange}
        className={cn(
          "grid grid-cols-1 gap-2 sm:gap-3",
          options.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
        )}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutralPrimary-300 bg-white p-3 transition-colors hover:border-greenPrimary-300 has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-neutralPrimary-50 has-[:disabled]:opacity-60 has-[:disabled]:hover:border-neutralPrimary-300 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-greenPrimary-500/15 has-[[data-state=checked]]:border-greenPrimary-500 has-[[data-state=checked]]:bg-greenPrimary-950/40 has-[[data-state=checked]]:ring-1 has-[[data-state=checked]]:ring-greenPrimary-500"
          >
            <RadioGroupItem
              value={option.value}
              disabled={activeLocked && option.value === "ACTIVE"}
              className="mt-0.5 size-[18px] border-neutralPrimary-400 data-[state=checked]:border-greenPrimary-500"
            />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-semibold text-neutralPrimary-800">
                {option.label}
              </span>
              <span className="text-xs text-neutralPrimary-500">
                {activeLocked && option.value === "ACTIVE"
                  ? "Parent is inactive"
                  : option.help}
              </span>
            </span>
          </label>
        ))}
      </RadioGroup>

      {error ? (
        <p className={fieldError} role="alert">
          {error.message}
        </p>
      ) : activeLocked ? (
        <p className={hint}>
          To make it active, first make its parent category &ldquo;
          {inactiveParent}&rdquo; active.
        </p>
      ) : deactivating && blockers.length > 0 ? (
        <p className="flex items-start gap-2 rounded-lg border border-warningPrimary-200 bg-warningPrimary-50 px-3 py-2 text-xs text-warningPrimary-800">
          <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden />
          <span>
            This saves only if none of {blockers.join(" and ")} is active. Make
            them inactive first.
          </span>
        </p>
      ) : hiddenWithChildren ? (
        <p className={hint}>
          Its {childrenCount} subcategor
          {childrenCount === 1 ? "y is" : "ies are"} hidden from the shop as
          well.
        </p>
      ) : null}
    </fieldset>
  );
}
