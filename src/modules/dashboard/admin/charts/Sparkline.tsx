"use client";

import React, { useId } from "react";

interface Props {
  values: number[];
  color?: string;
  height?: number;
  className?: string;
}

//* Decorative trend line for KPI tiles. The tile's number and delta carry the
//* data, so this is aria-hidden.
export default function Sparkline({
  values,
  color = "currentColor",
  height = 40,
  className,
}: Props) {
  const gid = useId();
  const W = 100;
  if (values.length < 2 || values.every((v) => v === 0)) {
    return (
      <svg viewBox={`0 0 ${W} ${height}`} className={className} aria-hidden>
        <line
          x1={0}
          x2={W}
          y1={height - 2}
          y2={height - 2}
          stroke={color}
          strokeOpacity={0.35}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  const max = Math.max(...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * W,
    height - 3 - ((v - min) / span) * (height - 6),
  ]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  const area = `${line} L${W},${height} L0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
