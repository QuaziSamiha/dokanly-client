import React from "react";

// One card of the product form: a heading, an optional one-line hint, and the fields.
export default function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6 rounded-lg border border-neutralPrimary-200 bg-white p-5 shadow-neutral02 sm:p-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-neutralPrimary-800">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-neutralPrimary-500">{description}</p>
        )}
      </header>
      {children}
    </section>
  );
}
