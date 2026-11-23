import { oldStyleDate, type ScheduleItem } from '../config/schedule';
import type { Locale } from '../config/site';
import { siteConfig } from '../config/site';

const localeTag: Record<Locale, string> = {
  ro: 'ro-RO',
  en: 'en-GB',
};

export function formatDate(iso: string, locale: Locale, options?: Intl.DateTimeFormatOptions): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d, 12);
  return dt.toLocaleDateString(localeTag[locale], options ?? {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatShortDate(iso: string, locale: Locale): string {
  return formatDate(iso, locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function displayDates(iso: string, locale: Locale) {
  const primary = formatDate(iso, locale);
  if (siteConfig.calendarStyle === 'old') {
    const oldIso = oldStyleDate(iso);
    return {
      primary,
      secondary: formatDate(oldIso, locale),
      secondaryIso: oldIso,
      showOld: true,
    };
  }
  return { primary, secondary: null as string | null, secondaryIso: null as string | null, showOld: false };
}

export function buildIcs(item: ScheduleItem, locale: Locale, parishName: string): string {
  const dtStart = toIcsStamp(item.date, item.startTime);
  const dtEnd = toIcsStamp(item.date, item.endTime);
  const title = item.title[locale];
  const description = item.description[locale];
  const location = item.location?.[locale] ?? parishName;
  const uid = `${item.id}@parohie-template`;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Parish Template Romanian//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStart}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcs(title)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `LOCATION:${escapeIcs(location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function googleCalendarUrl(item: ScheduleItem, locale: Locale, parishName: string): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: item.title[locale],
    details: item.description[locale],
    location: item.location?.[locale] ?? parishName,
    dates: `${toIcsStamp(item.date, item.startTime)}/${toIcsStamp(item.date, item.endTime)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function toIcsStamp(date: string, time: string): string {
  const [y, m, d] = date.split('-');
  const [hh, mm] = time.split(':');
  return `${y}${m}${d}T${hh}${mm}00`;
}

function escapeIcs(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}
