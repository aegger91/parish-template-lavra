"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CalendarRange, ChevronLeft, ChevronRight, Radio } from "lucide-react";
import { site } from "@/lib/content";
import { gregorianFromJdn, monthRange, startOfWeek, type DayInfo } from "@/lib/calendar";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers";
import { Cross } from "@/components/orthodox/Cross";
import { PaintedBand } from "@/components/orthodox/Ornaments";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useDays, useParishToday } from "./useParishDays";
import type { SectionProps } from "./ContentSections";

type View = "week" | "month";

function isRedDay(d: DayInfo) {
  return d.weekday === 0 || d.feasts.some((f) => f.rank === "great" || f.rank === "pascha");
}

function mainFeast(d: DayInfo) {
  return d.feasts[0];
}

function FastMark({ d, withLabel = false }: { d: DayInfo; withLabel?: boolean }) {
  const { t } = useI18n();
  if (!d.fast || !site.calendar.showFasting) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[0.78rem] text-lapis" title={t(`fast.${d.fast.period}`)}>
      <span className={cn("inline-block size-2 rounded-full", d.fast.kind === "strict" ? "bg-lapis-deep ring-2 ring-lapis/30" : "bg-lapis-light")} aria-hidden="true" />
      {withLabel ? t(`fast.${d.fast.period}`) : <span className="sr-only">{t(`fast.${d.fast.period}`)}</span>}
    </span>
  );
}

function ServiceLine({ s, compact = false }: { s: DayInfo["services"][number]; compact?: boolean }) {
  const { tr, t, fmtTime } = useI18n();
  return (
    <li className={cn("flex gap-2.5", compact ? "text-[0.8rem] leading-snug" : "text-[0.97rem]")}>
      <span className={cn("shrink-0 tabular-nums font-bold text-lapis", compact ? "w-auto" : "w-16")}>{fmtTime(s.time)}</span>
      <span className="min-w-0">
        {tr(s.name)}
        {s.livestream && site.features.livestream && (
          <span className="ms-1 inline-flex translate-y-0.5 text-cinnabar" title={t("live.streamed")}>
            <Radio className={compact ? "size-3" : "size-3.5"} aria-hidden="true" />
            <span className="sr-only">{t("live.streamed")}</span>
          </span>
        )}
        {!compact && s.note && <span className="block text-[0.85rem] text-ink-soft">{tr(s.note)}</span>}
      </span>
    </li>
  );
}

function ChurchDate({ d, className }: { d: DayInfo; className?: string }) {
  const { t } = useI18n();
  if (!site.calendar.showChurchDate || site.calendar.style !== "julian") return null;
  return (
    <span className={cn("text-[0.75rem] tabular-nums text-ink-faint", className)} title={t("schedule.churchDateTitle")}>
      {d.church.d}
    </span>
  );
}

