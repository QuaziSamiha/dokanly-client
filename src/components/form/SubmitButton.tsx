import { ISubmitButton } from "@/types";

const SubmitButton: React.FC<ISubmitButton> = ({
  submitTitle = "Submit",
  bgColor = "bg-greenPrimary-500",
  hoverBgColor = "hover:bg-greenPrimary-600",
  submittedForm,
  buttonWidth = "w-full",
  isPending
}) => {
  return (
    <div className={`${buttonWidth}`}>
      <button
        type="submit"
        form={submittedForm}
        disabled={isPending}
        className={`${buttonWidth} ${bgColor} ${hoverBgColor} appearance-none touch-manipulation inline-flex items-center justify-center h-11 px-6 rounded-lg text-white text-sm md:text-base font-semibold tracking-wide shadow-sm transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-greenPrimary-500/25 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100`}
      >
        {submitTitle}
      </button>
    </div>
  );
};

export default SubmitButton;
