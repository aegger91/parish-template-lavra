import type {
  CalendarStyle,
  FeastRank,
  FixedFeast,
  Localized,
  MovableFeast,
  ServiceTemplate,
  SiteConfig,
  SpecialService,
  WeeklyService,
} from "./types";

/*
  Dates are handled as Julian Day Numbers (integers), which makes it easy
  to move between the civil (Gregorian) calendar and the Julian church calendar.
*/

export interface YMD {
  y: number;
  m: number;
  d: number;
}

export function jdnFromGregorian(y: number, m: number, d: number) {
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
}

export function jdnFromJulian(y: number, m: number, d: number) {
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + Math.floor(y2 / 4) - 32083;
}

export function gregorianFromJdn(j: number): YMD {
  const a = j + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    d: e - Math.floor((153 * m + 2) / 5) + 1,
    m: m + 3 - 12 * Math.floor(m / 10),
    y: 100 * b + d - 4800 + Math.floor(m / 10),
  };
}

export function julianFromJdn(j: number): YMD {
  const c = j + 32082;
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    d: e - Math.floor((153 * m + 2) / 5) + 1,
    m: m + 3 - 12 * Math.floor(m / 10),
    y: d - 4800 + Math.floor(m / 10),
  };
}

/** Sunday = 0 ... Saturday = 6 */
export function weekday(j: number) {
  return (j + 1) % 7;
}

export function isoFromJdn(j: number) {
  const { y, m, d } = gregorianFromJdn(j);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function jdnFromIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return jdnFromGregorian(y, m, d);
}

/** A JS Date at local midnight for display with Intl. */
export function dateFromJdn(j: number) {
  const { y, m, d } = gregorianFromJdn(j);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

/** Orthodox Pascha (Julian computus), as a civil date. */
export function orthodoxPaschaJdn(year: number) {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  return jdnFromJulian(year, month, day);
}

/**
 * Movable (Pascha-based) feasts use the Orthodox computus for both old and new calendars.
 * Fixed feasts follow Julian (old) or Revised Julian / civil (new).
 */
export function paschaJdn(year: number, _style?: CalendarStyle) {
  return orthodoxPaschaJdn(year);
}

/** The church (liturgical) date for a civil day. Old = Julian; New = Revised Julian (civil). */
export function churchDate(j: number, style: CalendarStyle): YMD {
  return style === "old" ? julianFromJdn(j) : gregorianFromJdn(j);
}

function churchJdn(style: CalendarStyle, y: number, m: number, d: number) {
  return style === "old" ? jdnFromJulian(y, m, d) : jdnFromGregorian(y, m, d);
}

/** Short month+day in a locale (UTC civil parts). */
export function formatYmd(locale: string, ymd: YMD, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) {
  return new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...opts }).format(new Date(Date.UTC(2000, ymd.m - 1, ymd.d)));
}

export interface FeastOccurrence {
  id: string;
  jdn: number;
  rank: FeastRank;
  name: Localized;
  source: FixedFeast | MovableFeast;
}

export function feastsInRange(
  start: number,
  end: number,
  style: CalendarStyle,
  data: { fixed: FixedFeast[]; movable: MovableFeast[] },
): FeastOccurrence[] {
  const out: FeastOccurrence[] = [];
  const y0 = churchDate(start, style).y - 1;
  const y1 = churchDate(end, style).y + 1;
  for (let y = y0; y <= y1; y++) {
    for (const f of data.fixed) {
      const j = churchJdn(style, y, f.month, f.day);
      if (j >= start && j <= end) out.push({ id: f.id, jdn: j, rank: f.rank, name: f.name, source: f });
    }
  }
  const g0 = gregorianFromJdn(start).y;
  const g1 = gregorianFromJdn(end).y;
  for (let y = g0; y <= g1; y++) {
    const p = paschaJdn(y, style);
    for (const f of data.movable) {
      const j = p + f.paschaOffset;
      if (j >= start && j <= end) out.push({ id: f.id, jdn: j, rank: f.rank, name: f.name, source: f });
    }
  }
  const rankOrder: Record<FeastRank, number> = { pascha: 0, great: 1, major: 2, commemoration: 3 };
  return out.sort((a, b) => a.jdn - b.jdn || rankOrder[a.rank] - rankOrder[b.rank]);
}

export type FastKind = "fast" | "strict";
export interface FastInfo {
  kind: FastKind;
  period: "great-lent" | "apostles" | "dormition" | "nativity" | "wednesday-friday" | "strict-day";
}

