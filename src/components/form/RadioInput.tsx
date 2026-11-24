"use client";

import { FieldValues, Path, PathValue } from "react-hook-form";
import { useController } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { IRadioField } from "@/types";
import { fieldError, fieldLabel, optionCard } from "./formStyles";

export function RadioInput<T extends FieldValues>({
  control,
  name,
  label,
  options,
  defaultValue,
  isRequired = false,
  requiredMessage = "This field is required",
}: IRadioField<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: isRequired ? { required: requiredMessage } : {},
    defaultValue: defaultValue as PathValue<T, Path<T>>,
  });

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className={fieldLabel}>
          {label}
          {/* {isRequired && <span className="text-destructive-500 ml-1">*</span>} */}
        </label>
      )}

      <RadioGroup
        value={field.value}
        onValueChange={field.onChange}
        className="flex flex-col gap-3"
      >
        {options.map((option, index) => (
          <div
            key={index}
            className={optionCard}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <label
                  key={option.value}
                  className={`flex items-center gap-3 cursor-pointer ${
                    option.disabled ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  <RadioGroupItem
                    value={option.value}
                    disabled={option.disabled}
                    className="size-[18px] border-neutralPrimary-400 data-[state=checked]:border-greenPrimary-500"
                  />
                  <div className="flex flex-col gap-1">
                    <p className="max-md:text-sm text-base text-neutralPrimary-800 font-semibold">
                      {option.label}
                    </p>
                    {option.description && (
                      <p className="max-md:text-xs text-sm text-neutralPrimary-500 font-normal">
                        {option.description}
                      </p>
                    )}
                  </div>
                </label>
              </div>
              <div>
                {option.extraInfo && (
                  <p className="text-neutralPrimary-800 max-md:text-sm text-base font-semibold whitespace-nowrap">
                    ৳ {option.extraInfo}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </RadioGroup>

      {error && (
        <p className={`${fieldError} mt-1`}>{error.message}</p>
      )}
    </div>
  );
}
