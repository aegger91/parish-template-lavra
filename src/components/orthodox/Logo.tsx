import { useId } from "react";
import { cn } from "@/lib/utils";
import type { LogoStyle } from "@/lib/types";
import { Cross } from "./Cross";
import { CROSS_GEOMETRY } from "./cross-geometry";

interface LogoProps {
  style: LogoStyle;
  image: string | null;
  alt: string;
  name: string;
  subtitle?: string;
  showName?: boolean;
  compact?: boolean;
  className?: string;
}

/** Cross with IC XC above the arms and NI KA below, drawn in a 100 x 100 box. */
function IcXcNikaGroup({ color }: { color: string }) {
  return (
    <g fill={color}>
      <path d={CROSS_GEOMETRY.byzantine.d} transform="translate(28 28) scale(1.1)" />
      <g fontFamily="var(--lavra-font-heading)" fontWeight="700" fontSize="17" textAnchor="middle">
        <text x="27" y="39">IC</text>
        <text x="73" y="39">XC</text>
        <text x="27" y="80">NI</text>
        <text x="73" y="80">KA</text>
      </g>
      <path d="M18 22.5h18M64 22.5h18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Seal({ name, size }: { name: string; size: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className="shrink-0" role="img" aria-label={name}>
      <defs>
        <path id={`ring-${id}`} d="M60 60m-45 0a45 45 0 1 1 90 0a45 45 0 1 1-90 0" />
      </defs>
      <circle cx="60" cy="60" r="58" fill="var(--lavra-cinnabar)" />
      <circle cx="60" cy="60" r="54" fill="none" stroke="var(--lavra-ochre-light)" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="34" fill="var(--lavra-vellum)" stroke="var(--lavra-ochre-light)" strokeWidth="1.5" />
      <text fontFamily="var(--lavra-font-label)" fontSize="11" letterSpacing="1.6" fill="#fff4dc" fontWeight="700">
        <textPath href={`#ring-${id}`} startOffset="50%" textAnchor="middle">
          {name.toUpperCase()}
        </textPath>
      </text>
      <g transform="translate(30 30) scale(0.6)">
        <IcXcNikaGroup color="var(--lavra-cinnabar)" />
      </g>
    </svg>
  );
}

export function Logo({ style, image, alt, name, subtitle, showName = true, compact = false, className }: LogoProps) {
  const mark = compact ? "size-11" : "size-14 sm:size-16";
  const markPx = compact ? 44 : 64;

  let emblem: React.ReactNode = null;
  if (style === "square-image") {
    emblem = (
      <span className={cn("wood-frame grid shrink-0 place-items-center rounded-[3px] p-[5px] transition-all duration-300", mark)}>
        <span className="block size-full overflow-hidden rounded-[1px] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.35)]">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={alt} className="size-full object-cover" width={64} height={64} />
          ) : (
            <span className="grid size-full place-items-center bg-lapis text-ochre-light">
              <Cross className="h-3/4" />
            </span>
          )}
        </span>
      </span>
    );
  } else if (style === "kiot") {
    emblem = (
      <span
        className={cn("wood-frame grid shrink-0 place-items-center p-[5px] pt-[12px] transition-all duration-300", compact ? "h-12 w-10" : "h-[4.5rem] w-14")}
        style={{ clipPath: "polygon(50% 0, 100% 22%, 100% 100%, 0 100%, 0 22%)" }}
      >
        <span className="block size-full overflow-hidden" style={{ clipPath: "polygon(50% 0, 100% 18%, 100% 100%, 0 100%, 0 18%)" }}>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={alt} className="size-full object-cover" />
          ) : (
            <span className="grid size-full place-items-center bg-gold text-cinnabar">
              <Cross className="h-2/3" />
            </span>
          )}
        </span>
      </span>
    );
  } else if (style === "circular-seal") {
    emblem = <Seal name={name} size={markPx} />;
  }

  const showText = style === "wordmark" || showName;
  return (
    <span className={cn("flex min-w-0 items-center gap-3", className)}>
      {emblem}
      {showText && (
        <span className="flex min-w-0 flex-col">
          {style === "wordmark" && (
            <Cross className={cn("mb-0.5 text-cinnabar", compact ? "h-4" : "h-5")} />
          )}
          <span
            className={cn(
              "font-heading font-bold leading-[1.05] text-ink transition-all duration-300 [overflow-wrap:anywhere] sm:[overflow-wrap:normal]",
              compact ? "text-[1.05rem] sm:text-lg" : "text-lg sm:text-[1.4rem] xl:text-[1.3rem]",
              "[text-wrap:balance]",
            )}
          >
            {name}
          </span>
          {subtitle && !compact && <span className="label-sc mt-0.5 hidden text-[0.78rem] leading-tight text-ink-soft sm:block xl:hidden min-[1600px]:block">{subtitle}</span>}
        </span>
      )}
    </span>
  );
}
