import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import React from "react";

interface Props {
  change: number | null;
  //* false for metrics where a rise is bad (cancellations, delivery time)
  goodWhenUp?: boolean;
  //* "pp" for rate KPIs, whose change is in percentage points
  unit?: "%" | "pp";
  vs?: string;
  tone?: "light" | "onColor";
  className?: string;
}

//* Signed change vs previous period. Direction is shown by arrow + sign, so it
//* never relies on colour alone.
export default function Delta({
  change,
  goodWhenUp = true,
  unit = "%",
  vs,
  tone = "light",
  className,
}: Props) {
  if (change === null) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-xs",
          tone === "onColor" ? "text-white/70" : "text-neutralPrimary-400",
          className,
        )}
      >
        <Minus className="h-3 w-3" /> No prior data
      </span>
    );
  }

  const flat = Math.abs(change) < 0.05;
  const up = change > 0;
  const good = flat ? null : up === goodWhenUp;
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;

  const palette =
    tone === "onColor"
      ? "bg-white/20 text-white"
      : good === null
        ? "bg-neutralPrimary-100 text-neutralPrimary-600"
        : good
          ? "bg-green-50 text-green-700"
          : "bg-red-50 text-red-700";

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold tabular-nums",
          palette,
        )}
      >
        <Icon className="h-3 w-3" />
        {up ? "+" : ""}
        {change.toFixed(1).replace(/\.0$/, "")}
        {unit}
      </span>
      {vs && (
        <span className={tone === "onColor" ? "text-white/75" : "text-neutralPrimary-400"}>
          vs {vs}
        </span>
      )}
    </span>
  );
}
