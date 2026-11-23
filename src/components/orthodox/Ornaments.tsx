import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Cross } from "./Cross";

type BandVariant = "teeth" | "diamond" | "rope";

/** Painted border band inspired by Serbian fresco framing and Romanian folk patterns. */
export function PaintedBand({ variant = "teeth", className }: { variant?: BandVariant; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={cn("block h-3 w-full", className)} aria-hidden="true" focusable="false" preserveAspectRatio="none">
      <defs>
        {variant === "teeth" && (
          <pattern id={id} width="16" height="12" patternUnits="userSpaceOnUse">
            <rect width="16" height="12" fill="var(--lavra-terracotta)" />
            <path d="M0 10 8 2l8 8z" fill="var(--lavra-ochre)" />
            <circle cx="8" cy="7.4" r="1.2" fill="var(--lavra-lapis)" />
            <rect y="0" width="16" height="1.2" fill="var(--lavra-lapis-deep)" />
            <rect y="10.8" width="16" height="1.2" fill="var(--lavra-lapis-deep)" />
          </pattern>
        )}
        {variant === "diamond" && (
          <pattern id={id} width="18" height="12" patternUnits="userSpaceOnUse">
            <rect width="18" height="12" fill="var(--lavra-lapis)" />
            <path d="M9 1.2 15 6 9 10.8 3 6z" fill="var(--lavra-ochre)" />
            <path d="M9 3.6 12 6 9 8.4 6 6z" fill="var(--lavra-cinnabar)" />
            <circle cx="0" cy="6" r="1.1" fill="var(--lavra-vellum)" />
            <circle cx="18" cy="6" r="1.1" fill="var(--lavra-vellum)" />
          </pattern>
        )}
        {variant === "rope" && (
          <pattern id={id} width="12" height="12" patternUnits="userSpaceOnUse">
            <rect width="12" height="12" fill="var(--lavra-ochre)" />
            <path d="M-2 10C3 10 3 2 8 2s5 8 10 8" fill="none" stroke="var(--lavra-terracotta-deep)" strokeWidth="2.2" />
            <path d="M-2 2c5 0 5 8 10 8s5-8 10-8" fill="none" stroke="var(--lavra-vellum)" strokeWidth="1" opacity=".7" />
          </pattern>
        )}
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

export function OrnamentDivider({ className, tone = "ochre" }: { className?: string; tone?: "ochre" | "light" }) {
  return (
    <div className={cn("ornament-rule my-2", tone === "light" && "text-ochre-light", className)} aria-hidden="true">
      <span className="flex items-center gap-2">
        <span className="size-1.5 rotate-45 bg-current" />
        <Cross variant="byzantine" className="size-4 text-cinnabar" />
        <span className="size-1.5 rotate-45 bg-current" />
      </span>
    </div>
  );
}

export function ChapterMark({ label, numeral, tone = "dark", className }: { label: string; numeral?: string; tone?: "dark" | "light"; className?: string }) {
  return (
    <p className={cn("label-sc flex flex-wrap items-center gap-x-3 gap-y-1 text-sm", tone === "dark" ? "text-cinnabar" : "text-ochre-light", className)}>
      <span aria-hidden="true" className={cn("h-px w-8", tone === "dark" ? "bg-cinnabar/60" : "bg-ochre-light/60")} />
      <span>
        {label}
        {numeral ? <span className="ms-1.5 font-bold">{numeral}</span> : null}
      </span>
    </p>
  );
}

/** Frame like a painted fresco panel: cinnabar band, ochre band and a thin white line. */
export function FrescoFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative rounded-[3px] p-[7px] shadow-[0_18px_40px_-20px_rgb(59_34_19/0.7)]",
        "bg-[linear-gradient(135deg,var(--lavra-terracotta-deep),var(--lavra-cinnabar)_40%,var(--lavra-terracotta-deep))]",
        className,
      )}
    >
      <div className="rounded-[2px] bg-ochre p-[5px]">
        <div className="relative overflow-hidden rounded-[1px] outline outline-[1.5px] outline-offset-[-4px] outline-[#fbf1da]/80">{children}</div>
      </div>
    </div>
  );
}
