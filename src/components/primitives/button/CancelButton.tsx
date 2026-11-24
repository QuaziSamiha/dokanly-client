import React from "react";

interface ICancelButton {
  onClick?: () => void;
  label?: string; // optional custom label, defaults to "Cancel"
  className?: string;
}

const CancelButton = ({
  onClick,
  label = "Cancel",
  className = "",
}: ICancelButton) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border border-neutral-300 font-semibold text-base text-neutral-600 rounded-lg cursor-pointer px-5 py-2.5 hover:bg-neutral-100 transition-colors duration-200 ${className}`}
    >
      {label}
    </button>
  );
};

export default CancelButton;
