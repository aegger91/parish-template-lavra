import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CROSS_GEOMETRY, type CrossVariant } from "./cross-geometry";

function MiniCross({ x, y, h, variant = "byzantine" }: { x: number; y: number; h: number; variant?: CrossVariant }) {
  const g = CROSS_GEOMETRY[variant];
  const s = h / g.height;
  return <path d={g.d} fill="currentColor" stroke="none" transform={`translate(${x} ${y}) scale(${s})`} />;
}

const knots = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
  return { cx: +(12 + Math.cos(a) * 5.6).toFixed(2), cy: +(8.6 + Math.sin(a) * 5.6).toFixed(2) };
});

const ICONS: Record<string, ReactNode> = {
  church: (
    <>
      <path d="M2 21h20M3.5 21v-7.6h17V21" />
      <path d="M3.5 13.4a3 2.4 0 0 1 6 0M14.5 13.4a3 2.4 0 0 1 6 0" />
      <path d="M8.6 13.4V9h6.8v4.4" />
      <path d="M8.2 9.1a3.8 3.8 0 0 1 7.6 0" />
      <path d="M12 5.3v-.6" />
      <path d="M10.5 21v-3a1.5 1.5 0 0 1 3 0v3M12 10.4v1.6" />
      <MiniCross x={10.4} y={1} h={3.4} variant="byzantine" />
    </>
  ),
  chalice: (
    <>
      <path d="M5.8 4h12.4" />
      <path d="M6.2 4c0 4.8 2.4 7.8 5.8 7.8s5.8-3 5.8-7.8" />
      <path d="M12 11.8v5.4" />
      <circle cx="12" cy="14.2" r="1.1" />
      <path d="M7.8 20.5c0-1.9 1.9-3.1 4.2-3.1s4.2 1.2 4.2 3.1z" />
      <MiniCross x={10.5} y={5.2} h={3} />
    </>
  ),
  censer: (
    <>
      <circle cx="12" cy="2.4" r="1" />
      <path d="M12 3.4 7.3 10.7M12 3.4l4.7 7.3M12 3.4v3.8" />
      <path d="M7.6 10.8a4.4 3.6 0 0 1 8.8 0" />
      <path d="M6.4 10.8h11.2c0 3.6-2.5 6-5.6 6s-5.6-2.4-5.6-6z" />
      <path d="M10.2 16.6v2h3.6v-2M9 20.6h6" />
    </>
  ),
  candle: (
    <>
      <path d="M12 2.4c1.8 2 2.4 3.4 2.4 4.4a2.4 2.4 0 0 1-4.8 0c0-1 .6-2.4 2.4-4.4z" />
      <path d="M10.2 18.4V9.4h3.6v9" />
      <path d="M13.8 11.6c-.5.8-.5 1.6 0 2.2" />
      <path d="M6.8 20.6h10.4M8.5 20.6c0-1.3 1.5-2.2 3.5-2.2s3.5.9 3.5 2.2" />
    </>
  ),
  "prayer-rope": (
    <>
      {knots.map((k, i) => (
        <circle key={i} cx={k.cx} cy={k.cy} r="1.15" />
      ))}
      <path d="M12 14.2v2" />
      <MiniCross x={10.1} y={16} h={3.8} />
      <path d="M12 19.8v1M11 20.6l-.7 2M13 20.6l.7 2M12 20.8v1.8" />
    </>
  ),
  gospel: (
    <>
      <rect x="5" y="2.8" width="14" height="18.4" rx="1" />
      <path d="M7 2.8v18.4" />
      <MiniCross x={9.6} y={8.4} h={7} />
      <circle cx="9" cy="5.3" r=".6" fill="currentColor" />
      <circle cx="16.6" cy="5.3" r=".6" fill="currentColor" />
      <circle cx="9" cy="18.7" r=".6" fill="currentColor" />
      <circle cx="16.6" cy="18.7" r=".6" fill="currentColor" />
    </>
  ),
  "icon-frame": (
    <>
      <path d="M4.8 21.2V8.2L12 2.8l7.2 5.4v13z" />
      <path d="M7.4 19.4V9.4L12 6l4.6 3.4v10z" />
      <MiniCross x={10.3} y={10.6} h={3.4} />
    </>
  ),
  bells: (
    <>
      <path d="M3 21h18M4.5 21V9.5a7.5 7.5 0 0 1 15 0V21" />
      <path d="M12 9.6c-2.1 0-2.9 1.8-2.9 3.9v2.2l-1 1.4h7.8l-1-1.4v-2.2c0-2.1-.8-3.9-2.9-3.9z" />
      <path d="M12 8.4v1.2" />
      <circle cx="12" cy="18.3" r=".8" />
    </>
  ),
  cross: <MiniCross x={7.2} y={2} h={20} variant="slavic" />,
  zapiska: (
    <>
      <path d="M6 2.5h12v19H6z" />
      <MiniCross x={10.8} y={3.6} h={4.6} variant="slavic" />
      <path d="M8.4 11h7.2M8.4 13.8h7.2M8.4 16.6h7.2M8.4 19.2h4" />
    </>
  ),
  font: (
    <>
      <path d="M12 2.4c1 1.4 1.5 2.2 1.5 2.9a1.5 1.5 0 0 1-3 0c0-.7.5-1.5 1.5-2.9z" />
      <ellipse cx="12" cy="9" rx="7" ry="1.8" />
      <path d="M5 9c0 4 3 6.6 7 6.6s7-2.6 7-6.6" />
      <MiniCross x={10.75} y={10.9} h={2.5} />
      <path d="M10.6 15.5v3h2.8v-3M8 21h8l-1.4-2.5H9.4z" />
    </>
  ),
  epitrachelion: (
    <>
      <path d="M8 3c0 2 1.6 3.2 4 3.2S16 5 16 3" />
      <path d="M8 3v17h3.4V6.2M16 3v17h-3.4V6.2" />
      <MiniCross x={8.6} y={9} h={2.2} />
      <MiniCross x={13.2} y={9} h={2.2} />
      <MiniCross x={8.6} y={14} h={2.2} />
      <MiniCross x={13.2} y={14} h={2.2} />
      <path d="M8.6 20v1.6M10.8 20v1.6M13.2 20v1.6M15.4 20v1.6" />
    </>
  ),
  chrism: (
    <>
      <path d="M9.5 8.5a2.5 2.2 0 0 1 5 0z" />
      <circle cx="12" cy="5.4" r=".8" />
      <path d="M10 8.5V11c-2 .8-3.5 2.4-3.5 4.5V20a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-4.5c0-2.1-1.5-3.7-3.5-4.5V8.5" />
      <MiniCross x={10.6} y={14.2} h={2.8} />
    </>
  ),
  crowns: (
    <>
      <path d="M2.4 18h8.2v2.6H2.4zM2.4 18l-.4-6 2.4 2L6.5 10l2.1 4 2.4-2-.4 6" />
      <MiniCross x={5.2} y={5.2} h={2.8} />
      <path d="M13.4 18h8.2v2.6h-8.2zM13.4 18l-.4-6 2.4 2 2.1-4 2.1 4 2.4-2-.4 6" />
      <MiniCross x={16.1} y={5.2} h={2.8} />
    </>
  ),
  unction: (
    <>
      {Array.from({ length: 7 }, (_, i) => {
        const x = 6 + i * 2;
        const top = 9.5 + Math.abs(i - 3) * 0.9;
        return (
          <g key={i}>
            <path d={`M${x} ${top}V16.6`} />
            <path d={`M${x} ${top - 2.4}c.5.7.7 1.1.7 1.4a.7.7 0 0 1-1.4 0c0-.3.2-.7.7-1.4z`} />
          </g>
        );
      })}
      <path d="M3.5 16.8h17c-.6 2.6-3.8 4.2-8.5 4.2s-7.9-1.6-8.5-4.2z" />
    </>
  ),
  aspergillum: (
    <>
      <ellipse cx="12" cy="13" rx="8" ry="1.8" />
      <path d="M4 13c0 4.2 3.6 7.6 8 7.6s8-3.4 8-7.6" />
      <MiniCross x={10.75} y={14.6} h={2.6} />
      <path d="M13.2 11.3 16.4 4" />
      <ellipse cx="17.2" cy="2.8" rx="1.3" ry="1.9" transform="rotate(24 17.2 2.8)" />
      <path d="M19.4 6.4v.8M20.6 8.2v.8M18.2 8.4v.8" />
    </>
  ),
  memorial: (
    <>
      <MiniCross x={9.6} y={1.6} h={10} variant="slavic" />
      <path d="M3.5 16.6h17M12 16.6V21M7.5 21h9" />
      {[5.5, 8.5, 15.5, 18.5].map((x) => (
        <g key={x}>
          <path d={`M${x} 13.2v3.4`} />
          <path d={`M${x} 10.6c.5.7.7 1.1.7 1.4a.7.7 0 0 1-1.4 0c0-.3.2-.7.7-1.4z`} />
        </g>
      ))}
    </>
  ),
  lamp: (
    <>
      <path d="M12 1.8v2.4M12 4.2 7.6 10M12 4.2l4.4 5.8" />
      <path d="M7 10h10c0 3.2-2.2 5.6-5 5.6S7 13.2 7 10z" />
      <path d="M12 6.6c.7.9 1 1.5 1 1.9a1 1 0 0 1-2 0c0-.4.3-1 1-1.9z" />
      <path d="M12 15.6v2.6" />
      <circle cx="12" cy="19.4" r="1" />
      <path d="M8.6 12.4h6.8" />
    </>
  ),
};

export type PictogramName = keyof typeof ICONS;

export function Pictogram({ name, className, label }: { name: string; className?: string; label?: string }) {
  const icon = ICONS[name] ?? ICONS.church;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("inline-block size-6 shrink-0", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {icon}
    </svg>
  );
}
