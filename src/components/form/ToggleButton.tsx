"use client";

import { useController, type FieldValues, type Path } from "react-hook-form";
import { motion } from "framer-motion";
import { IToggleButton } from "@/types";
import { fieldError, fieldLabel } from "./formStyles";

{
  /* <ToggleButton
          name="status"
          control={control}
          label="Active Status"
          activeLabel="Active"
          inactiveLabel="Inactive"
        /> */
}

export default function ToggleButton<T extends FieldValues>({
  name,
  control,
  label,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  disabled = false,
  classNames = "",
  defaultValue,
}: IToggleButton<T>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: (defaultValue ?? true) as import("react-hook-form").PathValue<
      T,
      Path<T>
    >,
  });

  const toggleActive = value as boolean;

  return (
    <div className={`flex flex-col gap-2 ${classNames}`}>
      {label && (
        <label className={fieldLabel}>
          {label}
        </label>
      )}

      <div className="flex items-center gap-3 pl-0.5">
        <button
          type="button"
          onClick={() => !disabled && onChange(!toggleActive)}
          disabled={disabled}
          className={`
            relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 
            ${
              toggleActive
                ? `bg-greenPrimary-500 shadow-inner focus:ring-greenPrimary-500/40`
                : `bg-destructive-400 shadow-inner focus:ring-destructive-400/40`
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
          aria-pressed={toggleActive}
        >
          <motion.span
            layout
            initial={false}
            animate={{
              x: toggleActive ? 24 : 2,
              scale: toggleActive ? 1.1 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
            className={`
              inline-block h-6 w-6 rounded-full shadow-md transform transition-all duration-300
              ${
                toggleActive
                  ? "bg-white ring-2 ring-greenPrimary-500/20"
                  : "bg-white ring-2 ring-destructive-500/20"
              }
            `}
          />

          {/* Ripple effect */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={
              toggleActive
                ? { scale: 1.5, opacity: 0 }
                : { scale: 0, opacity: 0 }
            }
            transition={{ duration: 0.1 }}
            className={`absolute inset-0 rounded-full opacity-20 ${
              toggleActive ? "bg-greenPrimary-500" : "bg-destructive-500"
            }`}
          />
        </button>

        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-semibold transition-colors duration-200 ${
              toggleActive ? "text-greenPrimary-600" : "text-destructive-500"
            }`}
          >
            {toggleActive ? activeLabel : inactiveLabel}
          </span>

          <motion.div
            animate={{
              scale: toggleActive ? 1 : 0,
              opacity: toggleActive ? 1 : 0,
            }}
            transition={{ duration: 0.1 }}
            className={`w-2 h-2 rounded-full ${
              toggleActive ? "bg-greenPrimary-500" : "bg-destructive-500"
            }`}
          />
        </div>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={fieldError}
        >
          {error.message}
        </motion.p>
      )}
    </div>
  );
}
