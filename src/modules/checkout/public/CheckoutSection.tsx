import React from "react";

/** A numbered checkout step card: "1 Contact information", "2 Delivery address"… */
export default function CheckoutSection({
  id,
  step,
  title,
  description,
  aside,
  children,
}: {
  id: string;
  step: number;
  title: string;
  description?: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="w-full scroll-mt-32 rounded-2xl border border-neutralPrimary-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-greenPrimary-500 text-sm font-bold text-white">
            {step}
          </span>
          <div>
            <h2
              id={`${id}-title`}
              className="text-lg font-bold leading-7 text-neutralPrimary-800 sm:text-xl"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-sm text-neutralPrimary-500">{description}</p>
            )}
          </div>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}
