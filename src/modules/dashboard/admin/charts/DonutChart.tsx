"use client";

import React from "react";

export interface DonutSlice {
  key: string;
  label: string;
  value: number;
  color: string;
}

interface Props {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  active: string | null;
  onActiveChange: (key: string | null) => void;
  centerValue: React.ReactNode;
  centerLabel: React.ReactNode;
}

//* Part-to-whole ring. Segments are separated by a 2px surface gap rather than
//* an outline; the hovered segment grows outward slightly.
export default function DonutChart({
  slices,
  size = 200,
  thickness = 26,
  active,
  onActiveChange,
  centerValue,
  centerLabel,
}: Props) {
  const total = slices.reduce((a, s) => a + s.value, 0);
  const r = size / 2 - thickness / 2 - 4;
  const c = size / 2;
  const GAP = 2; // px of arc left as surface between segments

  let angle = -Math.PI / 2;
  const visible = slices.filter((s) => s.value > 0);
  const arcs = visible.map((s) => {
    const sweep = (s.value / total) * Math.PI * 2;
    const gapAngle = visible.length > 1 ? GAP / r : 0;
    const a0 = angle + gapAngle / 2;
    const a1 = angle + sweep - gapAngle / 2;
    angle += sweep;
    return { ...s, a0, a1, sweep };
  });

  const arcPath = (a0: number, a1: number, radius: number) => {
    if (a1 - a0 >= Math.PI * 2 - 0.0001) {
      // full ring: two half arcs
      return `M${c + radius},${c} A${radius},${radius} 0 1 1 ${c - radius},${c} A${radius},${radius} 0 1 1 ${c + radius},${c}`;
    }
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M${c + radius * Math.cos(a0)},${c + radius * Math.sin(a0)} A${radius},${radius} 0 ${large} 1 ${c + radius * Math.cos(a1)},${c + radius * Math.sin(a1)}`;
  };

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label="Order status distribution">
        <circle cx={c} cy={c} r={r} fill="none" stroke="#f3f4f6" strokeWidth={thickness} />
        {arcs.map((a) => {
          const isActive = active === a.key;
          const dim = active !== null && !isActive;
          return (
            <path
              key={a.key}
              d={arcPath(a.a0, a.a1, r)}
              fill="none"
              stroke={a.color}
              strokeWidth={isActive ? thickness + 6 : thickness}
              strokeLinecap="butt"
              opacity={dim ? 0.35 : 1}
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => onActiveChange(a.key)}
              onMouseLeave={() => onActiveChange(null)}
            >
              <title>{`${a.label}: ${a.value}`}</title>
            </path>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className="text-2xl font-bold text-neutralPrimary-800 leading-none">
          {centerValue}
        </span>
        <span className="text-[11px] text-neutralPrimary-500 mt-1 max-w-24">
          {centerLabel}
        </span>
      </div>
    </div>
  );
}
