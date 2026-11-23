"use client";

import type { ReactNode } from "react";
import { CalendarPlus, ExternalLink, MapPin, Navigation, Radio } from "lucide-react";
import { site } from "@/lib/content";
import { churchDate, formatYmd, type ServiceOccurrence } from "@/lib/calendar";
import { downloadIcs, googleCalendarUrl, type CalendarEventInput } from "@/lib/ics";
import type { Localized } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export interface DetailTarget {
  kind: "service" | "event";
  title: string;
  note: string;
  place: string;
  jdn: number;
  time: string;
  endTime?: string;
  durationMinutes: number;
  livestream?: boolean;
  id: string;
}

export function parishPlace(tr: (v: Localized) => string) {
  return site.contact.addressLines.join(", ") || tr(site.parish.shortName);
}

export function serviceDetailTarget(s: ServiceOccurrence, title: string, note: string, place: string): DetailTarget {
  return {
    kind: "service",
    id: s.id,
    title,
    note,
    place,
    jdn: s.jdn,
    time: s.time,
    durationMinutes: s.durationMinutes,
    livestream: s.livestream,
  };
}

function toCalendarInput(d: DetailTarget): CalendarEventInput {
  return {
    id: d.id,
    title: d.title,
    description: d.note,
    location: d.place,
    jdn: d.jdn,
    time: d.time,
    durationMinutes: d.durationMinutes,
    endTime: d.endTime,
  };
}

/** Civil date; when Old Calendar, append church date as O.S. */
export function useCivilWithOldStyle() {
  const { t, locale, fmtDay } = useI18n();
  return (jdn: number, opts?: Intl.DateTimeFormatOptions) => {
    const civil = fmtDay(jdn, opts ?? { weekday: "long", month: "long", day: "numeric" });
    if (site.calendar.style !== "old" || !site.calendar.showChurchDate) return civil;
    const church = formatYmd(locale, churchDate(jdn, "old"), { month: "short", day: "numeric" });
    return t("calendar.civilWithOldStyle", { civil, church });
  };
}

export function ServiceDetailPanel({
  target,
  onClose,
  extra,
}: {
  target: DetailTarget | null;
  onClose: () => void;
  extra?: ReactNode;
}) {
  const { t, fmtTime } = useI18n();
  const dateLabel = useCivilWithOldStyle();
  const d = target;
  const cal = d ? toCalendarInput(d) : null;
  const showLive = !!(d?.livestream && site.features.livestream);

  return (
    <Dialog open={!!target} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="border border-[#d5bd8c] bg-vellum p-6 sm:max-w-md" data-testid="schedule-detail-panel">
        {d && cal && (
          <>
            <DialogTitle className="font-heading text-2xl font-bold leading-snug text-ink">{d.title}</DialogTitle>
            <DialogDescription className="sr-only">{t("schedule.detailAria")}</DialogDescription>
            <dl className="grid gap-3 text-[0.98rem]">
              <div>
                <dt className="label-sc text-[0.78rem] text-ink-faint">{t("schedule.detailDate")}</dt>
                <dd className="mt-0.5 capitalize leading-snug text-ink">{dateLabel(d.jdn)}</dd>
              </div>
              <div>
                <dt className="label-sc text-[0.78rem] text-ink-faint">{t("schedule.detailTime")}</dt>
                <dd className="mt-0.5 tabular-nums text-ink">
                  {fmtTime(d.time)}
                  {d.endTime ? ` \u2013 ${fmtTime(d.endTime)}` : ""}
                </dd>
              </div>
              <div>
                <dt className="label-sc text-[0.78rem] text-ink-faint">{t("schedule.detailPlace")}</dt>
                <dd className="mt-0.5 flex items-start gap-1.5 leading-snug text-ink">
                  <MapPin className="mt-0.5 size-3.5 shrink-0 text-ochre-deep" aria-hidden="true" />
                  <span>{d.place}</span>
                </dd>
              </div>
              {d.note ? (
                <div>
                  <dt className="label-sc text-[0.78rem] text-ink-faint">{t("schedule.detailNote")}</dt>
                  <dd className="mt-0.5 leading-snug text-ink-soft">{d.note}</dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-2 flex flex-col gap-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  className="btn-lavra btn-ghost min-h-11 justify-center px-3 text-[0.95rem]"
                  onClick={() => downloadIcs(cal, `${d.id}.ics`)}
                  data-testid="add-to-calendar-ics"
                >
                  <CalendarPlus className="size-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0">{t("schedule.addToCalendar")}</span>
                </button>
                <a
                  href={googleCalendarUrl(cal)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-lavra btn-ghost min-h-11 justify-center px-3 text-[0.95rem]"
                >
                  <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0">{t("schedule.googleCalendar")}</span>
                </a>
              </div>
              <a
                href={site.contact.map.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-lavra btn-ghost min-h-11 justify-center px-3 text-[0.95rem]"
              >
                <Navigation className="size-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0">{t("schedule.getDirections")}</span>
              </a>
              {showLive ? (
                <a
                  href={site.livestream.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-lavra btn-primary min-h-11 justify-center px-3 text-[0.95rem]"
                >
                  <Radio className="size-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-0">{t("live.watch")}</span>
                </a>
              ) : null}
              {extra}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Clickable / keyboard-accessible schedule row. */
export function ServiceRowButton({
  children,
  onOpen,
  label,
  className,
  compact,
}: {
  children: ReactNode;
  onOpen: () => void;
  label: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      aria-label={label}
      className={cn(
        "w-full rounded text-start transition hover:bg-ochre/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lapis",
        compact ? "px-0.5 py-0.5" : "-mx-1 px-1 py-1.5",
        className,
      )}
    >
      {children}
    </button>
  );
}
