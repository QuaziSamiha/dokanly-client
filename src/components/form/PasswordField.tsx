"use client";

import { IPasswordField } from "@/types";
import { useState } from "react";
import { FieldValues, useController } from "react-hook-form";
import { BsFillEyeSlashFill } from "react-icons/bs";
import { FaEye } from "react-icons/fa";
import { cn } from "@/lib/utils";
import {
  fieldBox,
  fieldBoxError,
  fieldError,
  fieldInput,
  fieldLabel,
  requiredMark,
} from "./formStyles";

export default function PasswordField<T extends FieldValues>({
  labelName,
  placeholderText,
  name,
  control,
  trigger,
  disabled,
  isRequired,
  requiredMessage = "This field is required.",
}: IPasswordField<T>) {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const { field, fieldState } = useController<T>({
    name,
    control,
    rules: isRequired ? { required: requiredMessage } : {},
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    field.onChange(e.target.value);
    trigger?.(field.name);
  };

  return (
    <div className="flex flex-col gap-2 w-full relative">
      <label className={fieldLabel}>
        {labelName}
        {isRequired && !disabled && (
          <span className={requiredMark}>*</span>
        )}
      </label>
      <div
        className={cn(fieldBox, fieldState.error && !disabled && fieldBoxError)}
      >
        {/* <TbLockPause fontSize={20} className="text-blueActual" /> */}
        <input
          className={`${fieldInput} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
          type={`${showPassword ? "text" : "password"}`}
          placeholder={placeholderText}
          value={field.value ?? ""}
          onChange={handleChange}
          name={field.name}
          disabled={disabled}
        />
        {showPassword ? (
          <FaEye
            onClick={() => setShowPassword(false)}
            className="shrink-0 text-neutralPrimary-400 hover:text-neutralPrimary-600 transition-colors cursor-pointer"
            fontSize={18}
          />
        ) : (
          <BsFillEyeSlashFill
            onClick={() => setShowPassword(true)}
            className="shrink-0 text-neutralPrimary-400 hover:text-neutralPrimary-600 transition-colors cursor-pointer"
            fontSize={18}
          />
        )}
      </div>
      {fieldState.error && !disabled && (
        <p className={`${fieldError} absolute bottom-[-24px] left-0`}>
          {fieldState.error.message}
        </p>
      )}
    </div>
  );
}
