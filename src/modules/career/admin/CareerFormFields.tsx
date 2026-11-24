"use client";

import React from "react";
import { Control, UseFormTrigger, useController } from "react-hook-form";
import { Briefcase, CalendarClock, FileText, MapPin } from "lucide-react";
import DateInputField from "@/components/form/DateInputField";
import InputField from "@/components/form/InputField";
import SingleSelectSearch from "@/components/form/SingleSelectSearch";
import { TextEditor } from "@/components/form/TextEditor";
import { fieldError, fieldLabel } from "@/components/form/formStyles";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { FieldHint, FormSection } from "@/modules/promotion/admin/PromotionFormParts";
import {
  JOB_LOCATION_TYPE_OPTIONS,
  JOB_TYPE_OPTIONS,
} from "../constants/career.constants";
import { UpdateCareerType } from "../schemas/career.schema";

interface ICareerFormFields {
  // * Both forms share these field names; the edit schema is the superset.
  control: Control<UpdateCareerType>;
  trigger: UseFormTrigger<UpdateCareerType>;
  /** Edit form only: lets the admin switch a job between ACTIVE and INACTIVE. */
  showStatus?: boolean;
}

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active", help: "Shown on the careers page until the deadline" },
  { value: "INACTIVE", label: "Inactive", help: "Hidden from the careers page" },
] as const;

/** The fields of the add and edit job forms, grouped the way the job page shows them. */
export default function CareerFormFields({
  control,
  trigger,
  showStatus = false,
}: ICareerFormFields) {
  return (
    <div className="flex w-full flex-col gap-4">
      <FormSection
        icon={<Briefcase size={15} />}
        title="Role"
        description="The title and type of work, shown at the top of the job page."
      >
        <div className="md:col-span-2">
          <InputField
            labelName="Position"
            placeholderText="e.g. Digital Marketing Executive"
            name="position"
            control={control}
            trigger={trigger}
            isRequired
          />
        </div>
        <SingleSelectSearch
          labelName="Job type"
          name="jobType"
          control={control}
          options={JOB_TYPE_OPTIONS}
          isRequired
        />
        <SingleSelectSearch
          labelName="Work mode"
          name="jobLocationType"
          control={control}
          options={JOB_LOCATION_TYPE_OPTIONS}
        />
      </FormSection>

      <FormSection icon={<MapPin size={15} />} title="Location & pay">
        <InputField
          labelName="Location"
          placeholderText="e.g. Uttara, Dhaka"
          name="location"
          control={control}
          trigger={trigger}
          isRequired
        />
        <InputField
          labelName="Salary"
          placeholderText="e.g. 25,000 - 30,000 BDT"
          name="salary"
          control={control}
          trigger={trigger}
        />
        <FieldHint>Leave the salary blank to show it as Negotiable.</FieldHint>
      </FormSection>

      <FormSection
        icon={<CalendarClock size={15} />}
        title="Publishing"
        description="The job stays on the careers page until the end of the deadline day."
      >
        <DateInputField
          name="deadline"
          control={control}
          label="Application deadline"
          isRequired
        />
        {showStatus && <StatusField control={control} />}
      </FormSection>

      <FormSection
        icon={<FileText size={15} />}
        title="Job description"
        description="Shown on the job page in this order. Overview and benefits are optional."
      >
        <div className="md:col-span-2">
          <TextEditor labelName="Overview" name="overview" control={control} trigger={trigger} />
        </div>
        <div className="md:col-span-2">
          <TextEditor
            labelName="Responsibilities"
            name="responsibilities"
            control={control}
            trigger={trigger}
            isRequired
          />
        </div>
        <div className="md:col-span-2">
          <TextEditor
            labelName="Requirements"
            name="requirements"
            control={control}
            trigger={trigger}
            isRequired
          />
        </div>
        <div className="md:col-span-2">
          <TextEditor
            labelName="Benefits / facilities"
            name="facilities"
            control={control}
            trigger={trigger}
          />
        </div>
      </FormSection>
    </div>
  );
}

/** Status as option cards, matching the category form: both choices and their effect at once. */
function StatusField({ control }: { control: Control<UpdateCareerType> }) {
  const {
    field,
    fieldState: { error },
  } = useController({ name: "status", control });

  return (
    <fieldset className="flex min-w-0 flex-col gap-2 md:col-span-2">
      <legend className={cn(fieldLabel, "mb-2")}>Status</legend>
      <RadioGroup
        value={field.value}
        onValueChange={field.onChange}
        className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3"
      >
        {STATUS_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutralPrimary-300 bg-white p-3 transition-colors hover:border-greenPrimary-300 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-greenPrimary-500/15 has-[[data-state=checked]]:border-greenPrimary-500 has-[[data-state=checked]]:bg-greenPrimary-950/40 has-[[data-state=checked]]:ring-1 has-[[data-state=checked]]:ring-greenPrimary-500"
          >
            <RadioGroupItem
              value={option.value}
              className="mt-0.5 size-[18px] border-neutralPrimary-400 data-[state=checked]:border-greenPrimary-500"
            />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-semibold text-neutralPrimary-800">{option.label}</span>
              <span className="text-xs text-neutralPrimary-500">{option.help}</span>
            </span>
          </label>
        ))}
      </RadioGroup>
      {error && (
        <p className={fieldError} role="alert">
          {error.message}
        </p>
      )}
    </fieldset>
  );
}
