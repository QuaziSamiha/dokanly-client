"use client";

import { FieldValues, Path, PathValue } from "react-hook-form";
import { useController } from "react-hook-form";
import { RadioGroup } from "@/components/ui/radio-group";
import {
  IUserAddressRadioField,
  IUserAddressRadioOption,
} from "@/types";
import { formatEnumString } from "@/lib/utils/string.utils";
import { fieldError, fieldLabel } from "./formStyles";
export function UserAddressRadioField<T extends FieldValues>({
  control,
  name,
  label,
  options,
  defaultValue,
  isRequired = false,
  requiredMessage = "This field is required",
}: IUserAddressRadioField<T>) {
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
    <div className="flex flex-col gap-2 w-full">
      {label && <label className={fieldLabel}>{label}</label>}

      <RadioGroup
        value={field.value}
        onValueChange={field.onChange}
        className="flex flex-col gap-3"
      >
        {options.map((option: IUserAddressRadioOption, index: number) => {
          const isSelected = field.value === option.id;

          return (
            <div
              key={index}
              className={`border rounded-xl p-5 max-md:p-4 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-greenPrimary-500 bg-greenPrimary-950/40 ring-1 ring-greenPrimary-500"
                  : "bg-white border-neutralPrimary-300 hover:border-greenPrimary-300 hover:shadow-neutral02"
              }`}
              onClick={() => field.onChange(option.id)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 text-sm text-neutralPrimary-600">
                  <p
                    className={`font-semibold text-base mb-2 ${
                      isSelected ? "text-greenPrimary-700" : "text-neutralPrimary-800"
                    }`}
                  >
                    Address {index + 1}
                  </p>
                  <p>
                    <span className="font-medium text-neutralPrimary-800">Street:</span>{" "}
                    {option.street}
                  </p>
                  {option.state && (
                    <p>
                      <span className="font-medium text-neutralPrimary-800">Region/Division:</span>{" "}
                      {formatEnumString(option.state)}
                    </p>
                  )}
                  <p>
                    <span className="font-medium text-neutralPrimary-800">Zip Code:</span>{" "}
                    {option.zipCode}
                  </p>
                  <p>
                    <span className="font-medium text-neutralPrimary-800">City:</span> {option.city}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </RadioGroup>

      {error && (
        <p className={`${fieldError} mt-1`}>
          {error.message}
        </p>
      )}
    </div>
  );
}
// "use client";

// import { FieldValues, Path, PathValue } from "react-hook-form";
// import { useController } from "react-hook-form";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import {
//   IUserAddressRadioField,
//   IUserAddressRadioOption,
// } from "@/modules/checkout/public/DeliveryAddress";

// export function UserAddressRadioField<T extends FieldValues>({
//   control,
//   name,
//   label,
//   options,
//   defaultValue,
//   isRequired = false,
//   requiredMessage = "This field is required",
//   disabled,
// }: IUserAddressRadioField<T>) {
//   const {
//     field,
//     fieldState: { error },
//   } = useController({
//     name,
//     control,
//     rules: isRequired ? { required: requiredMessage } : {},
//     defaultValue: defaultValue as PathValue<T, Path<T>>,
//   });

//   return (
//     <div className="flex flex-col gap-2">
//       {label && <label className="text-sm font-medium">{label}</label>}

//       <RadioGroup
//         value={field.value}
//         onValueChange={field.onChange}
//         className="flex flex-col gap-4"
//       >
//         {options.map((option: IUserAddressRadioOption, index: number) => {
//           //   console.log(option);
//           return (
//             <div
//               key={index}
//               className="border border-neutralPrimary-300 max-md:py-4 p-6 rounded-2xl"
//             >
//               <div className="flex items-start justify-between">
//                 <div>
//                   <label
//                     key={option.id}
//                     className={`flex items-center gap-3 cursor-pointer ${
//                       disabled ? "opacity-50 cursor-not-allowed" : ""
//                     }`}
//                   >
//                     <RadioGroupItem
//                       value={String(option.id)}
//                       disabled={disabled}
//                     />
//                     <div className="space-y-1 text-sm text-neutralPrimary-700">
//                       <p className="text-neutralPrimary-900 font-semibold text-base mb-2">
//                         Address {index + 1}
//                       </p>
//                       <p>
//                         <span className="font-medium">Street:</span>{" "}
//                         {option.street}
//                       </p>

//                       {option.state && (
//                         <p>
//                           <span className="font-medium">Region:</span>{" "}
//                           {option.state}
//                         </p>
//                       )}
//                       <p>
//                         <span className="font-medium">Zip Code:</span>{" "}
//                         {option.zipCode}
//                       </p>
//                       <p>
//                         <span className="font-medium">City:</span> {option.city}
//                       </p>
//                       {option.country && (
//                         <p>
//                           <span className="font-medium">Country:</span>{" "}
//                           {option.country}
//                         </p>
//                       )}
//                     </div>
//                   </label>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </RadioGroup>

//       {error && (
//         <p className="text-destructive-500 text-xs font-medium mt-1">
//           {error.message}
//         </p>
//       )}
//     </div>
//   );
// }
