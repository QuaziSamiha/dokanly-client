import { useState, useEffect, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FieldValues, Path, PathValue, useController } from "react-hook-form";
import { Search } from "lucide-react";
import { ISingleSelectSearch } from "@/types";
import { cn } from "@/lib/utils";
import { fieldError, fieldLabel, fieldTrigger, requiredMark } from "./formStyles";

const SingleSelectSearch = <T extends FieldValues>({
  labelName,
  name,
  options = [],
  control,
  isRequired = false,
  isLoading = false,
  defaultValue,
  isDisabled = false,
  placeholder,
  onSelectionChange,
}: ISingleSelectSearch<T>) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController<T>({
    name: name as Path<T>,
    control,
    rules: { required: isRequired ? "This field is required" : false },
    defaultValue: defaultValue as PathValue<T, Path<T>>,
  });

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    return options.filter((option) =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 w-full relative">
        <label className={fieldLabel}>
          {labelName}
          {isRequired && (
            <span className={requiredMark}>*</span>
          )}
        </label>

        {isLoading ? (
          <Skeleton className="w-full h-11 rounded-lg" />
        ) : (
          <>
            <Select
              open={isOpen}
              onOpenChange={setIsOpen}
              value={value ? String(value) : ""}
              onValueChange={(selectedValue) => {
                // Radix echoes "" from its hidden native <select> when the
                // value changes (e.g. a form `reset`) before the matching
                // option has registered. No item can have an empty value, so
                // "" is never a real pick — ignoring it keeps the loaded value.
                if (selectedValue === "") return;
                onChange(selectedValue);
                if (onSelectionChange) {
                  const selectedOption = options.find(
                    (opt) => String(opt.id) === selectedValue
                  );
                  if (selectedOption) {
                    onSelectionChange(selectedValue, selectedOption.name);
                  }
                }
              }}
            >
              <SelectTrigger
                disabled={isDisabled}
                className={cn(
                  fieldTrigger,
                  "data-[size=default]:h-11 py-0 flex items-center gap-2 overflow-hidden data-[placeholder]:text-neutralPrimary-400",
                  error && "border-destructive-400 hover:border-destructive-500"
                )}
              >
                <SelectValue placeholder={placeholder ?? labelName} />
              </SelectTrigger>

              <SelectContent className="z-50 p-0 absolute min-w-full bg-white border border-neutralPrimary-200 rounded-lg shadow-lg">
                {/* Search Bar */}
                <div className="p-1.5 border-b border-neutralPrimary-200 sticky top-0 bg-white z-10">
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-neutralPrimary-400 pointer-events-none"
                    />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full h-9 pl-8 pr-2.5 rounded-md bg-neutralPrimary-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-greenPrimary-500/20 text-sm text-neutralPrimary-800 placeholder:text-neutralPrimary-400 transition-colors"
                      value={searchTerm}
                      onChange={(e) => {
                        e.stopPropagation();
                        setSearchTerm(e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDownCapture={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                {/* Filtered Options */}
                <div className="max-h-60 overflow-y-auto scrollbar p-1">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                      <SelectItem
                        key={option.id}
                        value={String(option.id)}
                        className={`cursor-pointer rounded-md px-2.5 py-2 my-0.5 text-sm transition-colors ${
                          String(value) === String(option.id)
                            ? "bg-greenPrimary-950 text-greenPrimary-700 font-medium focus:bg-greenPrimary-950 focus:text-greenPrimary-700"
                            : "text-neutralPrimary-700 hover:bg-neutralPrimary-100 focus:bg-neutralPrimary-100"
                        }`}
                      >
                        {option.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-sm text-neutralPrimary-500 text-center">
                      No options found
                    </div>
                  )}
                </div>
              </SelectContent>
            </Select>

            {error && (
              <p className={`${fieldError} absolute bottom-[-24px] left-0`}>
                {error.message}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SingleSelectSearch;
