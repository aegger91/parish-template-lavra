import { gregorianFromJdn } from "./calendar";
import { site } from "./content";

export interface CalendarEventInput {
  id: string;
  title: string;
  description?: string;
  location: string;
  jdn: number;
  time: string;
  durationMinutes: number;
  endTime?: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function parseTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  return { h, m };
}

function addMinutes(h: number, m: number, mins: number) {
  const total = h * 60 + m + mins;
  return { h: Math.floor(total / 60) % 24, m: total % 60, dayOffset: Math.floor(total / 1440) };
}

/** Local civil stamp for .ics (floating local time; TZID in the parish zone). */
function stamp(jdn: number, h: number, m: number) {
  const { y, m: mo, d } = gregorianFromJdn(jdn);
  return `${y}${pad(mo)}${pad(d)}T${pad(h)}${pad(m)}00`;
}

function stampUtcNow() {
  const n = new Date();
  return `${n.getUTCFullYear()}${pad(n.getUTCMonth() + 1)}${pad(n.getUTCDate())}T${pad(n.getUTCHours())}${pad(n.getUTCMinutes())}${pad(n.getUTCSeconds())}Z`;
}

function icsEscape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function endParts(ev: CalendarEventInput) {
  const start = parseTime(ev.time);
  if (ev.endTime) {
    return { start, end: parseTime(ev.endTime), endJdn: ev.jdn };
  }
  const end = addMinutes(start.h, start.m, Math.max(30, ev.durationMinutes || 60));
  return { start, end, endJdn: ev.jdn + end.dayOffset };
}

export function buildIcs(ev: CalendarEventInput) {
  const { start, end, endJdn } = endParts(ev);
  const tz = site.parish.timeZone;
  const uid = `${ev.id}@${site.id}`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//OrthodoxConnect//Lavra//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stampUtcNow()}`,
    `DTSTART;TZID=${tz}:${stamp(ev.jdn, start.h, start.m)}`,
    `DTEND;TZID=${tz}:${stamp(endJdn, end.h, end.m)}`,
    `SUMMARY:${icsEscape(ev.title)}`,
    `LOCATION:${icsEscape(ev.location)}`,
  ];
  if (ev.description) lines.push(`DESCRIPTION:${icsEscape(ev.description)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadIcs(ev: CalendarEventInput, filename?: string) {
  const blob = new Blob([buildIcs(ev)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `${ev.id}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Google Calendar template link with parish time zone. */
export function googleCalendarUrl(ev: CalendarEventInput) {
  const { start, end, endJdn } = endParts(ev);
  const { y, m, d } = gregorianFromJdn(ev.jdn);
  const e = gregorianFromJdn(endJdn);
  const fmt = (yy: number, mm: number, dd: number, h: number, mi: number) =>
    `${yy}${pad(mm)}${pad(dd)}T${pad(h)}${pad(mi)}00`;
  const dates = `${fmt(y, m, d, start.h, start.m)}/${fmt(e.y, e.m, e.d, end.h, end.m)}`;
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: ev.title,
    dates,
    details: ev.description ?? "",
    location: ev.location,
    ctz: site.parish.timeZone,
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}
