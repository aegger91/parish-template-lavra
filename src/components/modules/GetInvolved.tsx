"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock, ExternalLink, Link2, List, Loader2, MapPin, Plus, User, Users } from "lucide-react";
import { connectEvents, connectNeeds, site } from "@/lib/content";
import { connectLink, connectSignUp } from "@/lib/handlers";
import { gregorianFromJdn, jdnFromGregorian, jdnFromIso, weekday } from "@/lib/calendar";
import { pagePath } from "@/lib/routes";
import type { ConnectEvent, NeedSlot } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Pictogram } from "@/components/orthodox/Pictogram";
import { PaintedBand } from "@/components/orthodox/Ornaments";
import { ChapterSection, EmptyState, GlowCard, Reveal } from "@/components/sections/common";
import type { SectionProps } from "@/components/sections/ContentSections";
import { FilterChips } from "@/components/sections/MediaSections";
import { useParishToday } from "@/components/sections/useParishDays";

const STORE_KEY = `lavra-connect-${site.id}`;

/** Remembers sample sign-ups in this browser so counts move after an RSVP. */
function useJoined() {
  const [joined, setJoined] = useState<string[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setJoined(JSON.parse(raw));
    } catch {}
  }, []);
  const join = useCallback((key: string) => {
    setJoined((list) => {
      const next = list.includes(key) ? list : [...list, key];
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);
  return { joined, join };
}

export function ConnectBadge({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const { t } = useI18n();
  return (
    <span
      className={cn(
        "label-sc inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.75rem] font-bold whitespace-nowrap",
        tone === "dark" ? "border-lapis/30 bg-lapis/[0.07] text-lapis" : "border-white/30 bg-white/10 text-[#f6ecd6]",
        className,
      )}
    >
      <Link2 className="size-3" aria-hidden="true" />
      {t("connect.on")}
    </span>
  );
}

function Capacity({ signups, capacity }: { signups: number; capacity: number }) {
  const { t } = useI18n();
  const left = Math.max(0, capacity - signups);
  const pct = Math.min(100, Math.round((signups / capacity) * 100));
  return (
    <div className="grid gap-1">
      <div className="flex justify-between gap-2 text-[0.85rem]">
        <span className="inline-flex items-center gap-1 text-ink-soft">
          <Users className="size-3.5" aria-hidden="true" />
          {t("connect.signedUp", { n: signups, capacity })}
        </span>
        <span className={cn("font-bold", left === 0 ? "text-cinnabar" : left <= 3 ? "text-ochre-deep" : "text-verdigris")}>{left === 0 ? t("connect.full") : t("connect.left", { n: left })}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#e6d6b3]" role="progressbar" aria-valuemin={0} aria-valuemax={capacity} aria-valuenow={signups} aria-label={t("connect.capacity")}>
        <div className={cn("h-full rounded-full", left === 0 ? "bg-cinnabar" : "bg-lapis")} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

interface SignupTarget {
  kind: "event" | "need";
  id: string;
  slotId?: string;
  title: string;
  when: string;
  where: string;
}

function ConnectDialog({ target, onClose, onJoined }: { target: SignupTarget | null; onClose: () => void; onJoined: (key: string) => void }) {
  const { t } = useI18n();
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [shown, setShown] = useState<SignupTarget | null>(target);
  if (target && target !== shown) {
    setShown(target);
    setState("idle");
  }
  const tgt = target ?? shown;
  const go = async () => {
    if (!tgt) return;
    setState("busy");
    await connectSignUp({ kind: tgt.kind, id: tgt.id, slotId: tgt.slotId });
    onJoined(tgt.slotId ?? tgt.id);
    setState("done");
  };
  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="overflow-hidden border border-[#d5bd8c] bg-vellum p-0 sm:max-w-md">
        <PaintedBand variant="teeth" />
        {tgt && (
          <div className="grid gap-4 p-6">
            <ConnectBadge className="justify-self-start" />
            <DialogTitle className="font-heading text-[1.6rem] font-bold leading-tight">{tgt.title}</DialogTitle>
            <DialogDescription render={<div />} className="grid gap-1.5 text-[0.98rem] text-ink-soft">
              <span className="flex gap-2">
                <Clock className="mt-1 size-4 shrink-0 text-ochre-deep" aria-hidden="true" />
                {tgt.when}
              </span>
              <span className="flex gap-2">
                <MapPin className="mt-1 size-4 shrink-0 text-ochre-deep" aria-hidden="true" />
                {tgt.where}
              </span>
            </DialogDescription>
            {state === "done" ? (
              <p role="status" className="rounded-md border border-verdigris/40 bg-verdigris/10 p-3 text-[0.98rem]">
                {t(tgt.kind === "event" ? "connect.rsvpDone" : "connect.slotDone")}
              </p>
            ) : (
              <p className="text-[0.98rem]">{t("connect.accountNote")}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {state !== "done" ? (
                <button type="button" onClick={go} disabled={state === "busy"} className="btn-lavra btn-lapis">
                  {state === "busy" && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                  {t("connect.continue")}
                </button>
              ) : (
                <button type="button" onClick={onClose} className="btn-lavra btn-lapis">
                  {t("action.close")}
                </button>
              )}
              <a href={connectLink(tgt.kind, { id: tgt.id })} target="_blank" rel="noopener noreferrer" className="btn-lavra btn-ghost">
                {t("connect.openApp")}
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            </div>
            <p className="text-[0.82rem] text-ink-faint">{t("sample.noData")}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function useWhen() {
  const { fmtIso, fmtTime } = useI18n();
  return (date: string, time: string, end?: string) =>
    `${fmtIso(date, { weekday: "long", month: "long", day: "numeric" })}, ${fmtTime(time)}${end ? ` \u2013 ${fmtTime(end)}` : ""}`;
}

function DateBlock({ iso }: { iso: string }) {
  const { fmtIso } = useI18n();
  const red = weekday(jdnFromIso(iso)) === 0;
  return (
    <div className="w-[4.6rem] shrink-0 overflow-hidden rounded-[4px] border border-[#cdb27c] bg-[#fffaf0] text-center shadow-sm" aria-hidden="true">
      <div className="label-sc bg-cinnabar px-1 py-0.5 text-[0.75rem] font-bold text-[#fff3df]">{fmtIso(iso, { month: "short" })}</div>
      <div className={cn("font-heading text-[2rem] font-extrabold leading-[1.15]", red ? "text-cinnabar" : "text-ink")}>{fmtIso(iso, { day: "numeric" })}</div>
      <div className="label-sc pb-1 text-[0.72rem] text-ink-soft">{fmtIso(iso, { weekday: "short" })}</div>
    </div>
  );
}

function EventCard({ ev, joined, onRsvp }: { ev: ConnectEvent; joined: boolean; onRsvp: () => void }) {
  const { t, tr, fmtTime } = useI18n();
  const signups = ev.signups + (joined ? 1 : 0);
  const full = signups >= ev.capacity;
  const cat = connectEvents.categories.find((c) => c.id === ev.category);
  return (
    <GlowCard className="flex h-full flex-col p-4 sm:p-5">
      <div className="relative z-10 flex flex-1 flex-col">
        <div className="flex gap-4">
          <DateBlock iso={ev.date} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rubric text-[0.8rem]">{tr(cat?.label)}</span>
              <ConnectBadge />
            </div>
            <h3 className="mt-1 text-[1.25rem] leading-tight">{tr(ev.title)}</h3>
            <p className="mt-1.5 flex items-center gap-1.5 text-[0.93rem] text-ink-soft">
              <Clock className="size-3.5 shrink-0" aria-hidden="true" />
              {fmtTime(ev.time)}
              {ev.endTime ? ` \u2013 ${fmtTime(ev.endTime)}` : ""}
            </p>
            <p className="flex items-center gap-1.5 text-[0.93rem] text-ink-soft">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              {tr(ev.location)}
            </p>
          </div>
        </div>
        <p className="mt-3 text-[0.97rem] text-ink-soft">{tr(ev.description)}</p>
        <p className="mt-2 flex items-center gap-1.5 text-[0.88rem] text-ink-faint">
          <User className="size-3.5" aria-hidden="true" />
          {t("connect.organizer")}: {tr(ev.organizer)}
        </p>
        <div className="mt-auto grid gap-3 pt-4">
          <Capacity signups={signups} capacity={ev.capacity} />
          {joined ? (
            <p className="label-sc rounded-md bg-verdigris/15 px-3 py-2 text-center font-bold text-verdigris">{t("connect.going")}</p>
          ) : (
            <button type="button" onClick={onRsvp} disabled={full} className="btn-lavra btn-lapis w-full disabled:cursor-not-allowed disabled:opacity-50">
              {full ? t("connect.full") : t("connect.rsvp")}
            </button>
          )}
        </div>
      </div>
    </GlowCard>
  );
}

function CreateButton({ kind }: { kind: "createEvent" | "postNeed" }) {
  const { t } = useI18n();
  return (
    <a href={connectLink(kind)} target="_blank" rel="noopener noreferrer" className="btn-lavra btn-ghost shrink-0">
      <Plus className="size-4" aria-hidden="true" />
      {t(kind === "createEvent" ? "connect.createEvent" : "connect.postNeed")}
      <ExternalLink className="size-3.5 opacity-70" aria-hidden="true" />
    </a>
  );
}

function EventsCalendar({ events, joined, onPick }: { events: ConnectEvent[]; joined: string[]; onPick: (ev: ConnectEvent) => void }) {
  const { t, tr, fmtDay, fmtTime } = useI18n();
  const first = events[0]?.date ?? connectEvents.items[0]?.date ?? "2026-01-01";
  const [ym, setYm] = useState(() => {
    const [y, m] = first.split("-").map(Number);
    return { y, m };
  });
  const startJdn = jdnFromGregorian(ym.y, ym.m, 1);
  const nextM = ym.m === 12 ? { y: ym.y + 1, m: 1 } : { y: ym.y, m: ym.m + 1 };
  const endJdn = jdnFromGregorian(nextM.y, nextM.m, 1) - 1;
  const lead = weekday(startJdn);
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: endJdn - startJdn + 1 }, (_, i) => startJdn + i)];
  while (cells.length % 7) cells.push(null);
  const byDay = new Map<number, ConnectEvent[]>();
  for (const ev of events) {
    const j = jdnFromIso(ev.date);
    if (j >= startJdn && j <= endJdn) byDay.set(j, [...(byDay.get(j) ?? []), ev]);
  }
  const monthDays = [...byDay.keys()].sort((a, b) => a - b);
  const shift = (d: number) => setYm(({ y, m }) => (m + d === 0 ? { y: y - 1, m: 12 } : m + d === 13 ? { y: y + 1, m: 1 } : { y, m: m + d }));
  const weekdays = Array.from({ length: 7 }, (_, i) => fmtDay(jdnFromGregorian(2026, 11, 22) + i, { weekday: "short" }));

  return (
    <div className="fresco-card overflow-hidden p-0">
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2 bg-cinnabar px-3 py-2.5 text-[#fff3df] sm:px-5">
          <button type="button" onClick={() => shift(-1)} className="grid size-10 place-items-center rounded hover:bg-white/10" aria-label={t("schedule.prevMonth")}>
            <ChevronLeft className="size-5 rtl:rotate-180" aria-hidden="true" />
          </button>
          <p className="font-heading text-[1.4rem] font-bold capitalize sm:text-[1.7rem]" aria-live="polite">
            {fmtDay(startJdn, { month: "long", year: "numeric" })}
          </p>
          <button type="button" onClick={() => shift(1)} className="grid size-10 place-items-center rounded hover:bg-white/10" aria-label={t("schedule.nextMonth")}>
            <ChevronRight className="size-5 rtl:rotate-180" aria-hidden="true" />
          </button>
        </div>
        <PaintedBand variant="diamond" />
        <div className="hidden md:block">
          <div className="grid grid-cols-7 border-b border-[#d9c49a] bg-parchment-deep/60">
            {weekdays.map((w, i) => (
              <div key={i} className={cn("label-sc py-2 text-center text-[0.85rem] font-bold", i === 0 ? "text-cinnabar" : "text-ink-soft")}>
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((j, i) => (
              <div key={i} className={cn("min-h-28 border-e border-b border-[#e3d3ae] p-1.5", i % 7 === 6 && "border-e-0", !j && "bg-parchment/40")}>
                {j && (
                  <>
                    <p className={cn("font-heading text-lg font-bold", weekday(j) === 0 ? "text-cinnabar" : "text-ink")}>{gregorianFromJdn(j).d}</p>
                    <ul className="mt-1 grid gap-1">
                      {(byDay.get(j) ?? []).map((ev) => (
                        <li key={ev.id}>
                          <button
                            type="button"
                            onClick={() => onPick(ev)}
                            className={cn(
                              "w-full truncate rounded px-1.5 py-1 text-start text-[0.8rem] leading-tight",
                              joined.includes(ev.id) ? "bg-verdigris/20 text-ink" : "bg-lapis/10 text-lapis-deep hover:bg-lapis/20",
                            )}
                          >
                            <span className="font-bold tabular-nums">{fmtTime(ev.time)}</span> {tr(ev.title)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        <ul className="divide-y divide-dashed divide-[#d9c49a] md:hidden">
          {monthDays.length === 0 && <li className="p-5 text-center text-ink-soft">{t("connect.noEventsMonth")}</li>}
          {monthDays.map((j) => (
            <li key={j} className="flex gap-3 p-4">
              <p className={cn("w-12 shrink-0 text-center font-heading text-[1.7rem] font-extrabold leading-none", weekday(j) === 0 ? "text-cinnabar" : "text-ink")}>
                {gregorianFromJdn(j).d}
                <span className="label-sc mt-1 block text-[0.72rem] font-normal text-ink-soft">{fmtDay(j, { weekday: "short" })}</span>
              </p>
              <ul className="grid min-w-0 flex-1 gap-1.5">
                {byDay.get(j)!.map((ev) => (
                  <li key={ev.id}>
                    <button type="button" onClick={() => onPick(ev)} className="w-full rounded bg-lapis/10 px-2.5 py-2 text-start text-[0.95rem] text-lapis-deep">
                      <span className="font-bold tabular-nums">{fmtTime(ev.time)}</span> {tr(ev.title)}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Events({ section }: SectionProps) {
  const { t, tr } = useI18n();
  const today = useParishToday();
  const when = useWhen();
  const { joined, join } = useJoined();
  const [view, setView] = useState<"list" | "calendar">(section.props.defaultView === "calendar" ? "calendar" : "list");
  const [cat, setCat] = useState("all");
  const [target, setTarget] = useState<SignupTarget | null>(null);

  const events = useMemo(() => {
    const sorted = connectEvents.items.slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const upcoming = today ? sorted.filter((e) => jdnFromIso(e.date) >= today.jdn) : sorted;
    return upcoming.filter((e) => cat === "all" || e.category === cat);
  }, [today, cat]);

  const openRsvp = (ev: ConnectEvent) => setTarget({ kind: "event", id: ev.id, title: tr(ev.title), when: when(ev.date, ev.time, ev.endTime), where: tr(ev.location) });
  const options = [{ id: "all", label: t("filter.all") }, ...connectEvents.categories.map((c) => ({ id: c.id, label: tr(c.label) }))];

  return (
    <section id={section.id} className="py-8 sm:py-12">
      <div className="container-lavra">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div role="tablist" aria-label={t("schedule.view")} className="inline-grid grid-cols-2 self-start rounded-md border border-[#c9ad78] bg-parchment/60 p-1">
            {(["list", "calendar"] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={cn("label-sc inline-flex items-center justify-center gap-1.5 rounded px-4 py-2 text-[0.98rem] font-bold", view === v ? "bg-lapis text-[#fff8ea] shadow" : "text-ink-soft hover:text-ink")}
              >
                {v === "list" ? <List className="size-4" aria-hidden="true" /> : <CalendarDays className="size-4" aria-hidden="true" />}
                {t(`connect.view.${v}`)}
              </button>
            ))}
          </div>
          <CreateButton kind="createEvent" />
        </div>
        <div className="mt-5">
          <FilterChips options={options} value={cat} onChange={setCat} label={t("filter.byCategory")} />
        </div>
        <div className="mt-7">
          {view === "calendar" ? (
            <EventsCalendar events={events} joined={joined} onPick={openRsvp} />
          ) : events.length ? (
            <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {events.map((ev, i) => (
                <Reveal as="li" key={ev.id} delay={(i % 3) * 60}>
                  <EventCard ev={ev} joined={joined.includes(ev.id)} onRsvp={() => openRsvp(ev)} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <EmptyState title={t("connect.noEvents")} text={t("connect.noEventsText")} icon={<Pictogram name="bells" className="size-10 text-ochre-deep" />} />
          )}
        </div>
        <p className="mt-6 text-[0.88rem] text-ink-faint">{t("connect.sourceNote")}</p>
      </div>
      <ConnectDialog target={target} onClose={() => setTarget(null)} onJoined={join} />
    </section>
  );
}

function SlotRow({ slot, joined, onSign }: { slot: NeedSlot; joined: boolean; onSign: () => void }) {
  const { t, fmtIso, fmtTime } = useI18n();
  const signups = slot.signups + (joined ? 1 : 0);
  const full = signups >= slot.capacity;
  return (
    <li className="grid gap-2 py-3 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
      <p className="leading-tight">
        <span className="block font-bold whitespace-nowrap capitalize">{fmtIso(slot.date, { weekday: "short", month: "short", day: "numeric" })}</span>
        <span className="text-[0.92rem] text-ink-soft tabular-nums">{fmtTime(slot.time)}</span>
      </p>
      <Capacity signups={signups} capacity={slot.capacity} />
      {joined ? (
        <span className="label-sc rounded-md bg-verdigris/15 px-3 py-2 text-center text-[0.9rem] font-bold text-verdigris">{t("connect.youreIn")}</span>
      ) : (
        <button type="button" onClick={onSign} disabled={full} className="btn-lavra btn-lapis min-h-10 px-4 py-1.5 text-[0.95rem] disabled:cursor-not-allowed disabled:opacity-50">
          {full ? t("connect.full") : t("connect.signUp")}
        </button>
      )}
    </li>
  );
}

export function Needs({ section }: SectionProps) {
  const { t, tr, fmtIso, fmtTime } = useI18n();
  const { joined, join } = useJoined();
  const today = useParishToday();
  const [cat, setCat] = useState("all");
  const [target, setTarget] = useState<SignupTarget | null>(null);
  const needs = connectNeeds.items
    .filter((n) => cat === "all" || n.category === cat)
    .map((n) => ({ ...n, slots: today ? n.slots.filter((s) => jdnFromIso(s.date) >= today.jdn) : n.slots }))
    .filter((n) => n.slots.length);
  const options = [{ id: "all", label: t("filter.all") }, ...connectNeeds.categories.map((c) => ({ id: c.id, label: tr(c.label) }))];

  return (
    <section id={section.id} className="py-8 sm:py-12">
      <div className="container-lavra">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <FilterChips options={options} value={cat} onChange={setCat} label={t("filter.byCategory")} />
          <CreateButton kind="postNeed" />
        </div>
        {needs.length ? (
          <ul className="mt-7 grid gap-6 lg:grid-cols-2">
            {needs.map((n, i) => {
              const c = connectNeeds.categories.find((x) => x.id === n.category);
              return (
                <Reveal as="li" key={n.id} delay={(i % 2) * 60}>
                  <GlowCard className="h-full p-5 sm:p-6">
                    <div className="relative z-10">
                      <div className="flex gap-4">
                        <span className="grid size-14 shrink-0 place-items-center rounded-full border border-[#d9c49a] bg-parchment-deep text-cinnabar">
                          <Pictogram name={c?.icon ?? "church"} className="size-8" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rubric text-[0.8rem]">{tr(c?.label)}</span>
                            <ConnectBadge />
                          </div>
                          <h3 className="mt-1 text-[1.35rem] leading-tight">{tr(n.title)}</h3>
                          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-[0.9rem] text-ink-soft">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="size-3.5" aria-hidden="true" />
                              {tr(n.location)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <User className="size-3.5" aria-hidden="true" />
                              {tr(n.organizer)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-[0.98rem] text-ink-soft">{tr(n.description)}</p>
                      <h4 className="label-sc mt-4 text-[0.95rem] font-bold">{t("connect.slots")}</h4>
                      <ul className="divide-y divide-dashed divide-[#d9c49a]">
                        {n.slots.map((s) => (
                          <SlotRow
                            key={s.id}
                            slot={s}
                            joined={joined.includes(s.id)}
                            onSign={() =>
                              setTarget({
                                kind: "need",
                                id: n.id,
                                slotId: s.id,
                                title: tr(n.title),
                                when: `${fmtIso(s.date, { weekday: "long", month: "long", day: "numeric" })}, ${fmtTime(s.time)}`,
                                where: tr(n.location),
                              })
                            }
                          />
                        ))}
                      </ul>
                    </div>
                  </GlowCard>
                </Reveal>
              );
            })}
          </ul>
        ) : (
          <div className="mt-7">
            <EmptyState title={t("connect.noNeeds")} text={t("connect.noNeedsText")} icon={<Pictogram name="church" className="size-10 text-ochre-deep" />} />
          </div>
        )}
        <p className="mt-6 text-[0.88rem] text-ink-faint">{t("connect.sourceNote")}</p>
      </div>
      <ConnectDialog target={target} onClose={() => setTarget(null)} onJoined={join} />
    </section>
  );
}

export function InvolvedHighlights({ section, numeral }: SectionProps) {
  const { lang, t, tr, fmtIso, fmtTime } = useI18n();
  const today = useParishToday();
  const p = section.props;
  const upcoming = connectEvents.items
    .slice()
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .filter((e) => !today || jdnFromIso(e.date) >= today.jdn)
    .slice(0, 3);
  const openSlots = connectNeeds.items
    .flatMap((n) => n.slots.filter((s) => s.signups < s.capacity && (!today || jdnFromIso(s.date) >= today.jdn)).map((s) => ({ n, s })))
    .sort((a, b) => a.s.date.localeCompare(b.s.date))
    .slice(0, 4);
  const title = tr(p.title) || t("connect.highlightsTitle");

  return (
    <ChapterSection
      id={section.id}
      numeral={numeral}
      title={title}
      intro={tr(p.intro) || undefined}
      tone="lapis"
      headerAside={
        <div className="flex flex-wrap gap-2">
          <a href={connectLink("createEvent")} target="_blank" rel="noopener noreferrer" className="btn-lavra btn-ghost border-white/40 text-[#fbf1da] hover:bg-white/10">
            <Plus className="size-4" aria-hidden="true" />
            {t("connect.createEvent")}
          </a>
          <a href={connectLink("postNeed")} target="_blank" rel="noopener noreferrer" className="btn-lavra btn-ghost border-white/40 text-[#fbf1da] hover:bg-white/10">
            <Plus className="size-4" aria-hidden="true" />
            {t("connect.postNeed")}
          </a>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-white/15 bg-white/[0.06] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[1.5rem]">{t("connect.upcomingEvents")}</h3>
            <ConnectBadge tone="light" />
          </div>
          <ul className="mt-4 grid gap-3">
            {upcoming.map((ev) => (
              <li key={ev.id} className="flex items-center gap-3 rounded-md bg-[#fbf5e6] p-2.5 pe-3 text-ink">
                <DateBlock iso={ev.date} />
                <div className="min-w-0">
                  <p className="font-heading text-[1.1rem] font-bold leading-tight">{tr(ev.title)}</p>
                  <p className="text-[0.9rem] text-ink-soft">
                    {fmtTime(ev.time)} · {tr(ev.location)}
                  </p>
                  <p className="text-[0.85rem] text-ink-faint">{t("connect.left", { n: Math.max(0, ev.capacity - ev.signups) })}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link href={pagePath(lang, "events")} className="label-sc mt-4 inline-flex items-center gap-1.5 font-bold text-ochre-light hover:underline">
            {t("connect.allEvents")}
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>
        <div className="rounded-md border border-white/15 bg-white/[0.06] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[1.5rem]">{t("connect.helpNeeded")}</h3>
            <ConnectBadge tone="light" />
          </div>
          <ul className="mt-4 grid gap-3">
            {openSlots.map(({ n, s }) => {
              const c = connectNeeds.categories.find((x) => x.id === n.category);
              return (
                <li key={s.id} className="flex items-center gap-3 rounded-md bg-[#fbf5e6] p-3 text-ink">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-parchment-deep text-cinnabar">
                    <Pictogram name={c?.icon ?? "church"} className="size-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-[1.08rem] font-bold leading-tight">{tr(n.title)}</p>
                    <p className="text-[0.9rem] capitalize text-ink-soft">
                      {fmtIso(s.date, { weekday: "short", month: "short", day: "numeric" })} · {fmtTime(s.time)}
                    </p>
                  </div>
                  <span className="label-sc shrink-0 rounded-full bg-ochre/20 px-2 py-0.5 text-[0.8rem] font-bold text-ochre-deep">{t("connect.left", { n: s.capacity - s.signups })}</span>
                </li>
              );
            })}
          </ul>
          <Link href={pagePath(lang, "volunteer")} className="label-sc mt-4 inline-flex items-center gap-1.5 font-bold text-ochre-light hover:underline">
            {t("connect.allNeeds")}
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </ChapterSection>
  );
}
