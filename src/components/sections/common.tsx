"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChapterMark, OrnamentDivider } from "@/components/orthodox/Ornaments";
import { useI18n } from "@/components/providers";

export function Reveal({ children, className, as: Tag = "div", delay = 0 }: { children: ReactNode; className?: string; as?: ElementType; delay?: number }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={cn("reveal", className)} style={delay ? ({ transitionDelay: `${delay}ms` } as CSSProperties) : undefined}>
      {children}
    </Tag>
  );
}

/** Card with a warm candle glow that follows the pointer. */
export function GlowCard({ children, className, as: Tag = "div", ...rest }: { children: ReactNode; className?: string; as?: ElementType } & Record<string, unknown>) {
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--glow-x", `${((e.clientX - r.left) / r.width) * 100}%`);
    e.currentTarget.style.setProperty("--glow-y", `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  return (
    <Tag onPointerMove={onMove} className={cn("fresco-card candle-glow", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function ChapterSection({
  id,
  numeral,
  label,
  title,
  intro,
  children,
  className,
  tone = "parchment",
  headerAside,
}: {
  id: string;
  numeral?: string;
  label?: string;
  title?: string;
  intro?: string;
  children: ReactNode;
  className?: string;
  tone?: "parchment" | "lapis";
  headerAside?: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <section
      id={id}
      data-chapter={numeral ? "true" : undefined}
      data-chapter-label={title}
      data-chapter-numeral={numeral}
      aria-labelledby={title ? `${id}-title` : undefined}
      className={cn("scroll-mt-24 py-14 sm:py-20", tone === "lapis" && "plaster-lapis", className)}
    >
      <div className="container-lavra">
        {(title || label) && (
          <Reveal className="mb-8 flex flex-col gap-4 sm:mb-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              {(numeral || label) && (
                <ChapterMark tone={tone === "lapis" ? "light" : "dark"} label={label ?? t("chapter")} numeral={numeral} className="mb-3" />
              )}
              {title && (
                <h2 id={`${id}-title`} className="text-[2rem] leading-snug sm:text-[2.6rem]">
                  {title}
                </h2>
              )}
              {intro && <p className={cn("mt-3 text-measure text-[1.07rem]", tone === "lapis" ? "text-[#efe2c4]" : "text-ink-soft")}>{intro}</p>}
            </div>
            {headerAside}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}

export function SectionDivider() {
  return (
    <div className="container-lavra">
      <OrnamentDivider />
    </div>
  );
}

export function EmptyState({ title, text, icon }: { title: string; text?: string; icon?: ReactNode }) {
  return (
    <div className="fresco-card grid place-items-center gap-2 px-6 py-12 text-center">
      <div className="relative z-10 grid place-items-center gap-2">
        {icon}
        <p className="font-heading text-xl font-bold">{title}</p>
        {text && <p className="max-w-md text-ink-soft">{text}</p>}
      </div>
    </div>
  );
}

export function SampleNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-start gap-2 rounded border border-dashed border-ochre/70 bg-ochre/10 px-3 py-2 text-[0.88rem] text-ink-soft", className)}>
      <span className="label-sc shrink-0 font-bold text-cinnabar">{"\u2022"}</span>
      <span>{children}</span>
    </p>
  );
}
