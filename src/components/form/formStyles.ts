// Shared Tailwind class tokens for all form fields.
// Pure styling — keeps label, box, text and error visuals identical across inputs.

export const fieldLabel =
  "text-neutralPrimary-800 text-sm font-semibold tracking-[0.01em] pl-0.5";

export const requiredMark = "text-destructive-500 ml-0.5 text-sm font-semibold";

// 44px tall box shared by input, password, phone, select, date and file fields
export const fieldBox =
  "flex items-center gap-2.5 h-11 px-3.5 w-full bg-white border border-neutralPrimary-300 rounded-lg shadow-inputField transition-[border-color,box-shadow] duration-200 hover:border-neutralPrimary-400 focus-within:border-greenPrimary-500 focus-within:ring-4 focus-within:ring-greenPrimary-500/15 has-[:disabled]:bg-neutralPrimary-100 has-[:disabled]:hover:border-neutralPrimary-300 has-[:disabled]:cursor-not-allowed";

// Same look as fieldBox, for button-like triggers (select, date pickers)
export const fieldTrigger =
  "w-full h-11 px-3.5 bg-white text-sm font-normal text-neutralPrimary-800 border border-neutralPrimary-300 rounded-lg shadow-inputField transition-[border-color,box-shadow] duration-200 hover:bg-white hover:border-neutralPrimary-400 focus-visible:border-greenPrimary-500 focus-visible:ring-4 focus-visible:ring-greenPrimary-500/15 data-[state=open]:border-greenPrimary-500 data-[state=open]:ring-4 data-[state=open]:ring-greenPrimary-500/15 disabled:bg-neutralPrimary-100 disabled:opacity-100 disabled:cursor-not-allowed cursor-pointer";

export const fieldBoxError =
  "border-destructive-400 hover:border-destructive-500 focus-within:border-destructive-500 focus-within:ring-destructive-500/15";

export const fieldInput =
  "w-full bg-transparent outline-none text-sm font-normal text-neutralPrimary-800 placeholder:text-neutralPrimary-400 disabled:cursor-not-allowed disabled:text-neutralPrimary-500";

export const fieldIcon = "h-4 w-4 shrink-0 text-neutralPrimary-400";

export const fieldError = "text-destructive-500 text-xs font-medium pl-0.5";

// Selectable card used by radio-style fields
export const optionCard =
  "bg-white border border-neutralPrimary-300 rounded-xl p-5 max-md:p-4 transition-all duration-200 hover:border-greenPrimary-300 hover:shadow-neutral02 has-[[data-state=checked]]:border-greenPrimary-500 has-[[data-state=checked]]:bg-greenPrimary-950/40 has-[[data-state=checked]]:ring-1 has-[[data-state=checked]]:ring-greenPrimary-500";

export const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-greenPrimary-500 text-white text-sm font-semibold shadow-sm transition-colors duration-200 hover:bg-greenPrimary-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-greenPrimary-500/25 cursor-pointer";
