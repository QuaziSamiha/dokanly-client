"use client";

import * as React from "react";
import { useController, FieldValues } from "react-hook-form";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IDateInputField } from "@/types";
import { cn } from "@/lib/utils";
import { fieldError, fieldLabel, fieldTrigger, requiredMark } from "./formStyles";

export default function DateInputField<T extends FieldValues>({
  name,
  control,
  label = "Select Date",
  placeholder = "Pick a date",
  disabled = false,
  isRequired = false,
}: IDateInputField<T>) {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const [open, setOpen] = React.useState(false);

  // Format date for display
  const formatDisplayDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      });
    } catch {
      return "Invalid date";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Label */}
      <label
        htmlFor={name}
        className={fieldLabel}
      >
        {label}
        {isRequired && !disabled && (
          <span className={requiredMark}>*</span>
        )}
      </label>

      {/* Calendar Popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            id={name}
            className={cn(
              fieldTrigger,
              "justify-between",
              value
                ? "hover:text-neutralPrimary-800"
                : "text-neutralPrimary-400 hover:text-neutralPrimary-400",
              error && "border-destructive-400 hover:border-destructive-500"
            )}
            disabled={disabled}
          >
            {value ? formatDisplayDate(value) : placeholder}
            <CalendarIcon className="ml-2 h-4 w-4 shrink-0 text-neutralPrimary-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 rounded-xl border-neutralPrimary-200 shadow-lg overflow-hidden"
          align="start"
        >
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(selectedDate) => {
              if (selectedDate) {
                // Create UTC midnight
                const utcMidnight = new Date(
                  Date.UTC(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    selectedDate.getDate(),
                    0,
                    0,
                    0,
                    0,
                  ),
                );

                onChange(utcMidnight.toISOString());
                setOpen(false);
              }
            }}
            // FIXED: Properly disable past dates
            disabled={(date) => {
              // Get today's date at UTC midnight
              const today = new Date();
              const todayUTC = new Date(
                Date.UTC(
                  today.getUTCFullYear(),
                  today.getUTCMonth(),
                  today.getUTCDate(),
                  0,
                  0,
                  0,
                  0,
                ),
              );

              // Compare the dates (without time)
              const compareDate = new Date(
                Date.UTC(
                  date.getFullYear(),
                  date.getMonth(),
                  date.getDate(),
                  0,
                  0,
                  0,
                  0,
                ),
              );

              return compareDate < todayUTC;
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {error && (
        <p className={fieldError}>
          {error.message}
        </p>
      )}
    </div>
  );
}
// "use client";

// import * as React from "react";
// import { useController, FieldValues } from "react-hook-form";
// import { CalendarIcon } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { IDateInputField } from "@/types";

// export default function DateInputField<T extends FieldValues>({
//   name,
//   control,
//   label = "Select Date",
//   placeholder = "Pick a date",
//   disabled = false,
//   isRequired = false,
// }: IDateInputField<T>) {
//   const {
//     field: { value, onChange },
//     fieldState: { error },
//   } = useController({
//     name,
//     control,
//   });

//   const [open, setOpen] = React.useState(false);

//   return (
//     <div className="flex flex-col gap-2">
//       {/* Label */}
//       <label
//         htmlFor={name}
//         className="text-neutralPrimary-800 text-sm font-semibold md:pl-2"
//       >
//         {label}
//         {isRequired && !disabled && (
//           <span className="text-destructive-500 px-0.5 text-base">*</span>
//         )}
//       </label>

//       {/* Calendar Popover */}
//       <Popover open={open} onOpenChange={setOpen}>
//         <PopoverTrigger asChild>
//           <Button
//             variant={"outline"}
//             // variant={error ? "destructive" : "outline"}
//             id={name}
//             className={`w-full justify-between font-normal disabled:cursor-not-allowed cursor-pointer border border-neutralPrimary-300 rounded-md shadow-inputField py-2.5 px-3`}
//             // className={`w-full justify-between font-normal cursor-pointer ${
//             //   error ? "border-destructive-500" : ""
//             // }`}
//             disabled={disabled}
//           >
//             {value ? new Date(value).toLocaleDateString() : placeholder}
//             <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
//           </Button>
//         </PopoverTrigger>
//         <PopoverContent className="w-auto p-0" align="start">
//           <Calendar
//             mode="single"
//             selected={value ? new Date(value) : undefined}
//             onSelect={(selectedDate) => {
//               if (selectedDate) {
//                 const localMidnight = new Date(
//                   selectedDate.getFullYear(),
//                   selectedDate.getMonth(),
//                   selectedDate.getDate(),
//                   0,
//                   0,
//                   0,
//                   0,
//                 );

//                 // Convert to ISO string
//                 onChange(localMidnight.toISOString());
//                 // onChange(selectedDate.toISOString());
//                 setOpen(false);
//               }
//             }}
//             // Disable past dates
//             disabled={(date) =>
//               date < new Date(new Date().setHours(0, 0, 0, 0))
//             }
//             initialFocus
//           />
//         </PopoverContent>
//       </Popover>

//       {error && (
//         <p className="text-destructive-500 text-xs font-medium mt-1 pl-1">
//           {error.message}
//         </p>
//       )}
//     </div>
//   );
// }

// ? ============= INFORMATION ==============
// The date format 2026-01-24T18:00:00.000Z is ISO 8601 format (also known as UTC format or Zulu time).

// Breaking it down:
// 2026 - Year

// 01 - Month (January)

// 24 - Day

// T - Separator between date and time

// 18 - Hour (24-hour format)

// 00 - Minutes

// 00 - Seconds

// .000 - Milliseconds

// Z - Zulu time indicator (means UTC time zone, GMT+0)

// In human-readable terms:
// Date: January 24, 2026

// Time: 6:00:00 PM (18:00)

// Time Zone: UTC (Coordinated Universal Time)

// If you're in Bangladesh (GMT+6), this would be:
// Local Time: January 25, 2026, 12:00:00 AM (midnight)

// Because UTC+6 = 18:00 + 6 hours = 00:00 next day

// Key points:
// ISO 8601 is the international standard for date/time representation

// The T separates date from time

// The Z means UTC (no timezone offset)

// It's machine-readable and human-readable

// Most programming languages and databases handle this format natively
