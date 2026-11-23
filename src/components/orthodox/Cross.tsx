import { cn } from "@/lib/utils";
import { CROSS_GEOMETRY, type CrossVariant } from "./cross-geometry";

interface CrossProps {
  variant?: CrossVariant;
  className?: string;
  title?: string;
}

export function Cross({ variant = "slavic", className, title }: CrossProps) {
  const g = CROSS_GEOMETRY[variant];
  return (
    <svg
      viewBox={`0 0 ${g.width} ${g.height}`}
      className={cn("inline-block shrink-0", className)}
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <path d={g.d} />
    </svg>
  );
}

export { CROSS_GEOMETRY };
