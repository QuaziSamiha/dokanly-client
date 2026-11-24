"use client";

import { useController, useFormContext } from "react-hook-form";
import { ProductFormData } from "@/modules/product/schemas/product.schema";

// On/off switch for "featured". Neutral grey when off: not featured is a normal
// state, not an error, so the shared red/green ToggleButton doesn't fit here.
export default function FeaturedSwitch() {
  const { control } = useFormContext<ProductFormData>();
  const {
    field: { value, onChange },
  } = useController({ name: "featured", control });
  const checked = !!value;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <label
          htmlFor="product-featured"
          className="cursor-pointer text-sm font-medium text-neutralPrimary-800"
        >
          Featured product
        </label>
        <p className="text-sm text-neutralPrimary-500">
          {checked
            ? "Shown in “Our Must-Haves” on the home page."
            : "Turn on to show it in “Our Must-Haves” on the home page."}
        </p>
      </div>
      <button
        id="product-featured"
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-greenPrimary-500/25 ${
          checked ? "bg-greenPrimary-500" : "bg-neutralPrimary-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
