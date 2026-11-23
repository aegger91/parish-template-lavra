"use client";

import { useEffect, useMemo, useState } from "react";
import { feasts, schedule, site } from "@/lib/content";
import { buildDays, parishNow, type DayInfo, type ServiceOccurrence } from "@/lib/calendar";

/** Today's date in the parish time zone. Null until the page has hydrated, so static HTML never shows a stale day. */
export function useParishToday() {
  const [now, setNow] = useState<{ jdn: number; minutes: number } | null>(null);
  useEffect(() => {
    const tick = () => setNow(parishNow(site.parish.timeZone));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export function useDays(start: number | null, end: number | null): DayInfo[] {
  return useMemo(() => (start == null || end == null ? [] : buildDays(start, end, site.calendar, feasts, schedule)), [start, end]);
}

export function upcomingServices(days: DayInfo[], now: { jdn: number; minutes: number }, count: number): ServiceOccurrence[] {
  const out: ServiceOccurrence[] = [];
  for (const d of days) {
    for (const s of d.services) {
      if (d.jdn > now.jdn || (d.jdn === now.jdn && s.minutes + s.durationMinutes > now.minutes)) out.push(s);
      if (out.length >= count) return out;
    }
  }
  return out;
}

export function isLiveNow(days: DayInfo[], now: { jdn: number; minutes: number } | null) {
  if (!site.features.livestream) return false;
  if (site.livestream.status === "live") return true;
  if (site.livestream.status === "offline" || !now) return false;
  const today = days.find((d) => d.jdn === now.jdn);
  return !!today?.services.some((s) => s.livestream && now.minutes >= s.minutes - 5 && now.minutes <= s.minutes + s.durationMinutes);
}
