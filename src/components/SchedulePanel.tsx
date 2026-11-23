import { useEffect, useId, useRef, useState } from 'react';
import type { Locale } from '../i18n/ui';
import {
  buildIcs,
  directionsUrl,
  formatServiceDateLabel,
  googleCalendarUrl,
} from '../i18n/utils';

export interface SchedulePanelItem {
  id: string;
  title: string;
  description: string;
  date: string;
  start: string;
  end: string;
  location: string;
  oldStyleDate?: { month: number; day: number };
  feast?: string;
}

interface Labels {
  calendarOld: string;
  calendarNew: string;
  oldStyleSuffix: string;
  addToCalendar: string;
  googleCalendar: string;
  downloadIcs: string;
  directions: string;
  close: string;
  time: string;
  location: string;
  details: string;
  openDetails: string;
}

interface Props {
  items: SchedulePanelItem[];
  locale: Locale;
  calendarStyle: 'new' | 'old';
  mapQuery: string;
  labels: Labels;
}

export default function SchedulePanel({
  items,
  locale,
  calendarStyle,
  mapQuery,
  labels,
}: Props) {
  const [active, setActive] = useState<SchedulePanelItem | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!active) return;
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setActive(null);
    }
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [active]);

  function downloadIcs(item: SchedulePanelItem) {
    const ics = buildIcs({
      title: item.title,
      description: item.description,
      location: item.location,
      date: item.date,
      start: item.start,
      end: item.end,
    });
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <span className="calendar-badge">
        {calendarStyle === 'old' ? labels.calendarOld : labels.calendarNew}
      </span>
      <ul className="schedule-list">
        {items.map((item) => {
          const dateLabel = formatServiceDateLabel(
            item.date,
            locale,
            calendarStyle,
            item.oldStyleDate,
            labels.oldStyleSuffix,
          );
          return (
            <li key={item.id}>
              <button
                type="button"
                className="schedule-item"
                onClick={() => setActive(item)}
                aria-label={`${labels.openDetails}: ${item.title}`}
              >
                <span className="schedule-item__title">{item.title}</span>
                <span className="schedule-item__meta">
                  {dateLabel} · {item.start}-{item.end}
                </span>
                <span className="schedule-item__meta">{item.location}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {active && (
        <div
          className="panel-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActive(null);
          }}
        >
          <div
            className="panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <header>
              <div>
                <h3 id={titleId}>{active.title}</h3>
                {active.feast && (
                  <p className="hint" style={{ marginTop: '0.35rem' }}>
                    {active.feast}
                  </p>
                )}
              </div>
              <button
                ref={closeRef}
                type="button"
                className="icon-btn"
                onClick={() => setActive(null)}
                aria-label={labels.close}
              >
                ×
              </button>
            </header>
            <p>
              <strong>{labels.time}:</strong>{' '}
              {formatServiceDateLabel(
                active.date,
                locale,
                calendarStyle,
                active.oldStyleDate,
                labels.oldStyleSuffix,
              )}{' '}
              · {active.start}-{active.end}
            </p>
            <p>
              <strong>{labels.location}:</strong> {active.location}
            </p>
            <p>
              <strong>{labels.details}:</strong> {active.description}
            </p>
            <div className="panel-actions">
              <button
                type="button"
                className="btn"
                onClick={() => downloadIcs(active)}
              >
                {labels.downloadIcs}
              </button>
              <a
                className="btn btn--ghost"
                href={googleCalendarUrl({
                  title: active.title,
                  description: active.description,
                  location: active.location,
                  date: active.date,
                  start: active.start,
                  end: active.end,
                })}
                target="_blank"
                rel="noopener noreferrer"
              >
                {labels.googleCalendar}
              </a>
              <a
                className="btn btn--ghost"
                href={directionsUrl(mapQuery)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {labels.directions}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
