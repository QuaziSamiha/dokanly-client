// components/feedback/placeholders/EmptyState.tsx
import { PackageOpen } from "lucide-react";

export const EmptyState = ({
  message = "No products found in this category",
}) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 w-full bg-neutralPrimary-50 rounded-xl border-2 border-dashed border-neutralPrimary-200 mt-6">
    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
      <PackageOpen className="w-12 h-12 text-neutralPrimary-300" />
    </div>
    <h3 className="text-xl font-semibold text-neutralPrimary-800">
      Coming Soon!
    </h3>
    <p className="text-neutralPrimary-500 text-center max-w-xs mt-2">
      {message}. Please check back later or explore our other categories.
    </p>
  </div>
);