/** General fasting guide. Parishes may follow local custom; this marks the common days only. */
export function fastingFor(j: number, style: CalendarStyle): FastInfo | null {
  const { m, d } = churchDate(j, style);
  const p = paschaJdn(gregorianFromJdn(j).y, style);
  const off = j - p;

  if ((m === 12 && d >= 25) || (m === 1 && d <= 4)) return null;
  if (off >= -70 && off <= -64) return null;
  if (off >= 0 && off <= 6) return null;
  if (off >= 50 && off <= 56) return null;

  if ((m === 1 && d === 5) || (m === 8 && d === 29) || (m === 9 && d === 14)) return { kind: "strict", period: "strict-day" };
  if (off >= -48 && off <= -1) return { kind: off === -2 ? "strict" : "fast", period: "great-lent" };
  if (off >= 57 && (m < 6 || (m === 6 && d <= 28))) return { kind: "fast", period: "apostles" };
  if (m === 8 && d >= 1 && d <= 14) return { kind: "fast", period: "dormition" };
  if ((m === 11 && d >= 15) || (m === 12 && d <= 24)) return { kind: "fast", period: "nativity" };

  const wd = weekday(j);
  if (wd === 3 || wd === 5) return { kind: "fast", period: "wednesday-friday" };
  return null;
}

export interface ServiceOccurrence {
  id: string;
  jdn: number;
  time: string;
  minutes: number;
  durationMinutes: number;
  kind: string;
  livestream: boolean;
  name: Localized;
  note?: Localized;
  feastId?: string;
}

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function fromTemplate(id: string, jdn: number, t: ServiceTemplate, extra?: Partial<ServiceOccurrence>): ServiceOccurrence {
  return {
    id,
    jdn,
    time: t.time,
    minutes: toMinutes(t.time),
    durationMinutes: t.durationMinutes,
    kind: t.kind,
    livestream: t.livestream,
    name: t.name,
    ...extra,
  };
}

export interface DayInfo {
  jdn: number;
  iso: string;
  weekday: number;
  church: YMD;
  feasts: FeastOccurrence[];
  fast: FastInfo | null;
  services: ServiceOccurrence[];
}

export function buildDays(
  start: number,
  end: number,
  cfg: SiteConfig["calendar"],
  data: { fixed: FixedFeast[]; movable: MovableFeast[] },
  sched: { weekly: WeeklyService[]; special: SpecialService[] },
): DayInfo[] {
  const style = cfg.style;
  const feasts = feastsInRange(start - 1, end + 1, style, data);
  const days: DayInfo[] = [];
  for (let j = start; j <= end; j++) {
    const dayFeasts = feasts.filter((f) => f.jdn === j);
    const nextDayFeasts = feasts.filter((f) => f.jdn === j + 1);
    let services: ServiceOccurrence[] = sched.weekly
      .filter((w) => w.dayOfWeek === weekday(j))
      .map((w) => fromTemplate(`${w.id}-${j}`, j, w, { note: w.note }));

    for (const f of [...dayFeasts, ...nextDayFeasts]) {
      const custom = f.source.services;
      if (custom && custom.length) {
        for (const s of custom) {
          if (f.jdn + s.dayOffset === j) services.push(fromTemplate(`${f.id}-${s.id}-${j}`, j, s, { feastId: f.id }));
        }
        continue;
      }
      if (!cfg.autoServiceRanks.includes(f.rank)) continue;
      if (f.jdn === j + 1) {
        services = services.filter((s) => s.kind !== "vespers");
        services.push(fromTemplate(`${f.id}-eve-${j}`, j, cfg.feastEveService, { feastId: f.id }));
      } else if (f.jdn === j && weekday(j) !== 0) {
        services.push(fromTemplate(`${f.id}-day-${j}`, j, cfg.feastDayService, { feastId: f.id }));
      }
    }

    const iso = isoFromJdn(j);
    for (const s of sched.special) {
      if (s.date === iso) services.push(fromTemplate(`${s.id}`, j, s, { note: s.note }));
    }
    services.sort((a, b) => a.minutes - b.minutes);
    days.push({
      jdn: j,
      iso,
      weekday: weekday(j),
      church: churchDate(j, style),
      feasts: dayFeasts,
      fast: fastingFor(j, style),
      services,
    });
  }
  return days;
}

/** Current wall-clock date and minutes in the parish time zone. */
export function parishNow(timeZone: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return {
    jdn: jdnFromGregorian(get("year"), get("month"), get("day")),
    minutes: get("hour") * 60 + get("minute"),
  };
}

export function startOfWeek(j: number) {
  return j - weekday(j);
}

export function monthRange(y: number, m: number) {
  const start = jdnFromGregorian(y, m, 1);
  const next = m === 12 ? jdnFromGregorian(y + 1, 1, 1) : jdnFromGregorian(y, m + 1, 1);
  return { start, end: next - 1 };
}
