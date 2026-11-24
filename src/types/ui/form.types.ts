import { ReactNode } from "react";
import {
  Control,
  FieldValues,
  Path,
  PathValue,
  UseFormTrigger,
} from "react-hook-form";
import { IconType } from "react-icons/lib";

// ============= THIS INPUT FIELD IS USEFUL FOR USE-FIELD-ARRAY ===================
export interface IInputField<
  T extends FieldValues,
  Type extends "text" | "number" | "email",
> {
  labelName?: string;
  inputType?: Type;
  IconComponent?: IconType | undefined;
  placeholderText?: string;
  name: Path<T>;
  control?: Control<T>;
  trigger?: UseFormTrigger<T>;
  disabled?: boolean;
  isLoading?: boolean;
  isRequired?: boolean;
  defaultValue?: Type extends "number" ? number : string;
  requiredMessage?: string;
  autoFocus?: boolean; // Add this line
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void; // Add this
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  // Error takes its own space below the input instead of floating over the
  // gap, so a message that wraps on a narrow screen can't cover the next field.
  inlineError?: boolean;
}

// ============= PASSWORD FIELD ===================
export interface IPasswordField<T extends FieldValues> {
  labelName?: string;
  placeholderText: string;
  name: Path<T>;
  control?: Control<T>;
  trigger?: UseFormTrigger<T>;
  disabled?: boolean;
  isRequired?: boolean;
  requiredMessage?: string;
}

// ========= FORM SUBMIT BUTTON ==========
export interface ISubmitButton {
  submitTitle: string;
  bgColor?: string;
  hoverBgColor?: string;
  submittedForm?: string;
  buttonWidth?: string;
  isPending?: boolean;
}

// ========== FOR SINGLE CHECKBOX ================
export interface ISingleCheckboxInput<T extends FieldValues> {
  name: Path<T>;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  control: Control<T>;
  setValue: (name: Path<T>, value: PathValue<T, Path<T>>) => void;
  getValues: (name: Path<T>) => PathValue<T, Path<T>>;
  required?: boolean;
  defaultChecked?: boolean;
}

// ============= TEXTAREA ===========
export interface ITextArea<T extends FieldValues> {
  labelName?: string;
  inputType?: string;
  placeholderText: string;
  rowNo?: number;
  name: Path<T>;
  control: Control<T>;
  trigger?: UseFormTrigger<T>;
  disabled?: boolean;
  isRequired?: boolean;
  defaultValue?: string;
  requiredMessage?: string;
  isLoading?: boolean;
  /** Extra classes for the <textarea>, e.g. a max height so it scrolls. */
  textareaClassName?: string;
}

// =============== SELECT SINGLE ITEM INPUT FIELD, THERE WILL BE SEARCH OPTION ===================
export interface ISingleSelectOption {
  id: string | number;
  name: string;
}

export interface ISingleSelectSearch<T extends FieldValues> {
  labelName: string;
  name: Path<T>;
  options: ISingleSelectOption[];
  control: Control<T>;
  isRequired?: boolean;
  isLoading?: boolean;
  defaultValue?: PathValue<T, Path<T>>;
  isDisabled?: boolean;
  /** Shown while nothing is selected; defaults to `labelName`. */
  placeholder?: string;
  onSelectionChange?: (id: string, name: string) => void;
}

// =============== PHONE NO INPUT FIELD =======================
export interface IPhoneInputField<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  isRequired?: boolean;
  requiredMessage?: string;
  disabled?: boolean;
  isLoading?: boolean;
  // Same as IInputField.inlineError.
  inlineError?: boolean;
}

// ================ RADIO INPUT FIELDs ======================
export interface IRadioOption {
  label: string;
  value: string;
  description?: string;
  extraInfo?: string | number;
  disabled?: boolean;
}

export interface IRadioField<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  options: IRadioOption[];
  defaultValue?: string | number;
  isRequired?: boolean;
  requiredMessage?: string;
}

export interface IDeliveryMethodRadioOption {
  label: string; // region
  value: string; // delivery_method
  deliveryCharge: number; // base charge
  estimatedDays: number; // estimated days
  disabled?: boolean;
}

export interface IDeliveryMethodRadioField<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  options: IDeliveryMethodRadioOption[];
  defaultValue?: string | number;
  isRequired?: boolean;
  disabled?: boolean;
  requiredMessage?: string;
}

export interface IUserAddressRadioOption {
  label?: string; // region
  id: number; // address id - value
  street: string;
  state?: string | null; // region (division); null for some older addresses
  zipCode: string;
  city: string;
  country?: string | null;
  disabled?: boolean;
}

export interface IUserAddressRadioField<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  options: IUserAddressRadioOption[];
  defaultValue?: number;
  isRequired?: boolean;
  requiredMessage?: string;
  disabled?: boolean;
}

// ================ DATE RANGE INPUT FIELD ======================
export interface IDateRangeInput<T extends FieldValues> {
  labelName?: string;
  name: Path<T>;
  control: Control<T>;
  trigger?: UseFormTrigger<T>;
  isRequired?: boolean;
  disabled?: boolean;
  requiredMessage?: string;
  placeholder?: string;
}

// Define the backend image interface
export type TImageInput =
  | File
  | string
  | IImagePreview
  | { filePath: string; name: string; attachId?: number };

export interface IImagePreview {
  attachId: number;
  filePath: string;
  fileSize: number;
  mimeType: string;
  name?: string;
}

export interface IImageInput<T extends FieldValues> {
  label: string;
  name: Path<T>;
  control: Control<T>;
  isRequired?: boolean;
  maxFileSize?: number;
  multiple?: boolean;
  onEdit?: (image: TImageInput, index: number) => void;
  onRemoveImage?: (attachId: number) => void;
}

export interface IToggleButton<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string | ReactNode;
  activeLabel?: string;
  inactiveLabel?: string;
  disabled?: boolean;
  classNames?: string;
  defaultValue?: boolean;
}

export interface IDateInputField<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  isRequired?: boolean;
  isLoading?: boolean;
}

export interface ITextEditor<T extends FieldValues> {
  labelName?: string;
  placeholderText?: string;
  name: Path<T>;
  control: Control<T>;
  trigger?: UseFormTrigger<T>;
  disabled?: boolean;
  isRequired?: boolean;
  defaultValue?: string;
  requiredMessage?: string;
  isLoading?: boolean;
  compact?: boolean; // shorter editing area, for one- or two-line text
}
