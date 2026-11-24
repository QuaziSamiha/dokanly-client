import { Textarea } from "@/components/ui/textarea";
import { ITextArea } from "@/types";
import { FieldValues, Path, PathValue, useController } from "react-hook-form";
import { cn } from "@/lib/utils";
import { fieldError, fieldLabel, requiredMark } from "./formStyles";

const TextAreaField = <T extends FieldValues>({
  labelName,
  placeholderText,
  name,
  control,
  trigger,
  rowNo = 8,
  isRequired,
  disabled,
  defaultValue,
  requiredMessage = "This field is required.",
  isLoading = false,
  textareaClassName,
}: ITextArea<T>) => {
  const { field, fieldState } = useController<T>({
    name: name as Path<T>,
    control,
    rules: isRequired ? { required: requiredMessage } : {},
    defaultValue: defaultValue as PathValue<T, Path<T>>,
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    field.onChange(e.target.value);
    if (trigger) {
      trigger(field.name);
    }
  };

  // 🦴 Skeleton Loader
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 w-full animate-pulse">
        <div className="h-4 w-1/3 bg-neutralPrimary-100 rounded"></div>
        <div
          className="w-full bg-neutralPrimary-100 rounded-lg"
          style={{ height: rowNo * 20 + 22 }}
        ></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full relative">
      <label className={fieldLabel}>
        {labelName}
        {isRequired && !disabled && (
          <span className={requiredMark}>*</span>
        )}
      </label>

      <Textarea
        id={String(name)}
        placeholder={placeholderText}
        disabled={disabled}
        name={field.name}
        value={field.value ?? ""}
        onChange={handleChange}
        rows={rowNo}
        className={cn(
          "w-full resize-none rounded-lg border border-neutralPrimary-300 bg-white px-3.5 py-2.5 text-sm md:text-sm leading-5 font-normal text-neutralPrimary-800 placeholder:text-neutralPrimary-400 shadow-inputField transition-[border-color,box-shadow] duration-200 hover:border-neutralPrimary-400 focus-visible:border-greenPrimary-500 focus-visible:ring-4 focus-visible:ring-greenPrimary-500/15 disabled:bg-neutralPrimary-100 disabled:opacity-100 disabled:text-neutralPrimary-500 scrollbar",
          fieldState?.error &&
            !disabled &&
            "border-destructive-400 hover:border-destructive-500 focus-visible:border-destructive-500 focus-visible:ring-destructive-500/15",
          textareaClassName
        )}
      />

      {/* Error Message */}
      {fieldState?.error && !disabled && (
        <p className={`${fieldError} absolute bottom-[-24px] left-0`}>
          {fieldState?.error?.message}
        </p>
      )}
    </div>
  );
};

export default TextAreaField;

// import { Textarea } from "@/components/ui/textarea";
// import { ITextArea } from "@/types";
// import { FieldValues, Path, PathValue, useController } from "react-hook-form";
// const TextAreaField = <T extends FieldValues>({
//   labelName,
//   placeholderText,
//   name,
//   control,
//   trigger,
//   rowNo = 8,
//   isRequired,
//   disabled,
//   defaultValue,
//   requiredMessage = "This field is required.",
//   isLoading = false,
// }: ITextArea<T>) => {
//   const { field, fieldState } = useController<T>({
//     name: name as Path<T>,
//     control,
//     rules: isRequired ? { required: requiredMessage } : {},
//     defaultValue: defaultValue as PathValue<T, Path<T>>,
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     field.onChange(e.target.value);
//     if (trigger) {
//       trigger(field.name);
//     }
//   };

//   return (
//     <div className="flex flex-col gap-2 w-full relative">
//       <label className="text-neutralPrimary-800 font-semibold text-sm pl-2">
//         {labelName}
//         {isRequired && !disabled && (
//           <span className="text-red-500 text-base px-0.5">*</span>
//         )}{" "}
//       </label>

//       <Textarea
//         id={String(name)}
//         placeholder={placeholderText}
//         disabled={disabled}
//         name={field.name}
//         value={field.value ?? ""}
//         onChange={handleChange}
//         rows={rowNo}
//         className={`w-full border rounded-md p-2 resize-none`}
//       />
//       {fieldState?.error && !disabled && (
//         <p className="text-red-500 text-sm pl-2 absolute bottom-[-24px] left-0">
//           {fieldState?.error?.message}
//         </p>
//       )}
//     </div>
//   );
// };

// export default TextAreaField;
