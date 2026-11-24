"use client";

import React, { useId, useMemo, useState } from "react";
import { useElementWidth } from "./useElementWidth";

export interface TrendPoint {
  label: string;
  value: number;
  prev: number;
}

interface Props {
  points: TrendPoint[];
  color: string;
  format: (n: number) => string;
  formatTick: (n: number) => string;
  currentLabel: string;
  prevLabel: string;
  height?: number;
}

const PAD = { top: 16, right: 12, bottom: 28, left: 48 };

//* Round axis steps: 1, 2, 2.5, 5 x 10^n.
function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
}

export default function TrendChart({
  points,
  color,
  format,
  formatTick,
  currentLabel,
  prevLabel,
  height = 280,
}: Props) {
  const gid = useId();
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const geo = useMemo(() => {
    const innerW = Math.max(0, width - PAD.left - PAD.right);
    const innerH = height - PAD.top - PAD.bottom;
    const max = Math.max(...points.map((p) => Math.max(p.value, p.prev)), 0);
    const ticks = niceTicks(max);
    const top = ticks[ticks.length - 1] || 1;
    const n = points.length;
    const x = (i: number) =>
      PAD.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
    const y = (v: number) => PAD.top + innerH - (v / top) * innerH;
    const path = (key: "value" | "prev") =>
      points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p[key])}`).join(" ");
    const line = path("value");
    const area =
      n > 0 ? `${line} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z` : "";
    //* Thin x labels so they never collide (~64px per label).
    const every = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(innerW / 64))));
    return { innerW, innerH, ticks, x, y, line, area, prevLine: path("prev"), every };
  }, [points, width, height]);

  const n = points.length;
  const pick = (clientX: number, rect: DOMRect) => {
    if (n === 0) return;
    const rel = clientX - rect.left - PAD.left;
    const i = n <= 1 ? 0 : Math.round((rel / geo.innerW) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  };

  const hp = hover !== null ? points[hover] : null;
  const delta =
    hp && hp.prev > 0 ? ((hp.value - hp.prev) / hp.prev) * 100 : null;
  const tipLeft = hover !== null ? geo.x(hover) : 0;
  const tipOnLeft = tipLeft > width * 0.6;

  return (
    <div ref={ref} className="relative w-full select-none" style={{ height }}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          aria-label={`${currentLabel} trend chart`}
          tabIndex={0}
          className="outline-none focus-visible:ring-2 focus-visible:ring-greenPrimary-300 rounded-lg"
          onMouseMove={(e) => pick(e.clientX, e.currentTarget.getBoundingClientRect())}
          onMouseLeave={() => setHover(null)}
          onTouchStart={(e) => pick(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())}
          onTouchMove={(e) => pick(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())}
          onBlur={() => setHover(null)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight")
              setHover((h) => Math.min(n - 1, (h ?? -1) + 1));
            if (e.key === "ArrowLeft")
              setHover((h) => Math.max(0, (h ?? n) - 1));
          }}
        >
          <defs>
            <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          {/* grid + y ticks */}
          {geo.ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={geo.y(t)}
                y2={geo.y(t)}
                stroke={t === 0 ? "#d1d5db" : "#eef0f2"}
              />
              <text
                x={PAD.left - 8}
                y={geo.y(t)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-neutralPrimary-400 text-[11px] tabular-nums"
              >
                {formatTick(t)}
              </text>
            </g>
          ))}

          {/* x labels */}
          {points.map((p, i) => {
            //* always the last label; every Nth otherwise, unless it crowds the last
            const isLast = i === n - 1;
            const show =
              isLast || (i % geo.every === 0 && n - 1 - i >= geo.every * 0.6);
            if (!show) return null;
            return (
              <text
                key={p.label + i}
                x={geo.x(i)}
                y={height - 8}
                textAnchor={n === 1 ? "middle" : i === 0 ? "start" : isLast ? "end" : "middle"}
                className="fill-neutralPrimary-400 text-[11px]"
              >
                {p.label}
              </text>
            );
          })}

          {/* previous period, recessive */}
          {n > 1 && (
            <path
              d={geo.prevLine}
              fill="none"
              stroke="#b6bcc6"
              strokeWidth={1.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* current period */}
          {n > 1 && <path d={geo.area} fill={`url(#${gid})`} />}
          {n > 1 && (
            <path
              d={geo.line}
              fill="none"
              stroke={color}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
          {n === 1 && (
            <circle cx={geo.x(0)} cy={geo.y(points[0].value)} r={5} fill={color} />
          )}

          {/* last point marker */}
          {n > 1 && hover === null && (
            <circle
              cx={geo.x(n - 1)}
              cy={geo.y(points[n - 1].value)}
              r={4.5}
              fill={color}
              stroke="#fff"
              strokeWidth={2}
            />
          )}

          {/* crosshair */}
          {hp && hover !== null && (
            <g pointerEvents="none">
              <line
                x1={geo.x(hover)}
                x2={geo.x(hover)}
                y1={PAD.top}
                y2={PAD.top + geo.innerH}
                stroke="#9ca3af"
                strokeWidth={1}
              />
              <circle cx={geo.x(hover)} cy={geo.y(hp.prev)} r={4} fill="#b6bcc6" stroke="#fff" strokeWidth={2} />
              <circle cx={geo.x(hover)} cy={geo.y(hp.value)} r={5} fill={color} stroke="#fff" strokeWidth={2} />
            </g>
          )}
        </svg>
      )}

      {hp && hover !== null && (
        <div
          className="pointer-events-none absolute z-10 min-w-44 rounded-xl bg-neutralPrimary-900/95 text-white shadow-xl px-3 py-2.5 text-xs backdrop-blur"
          style={{
            top: 4,
            left: tipOnLeft ? undefined : tipLeft + 12,
            right: tipOnLeft ? width - tipLeft + 12 : undefined,
          }}
        >
          <p className="font-semibold text-[13px] mb-1.5">{hp.label}</p>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-white/70">
              <span className="h-2 w-2 rounded-full" style={{ background: color }} />
              {currentLabel}
            </span>
            <span className="font-semibold tabular-nums">{format(hp.value)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 mt-1">
            <span className="flex items-center gap-1.5 text-white/70">
              <span className="h-2 w-2 rounded-full bg-[#b6bcc6]" />
              {prevLabel}
            </span>
            <span className="tabular-nums text-white/80">{format(hp.prev)}</span>
          </div>
          {delta !== null && (
            <p className={`mt-1.5 pt-1.5 border-t border-white/10 font-medium ${delta >= 0 ? "text-green-300" : "text-red-300"}`}>
              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}% vs previous
            </p>
          )}
        </div>
      )}
    </div>
  );
}
