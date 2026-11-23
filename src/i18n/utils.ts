import type { Locale } from './ui';
import { locales, defaultLocale } from './ui';

export function getLocaleFromUrl(url: URL): Locale {
  const [, maybe] = url.pathname.split('/');
  if (locales.includes(maybe as Locale)) return maybe as Locale;
  return defaultLocale;
}

const monthNames: Record<Locale, string[]> = {
  sr: [
    'јан',
    'феб',
    'мар',
    'апр',
    'мај',
    'јун',
    'јул',
    'авг',
    'сеп',
    'окт',
    'нов',
    'дец',
  ],
  lat: [
    'jan',
    'feb',
    'mar',
    'apr',
    'maj',
    'jun',
    'jul',
    'avg',
    'sep',
    'okt',
    'nov',
    'dec',
  ],
  en: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
};

const monthNamesFull: Record<Locale, string[]> = {
  sr: [
    'јануар',
    'фебруар',
    'март',
    'април',
    'мај',
    'јун',
    'јул',
    'август',
    'септембар',
    'октобар',
    'новембар',
    'децембар',
  ],
  lat: [
    'januar',
    'februar',
    'mart',
    'april',
    'maj',
    'jun',
    'jul',
    'avgust',
    'septembar',
    'oktobar',
    'novembar',
    'decembar',
  ],
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
};

export function formatDate(
  iso: string,
  locale: Locale,
  opts?: { full?: boolean },
): string {
  const d = new Date(iso + 'T12:00:00');
  const months = opts?.full ? monthNamesFull[locale] : monthNames[locale];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatServiceDateLabel(
  iso: string,
  locale: Locale,
  calendarStyle: 'new' | 'old',
  oldStyleDate: { month: number; day: number } | undefined,
  oldStyleSuffix: string,
): string {
  const d = new Date(iso + 'T12:00:00');
  const months = monthNames[locale];
  const civil = `${months[d.getMonth()]} ${d.getDate()}`;

  if (calendarStyle === 'old' && oldStyleDate) {
    const os = `${months[oldStyleDate.month - 1]} ${oldStyleDate.day}`;
    return `${civil} (${os} ${oldStyleSuffix})`;
  }

  if (calendarStyle === 'old') {
    // Approximate O.S. as 13 days earlier for display when not provided
    const os = new Date(d);
    os.setDate(os.getDate() - 13);
    return `${civil} (${months[os.getMonth()]} ${os.getDate()} ${oldStyleSuffix})`;
  }

  return civil;
}

export function buildIcs(opts: {
  title: string;
  description: string;
  location: string;
  date: string;
  start: string;
  end: string;
}): string {
  const stamp = (date: string, time: string) =>
    date.replace(/-/g, '') + 'T' + time.replace(':', '') + '00';
  const uid = `${opts.date}-${opts.start.replace(':', '')}@parish-template`;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Parish Template Serbian//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp(opts.date, opts.start)}Z`,
    `DTSTART:${stamp(opts.date, opts.start)}`,
    `DTEND:${stamp(opts.date, opts.end)}`,
    `SUMMARY:${escapeIcs(opts.title)}`,
    `DESCRIPTION:${escapeIcs(opts.description)}`,
    `LOCATION:${escapeIcs(opts.location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function escapeIcs(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export function googleCalendarUrl(opts: {
  title: string;
  description: string;
  location: string;
  date: string;
  start: string;
  end: string;
}): string {
  const fmt = (date: string, time: string) =>
    date.replace(/-/g, '') + 'T' + time.replace(':', '') + '00';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: opts.title,
    details: opts.description,
    location: opts.location,
    dates: `${fmt(opts.date, opts.start)}/${fmt(opts.date, opts.end)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function directionsUrl(query: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  const a = digits.slice(0, 3);
  const b = digits.slice(3, 6);
  const c = digits.slice(6, 10);
  if (digits.length <= 3) return a.length ? `(${a}` + (digits.length === 3 ? ')-' : '') : '';
  if (digits.length <= 6) return `(${a})-${b}`;
  return `(${a})-${b}-${c}`;
}
