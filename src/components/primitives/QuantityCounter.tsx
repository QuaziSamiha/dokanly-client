import React from "react";

export interface IQuantityCounter {
  maxValue?: number;
  minValue?: number;
  value: number;
  valueChange: (newValue: number) => void;
}
export default function QuantityCounter({
  maxValue,
  minValue = 0,
  value,
  valueChange,
}: IQuantityCounter) {
  const handleIncrement = () => {
    if (maxValue === undefined || value < maxValue) {
      valueChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (minValue < value) {
      valueChange(value - 1);
    }
  };

  return (
    <div className="flex items-center gap-6 border border-greenPrimary-500 rounded text-neutralPrimary-800 font-semibold ">
      <button
        type="button"
        onClick={handleDecrement}
        className="px-4 py-2 cursor-pointer text-xl hover:bg-greenPrimary-500 hover:text-white border-r border-greenPrimary-500"
      >
        -
      </button>
      <div className="max-md:text-sm text-base flex items-center justify-center w-3">{value}</div>
      <button
        type="button"
        onClick={handleIncrement}
        className="px-4 py-2 cursor-pointer text-xl hover:bg-greenPrimary-500 hover:text-white border-l border-greenPrimary-500"
      >
        +
      </button>
    </div>
  );
}
