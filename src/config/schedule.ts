/**
 * Sample weekly services and upcoming feasts.
 * Times are local; edit freely for your parish.
 */
export type ScheduleItem = {
  id: string;
  title: { ro: string; en: string };
  description: { ro: string; en: string };
  /** ISO date YYYY-MM-DD (civil / new calendar) */
  date: string;
  startTime: string; // HH:mm
  endTime: string;
  location?: { ro: string; en: string };
};

/** Offset in days: Old Style (Julian) is typically 13 days behind New Style */
export const OLD_STYLE_OFFSET_DAYS = 13;

const thisWeekServicesRaw: ScheduleItem[] = [
  {
    id: 'akathist-wed',
    title: { ro: 'Acatist', en: 'Akathist' },
    description: {
      ro: 'Acatistul Maicii Domnului.',
      en: 'Akathist to the Theotokos.',
    },
    date: nextWeekdayDate(3),
    startTime: '18:00',
    endTime: '18:45',
  },
  {
    id: 'vespers-sat',
    title: { ro: 'Vecernie', en: 'Vespers' },
    description: {
      ro: 'Slujba de seară de sâmbătă.',
      en: 'Saturday evening service.',
    },
    date: nextWeekdayDate(6),
    startTime: '17:00',
    endTime: '18:00',
  },
  {
    id: 'liturgy-sun',
    title: { ro: 'Sfânta Liturghie', en: 'Divine Liturgy' },
    description: {
      ro: 'Sfânta Liturghie duminicală.',
      en: 'Sunday Divine Liturgy.',
    },
    date: nextWeekdayDate(0),
    startTime: '09:00',
    endTime: '11:00',
  },
];

/** Always chronological by date, then start time */
export const thisWeekServices: ScheduleItem[] = [...thisWeekServicesRaw].sort(
  (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
);

export const nextFeast: ScheduleItem = {
  id: 'feast-nicholas',
  title: {
    ro: 'Sfântul Ierarh Nicolae',
    en: 'Saint Nicholas the Wonderworker',
  },
  description: {
    ro: 'Hramul parohiei. Sfânta Liturghie arhierească.',
    en: 'Parish feast day. Hierarchical Divine Liturgy.',
  },
  date: nextOrSameMonthDay(12, 6),
  startTime: '09:00',
  endTime: '12:00',
};

export const upcomingEvents: ScheduleItem[] = [
  nextFeast,
  {
    id: 'concert-colinde',
    title: { ro: 'Concert de colinde', en: 'Carol concert' },
    description: {
      ro: 'Corul parohiei prezintă colinde tradiționale.',
      en: 'Parish choir presents traditional carols.',
    },
    date: nextOrSameMonthDay(12, 20),
    startTime: '18:00',
    endTime: '19:30',
  },
  {
    id: 'catechesis-meeting',
    title: { ro: 'Adunare parohială', en: 'Parish assembly' },
    description: {
      ro: 'Adunarea anuală a credincioșilor.',
      en: 'Annual assembly of the faithful.',
    },
    date: nextOrSameMonthDay(1, 15),
    startTime: '12:00',
    endTime: '13:30',
  },
].sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

export const newsItems = [
  {
    id: 'news-1',
    date: '2026-11-10',
    title: {
      ro: 'Lucrări de întreținere la acoperiș',
      en: 'Roof maintenance works',
    },
    summary: {
      ro: 'În următoarele săptămâni se vor desfășura lucrări de reparație.',
      en: 'Repair works will take place over the coming weeks.',
    },
  },
  {
    id: 'news-2',
    date: '2026-11-01',
    title: {
      ro: 'Program special de pomeniri',
      en: 'Special memorial schedule',
    },
    summary: {
      ro: 'Pomelnicele pot fi depuse la pangar în timpul săptămânii.',
      en: 'Commemoration lists may be submitted at the candle desk during the week.',
    },
  },
  {
    id: 'news-3',
    date: '2026-10-20',
    title: {
      ro: 'Mulțumiri pentru donatori',
      en: 'Thanks to donors',
    },
    summary: {
      ro: 'Mulțumim tuturor celor care au sprijinit parohia în această lună.',
      en: 'We thank all who supported the parish this month.',
    },
  },
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Next occurrence of weekday (0=Sun … 6=Sat), including today */
function nextWeekdayDate(weekday: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  const diff = (weekday - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff);
  return toISODate(d);
}

/** Next occurrence of month/day (1-based month), including this year if upcoming */
function nextOrSameMonthDay(month: number, day: number): string {
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  let d = new Date(now.getFullYear(), month - 1, day, 12);
  if (d < now) {
    d = new Date(now.getFullYear() + 1, month - 1, day, 12);
  }
  return toISODate(d);
}

export function oldStyleDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d, 12);
  dt.setDate(dt.getDate() - OLD_STYLE_OFFSET_DAYS);
  return toISODate(dt);
}
