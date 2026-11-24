import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ISingleCheckboxInput } from "@/types";
import { fieldError, requiredMark } from "./formStyles";
import { useEffect } from "react";
import { Controller, FieldValues, Path, PathValue } from "react-hook-form";

export const CheckboxField = <T extends FieldValues>({
  name,
  label,
  description,
  disabled = false,
  className = "",
  required = false,
  control,
  setValue,
  getValues,
  defaultChecked = false,
}: ISingleCheckboxInput<T>) => {
  useEffect(() => {
    if (getValues(name) === undefined && defaultChecked !== undefined) {
      setValue(name, defaultChecked as PathValue<T, Path<T>>);
    }
  }, [name, defaultChecked, setValue, getValues]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        // console.log(field.name , ':', field.value)
        return (
          <div className={`flex items-start gap-2.5 ${className}`}>
            <Checkbox
              id={name}
              checked={
                typeof field.value === "number"
                  ? Boolean(field.value)
                  : field.value ?? defaultChecked
              }
              onCheckedChange={field.onChange}
              disabled={disabled}
              aria-required={required}
              className={`mt-0.5 size-[18px] rounded-[5px] border-neutralPrimary-400 cursor-pointer transition-colors ${error ? "border-destructive-500" : ""}`}
            />
            <div className="grid gap-1 leading-none pt-px">
              {label && (
                <Label
                  htmlFor={name}
                  className={`${
                    disabled
                      ? "hover:cursor-not-allowed"
                      : "hover:cursor-pointer"
                  } text-sm font-medium leading-5 text-neutralPrimary-700`}
                >
                  {label}
                  {required && <span className={requiredMark}>*</span>}
                </Label>
              )}
              {description && (
                <p className="text-xs leading-relaxed text-neutralPrimary-500">{description}</p>
              )}
              {error && (
                <p className={fieldError}>{error.message}</p>
              )}
            </div>
          </div>
        );
      }}
    />
  );
};