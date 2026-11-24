import React from 'react';
import { Controller } from 'react-hook-form';
import { IDateRangeInput } from '@/types';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { fieldError, fieldLabel, fieldTrigger, requiredMark } from './formStyles';

const DateRangeInput = <T extends Record<string, unknown>>({
  labelName,
  name,
  control,
  isRequired = false,
  disabled = false,
  requiredMessage = 'This field is required',
  placeholder = 'Select date range',
}: IDateRangeInput<T>) => {
  console.log(name, control);
  return (
    <div className="w-full flex flex-col gap-2">
      {labelName && (
        <div className="flex items-center">
          <label htmlFor={name} className={fieldLabel}>
            {labelName}
          </label>
          {isRequired && <span className={requiredMark}>*</span>}
        </div>
      )}
      
      <Controller
        name={name}
        control={control}
        rules={{ required: isRequired ? requiredMessage : false }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <div className="w-full">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    fieldTrigger,
                    "justify-start gap-2 text-left",
                    !value && "text-neutralPrimary-400 hover:text-neutralPrimary-400",
                    error && "border-destructive-400 hover:border-destructive-500"
                  )}
                  disabled={disabled}
                >
                  <CalendarIcon className="h-4 w-4 shrink-0 text-neutralPrimary-400" />
                  {(value as DateRange)?.from ? (
                    (value as DateRange).to ? (
                      <>
                        {format((value as DateRange).from!, "PPP")} - {format((value as DateRange).to!, "PPP")}
                      </>
                    ) : (
                      format((value as DateRange).from!, "PPP")
                    )
                  ) : (
                    <span>{placeholder}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl border-neutralPrimary-200 shadow-lg overflow-hidden" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={(value as DateRange)?.from}
                  selected={value as DateRange}
                  onSelect={onChange}
                  numberOfMonths={2}
                  disabled={disabled}
                />
              </PopoverContent>
            </Popover>
            
            {error && (
              <p className={`${fieldError} mt-1.5`}>{error.message}</p>
            )}
            
            {(value as DateRange)?.from && (
              <div className="mt-2 px-0.5 text-xs text-neutralPrimary-500 space-y-1">
                <p>
                  <span className="font-medium text-neutralPrimary-700">Start Date:</span> {(value as DateRange).from!.getDate()}/{(value as DateRange).from!.getMonth() + 1}/{(value as DateRange).from!.getFullYear()}
                </p>
                {(value as DateRange).to && (
                  <p>
                    <span className="font-medium text-neutralPrimary-700">End Date:</span> {(value as DateRange).to!.getDate()}/{(value as DateRange).to!.getMonth() + 1}/{(value as DateRange).to!.getFullYear()}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default DateRangeInput;