function DayCard({ d, today }: { d: DayInfo; today: number }) {
  const { tr, t, fmtDay } = useI18n();
  const feast = mainFeast(d);
  const red = isRedDay(d);
  return (
    <div
      className={cn(
        "fresco-card candle-glow flex h-full flex-col p-4",
        d.jdn === today && "ring-2 ring-ochre ring-offset-2 ring-offset-parchment",
        feast && (feast.rank === "great" || feast.rank === "pascha") && "bg-[linear-gradient(180deg,#fbeedd,var(--lavra-vellum))]",
      )}
    >
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-2 border-b border-[#e3d0a7] pb-2">
          <div>
            <p className="label-sc text-[0.85rem] capitalize text-ink-soft">{fmtDay(d.jdn, { weekday: "long" })}</p>
            <p className={cn("font-heading text-3xl font-extrabold leading-none", red ? "text-cinnabar" : "text-ink")}>{fmtDay(d.jdn, { day: "numeric" })}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {d.jdn === today && <span className="label-sc rounded-full bg-ochre px-2 py-0.5 text-[0.72rem] font-bold text-[#2a1407]">{t("time.today")}</span>}
            <ChurchDate d={d} />
          </div>
        </div>
        {d.feasts.map((f) => (
          <p key={f.id} className={cn("mt-2 font-heading text-[0.98rem] font-bold leading-snug", f.rank === "commemoration" ? "text-ink-soft" : "text-cinnabar")}>
            {f.rank !== "commemoration" && <Cross variant="byzantine" className="me-1 inline size-3 -translate-y-px" />}
            {tr(f.name)}
          </p>
        ))}
        {d.services.length ? (
          <ul className="mt-3 space-y-2">
            {d.services.map((s) => (
              <ServiceLine key={s.id} s={s} />
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[0.9rem] text-ink-faint">{t("schedule.noServices")}</p>
        )}
        <div className="mt-auto pt-3">
          <FastMark d={d} withLabel />
        </div>
      </div>
    </div>
  );
}

function WeekView({ days, today }: { days: DayInfo[]; today: number }) {
  return (
    <ol className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {days.map((d) => (
        <li key={d.jdn} className={cn(!d.services.length && !d.feasts.length && "hidden md:block")}>
          <DayCard d={d} today={today} />
        </li>
      ))}
    </ol>
  );
}

function MonthView({ days, today, year, month, onPick }: { days: DayInfo[]; today: number; year: number; month: number; onPick: (d: DayInfo) => void }) {
  const { tr, t, locale, fmtDay } = useI18n();
  const first = days[0];
  const lead = first ? first.weekday : 0;
  const weekdays = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(new Date(Date.UTC(2023, 0, 1 + i))));
  const monthName = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, 1)));
  const listDays = days.filter((d) => d.services.length || d.feasts.length);

  return (
    <>
      <div className="hidden overflow-hidden rounded-md border-2 border-terracotta-deep bg-vellum shadow-[var(--lavra-shadow-lift)] md:block">
        <div className="relative bg-[linear-gradient(180deg,var(--lavra-cinnabar),var(--lavra-terracotta-deep))] px-6 py-4 text-center text-[#fff2d6]">
          <Cross className="absolute start-6 top-1/2 h-10 -translate-y-1/2 text-ochre-light" />
          <Cross className="absolute end-6 top-1/2 h-10 -translate-y-1/2 text-ochre-light" />
          <p className="font-heading text-4xl font-bold capitalize text-[#fff2d6]">{monthName}</p>
          <p className="label-sc mt-1 text-sm text-ochre-light">{t(`calendar.${site.calendar.style}`)}</p>
        </div>
        <PaintedBand variant="diamond" className="h-2.5" />
        <div className="grid grid-cols-7 border-b border-[#d9c49a] bg-parchment-deep/60">
          {weekdays.map((w, i) => (
            <div key={w} className={cn("label-sc px-2 py-2 text-center text-[0.85rem] font-bold capitalize", i === 0 ? "text-cinnabar" : "text-ink-soft")}>
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: lead }).map((_, i) => (
            <div key={`pad-${i}`} className="min-h-32 border-e border-b border-[#e6d5b0] bg-parchment/50" />
          ))}
          {days.map((d) => {
            const feast = mainFeast(d);
            const red = isRedDay(d);
            return (
              <button
                key={d.jdn}
                type="button"
                onClick={() => onPick(d)}
                aria-label={`${fmtDay(d.jdn, { weekday: "long", month: "long", day: "numeric" })}${feast ? `, ${tr(feast.name)}` : ""}`}
                className={cn(
                  "group relative flex min-h-32 flex-col border-e border-b border-[#e6d5b0] p-2 text-start transition hover:z-10 hover:bg-[#fff8e6] hover:shadow-[0_0_28px_-6px_rgb(var(--lavra-candle)/0.9)] focus-visible:z-10 [&:nth-child(7n)]:border-e-0",
                  d.jdn === today && "bg-ochre/15 ring-2 ring-inset ring-ochre",
                  feast && (feast.rank === "great" || feast.rank === "pascha") && "bg-cinnabar/[0.06]",
                )}
              >
                <span className="flex items-start justify-between">
                  <span className={cn("font-heading text-[1.7rem] font-extrabold leading-none", red ? "text-cinnabar" : "text-ink")}>{gregorianFromJdn(d.jdn).d}</span>
                  <span className="flex flex-col items-end gap-1">
                    <ChurchDate d={d} />
                    <FastMark d={d} />
                  </span>
                </span>
                {feast && (
                  <span className={cn("mt-1 line-clamp-2 font-heading text-[0.78rem] font-bold leading-tight", feast.rank === "commemoration" ? "text-ink-soft" : "text-cinnabar")}>
                    {tr(feast.name)}
                  </span>
                )}
                <ul className="mt-auto space-y-0.5 pt-1">
                  {d.services.slice(0, 3).map((s) => (
                    <ServiceLine key={s.id} s={s} compact />
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </div>

      <ol className="space-y-3 md:hidden">
        {listDays.map((d) => {
          const red = isRedDay(d);
          return (
            <li key={d.jdn}>
              <div className={cn("fresco-card flex gap-4 p-4", d.jdn === today && "ring-2 ring-ochre")}>
                <div className="relative z-10 w-14 shrink-0 text-center">
                  <p className={cn("font-heading text-3xl font-extrabold leading-none", red ? "text-cinnabar" : "text-ink")}>{gregorianFromJdn(d.jdn).d}</p>
                  <p className="label-sc mt-1 text-[0.75rem] capitalize text-ink-soft">{fmtDay(d.jdn, { weekday: "short" })}</p>
                  <ChurchDate d={d} className="mt-1 block" />
                </div>
                <div className="relative z-10 min-w-0 flex-1">
                  {d.feasts.map((f) => (
                    <p key={f.id} className={cn("font-heading font-bold leading-snug", f.rank === "commemoration" ? "text-ink-soft" : "text-cinnabar")}>
                      {tr(f.name)}
                    </p>
                  ))}
                  <ul className={cn("space-y-1.5", d.feasts.length && "mt-2")}>
                    {d.services.map((s) => (
                      <ServiceLine key={s.id} s={s} />
                    ))}
                  </ul>
                  <div className="mt-1">
                    <FastMark d={d} withLabel />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}

export function Schedule({ section }: SectionProps) {
  const { t, tr, fmtDay, locale } = useI18n();
  const now = useParishToday();
  const [view, setView] = useState<View>((section.props.defaultView as View) ?? "week");
  const [weekStart, setWeekStart] = useState<number | null>(null);
  const [ym, setYm] = useState<{ y: number; m: number } | null>(null);
  const [picked, setPicked] = useState<DayInfo | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("view");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (q === "month" || q === "week") setView(q);
  }, []);

  useEffect(() => {
    if (!now || weekStart != null) return;
    const g = gregorianFromJdn(now.jdn);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWeekStart(startOfWeek(now.jdn));
    setYm({ y: g.y, m: g.m });
  }, [now, weekStart]);

  const range = useMemo(() => {
    if (view === "week") return weekStart == null ? null : { start: weekStart, end: weekStart + 6 };
    return ym ? monthRange(ym.y, ym.m) : null;
  }, [view, weekStart, ym]);
  const days = useDays(range?.start ?? null, range?.end ?? null);

  const shift = (dir: -1 | 1) => {
    if (view === "week" && weekStart != null) setWeekStart(weekStart + dir * 7);
    if (view === "month" && ym) {
      const m = ym.m + dir;
      setYm(m < 1 ? { y: ym.y - 1, m: 12 } : m > 12 ? { y: ym.y + 1, m: 1 } : { y: ym.y, m });
    }
  };
  const goToday = () => {
    if (!now) return;
    const g = gregorianFromJdn(now.jdn);
    setWeekStart(startOfWeek(now.jdn));
    setYm({ y: g.y, m: g.m });
  };

  const title =
    view === "week" && weekStart != null
      ? `${fmtDay(weekStart, { month: "long", day: "numeric" })} \u2013 ${fmtDay(weekStart + 6, { month: "long", day: "numeric", year: "numeric" })}`
      : ym
        ? new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(ym.y, ym.m - 1, 1)))
        : "";

  return (
    <section id={section.id} className="scroll-mt-24 py-8 sm:py-12" aria-label={t("schedule.title")}>
      <div className="container-lavra">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div role="tablist" aria-label={t("schedule.view")} className="inline-flex self-start rounded-md border border-[#c9ad78] bg-vellum p-1 shadow-inner">
            {(["week", "month"] as View[]).map((v) => (
              <button
                key={v}
                role="tab"
                type="button"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={cn(
                  "label-sc inline-flex items-center gap-2 rounded px-4 py-2 text-[0.98rem] font-bold transition",
                  view === v ? "bg-lapis text-[#fff8ea] shadow" : "text-ink-soft hover:text-ink",
                )}
              >
                {v === "week" ? <CalendarRange className="size-4" aria-hidden="true" /> : <CalendarDays className="size-4" aria-hidden="true" />}
                {t(`schedule.${v}`)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => shift(-1)} className="btn-lavra btn-ghost size-11 min-h-0 p-0" aria-label={t(view === "week" ? "schedule.prevWeek" : "schedule.prevMonth")}>
              <ChevronLeft className="size-5 rtl:rotate-180" aria-hidden="true" />
            </button>
            <p aria-live="polite" className="min-w-0 px-2 text-center font-heading text-xl font-bold capitalize sm:min-w-[16rem]">
              {title || "\u00a0"}
            </p>
            <button type="button" onClick={() => shift(1)} className="btn-lavra btn-ghost size-11 min-h-0 p-0" aria-label={t(view === "week" ? "schedule.nextWeek" : "schedule.nextMonth")}>
              <ChevronRight className="size-5 rtl:rotate-180" aria-hidden="true" />
            </button>
            <button type="button" onClick={goToday} className="btn-lavra btn-ghost min-h-11 px-4">
              {t("time.today")}
            </button>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.88rem] text-ink-soft">
          <span className="label-sc font-bold text-ink">{t(`calendar.${site.calendar.style}`)}</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="font-heading font-extrabold text-cinnabar">12</span>
            {t("schedule.legendRed")}
          </span>
          {site.calendar.showChurchDate && site.calendar.style === "julian" && (
            <span className="inline-flex items-center gap-1.5">
              <span className="tabular-nums text-ink-faint">12</span>
              {t("schedule.legendChurch")}
            </span>
          )}
          {site.calendar.showFasting && (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-2 rounded-full bg-lapis-light" aria-hidden="true" />
              {t("schedule.legendFast")}
            </span>
          )}
          {site.features.livestream && (
            <span className="inline-flex items-center gap-1.5">
              <Radio className="size-3.5 text-cinnabar" aria-hidden="true" />
              {t("live.streamed")}
            </span>
          )}
        </div>

        {!range || !now ? (
          <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-7" aria-busy="true" aria-label={t("state.loading")}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="fresco-card h-44 animate-pulse" />
            ))}
          </div>
        ) : view === "week" ? (
          <WeekView days={days} today={now.jdn} />
        ) : (
          <MonthView days={days} today={now.jdn} year={ym!.y} month={ym!.m} onPick={setPicked} />
        )}

        <p className="mt-5 text-[0.85rem] text-ink-faint">{t("schedule.fastNote")}</p>
      </div>

      <Dialog open={!!picked} onOpenChange={(o) => !o && setPicked(null)}>
        <DialogContent className="border border-[#d5bd8c] bg-vellum p-6 sm:max-w-md">
          {picked && (
            <>
              <DialogTitle className={cn("font-heading text-2xl font-bold capitalize", isRedDay(picked) && "text-cinnabar")}>
                {fmtDay(picked.jdn, { weekday: "long", month: "long", day: "numeric" })}
              </DialogTitle>
              <DialogDescription className="text-ink-soft">
                {picked.feasts.length ? picked.feasts.map((f) => tr(f.name)).join(" · ") : t(`calendar.${site.calendar.style}`)}
              </DialogDescription>
              {picked.services.length ? (
                <ul className="space-y-2.5">
                  {picked.services.map((s) => (
                    <ServiceLine key={s.id} s={s} />
                  ))}
                </ul>
              ) : (
                <p className="text-ink-faint">{t("schedule.noServices")}</p>
              )}
              <FastMark d={picked} withLabel />
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
