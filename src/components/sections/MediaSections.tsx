"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, ExternalLink, FileText, Headphones, Pause, Play, Radio, Search, Video, X } from "lucide-react";
import { clergy, gallery, news, sermons, site } from "@/lib/content";
import { firstPageWithSection, pagePath } from "@/lib/routes";
import type { Localized, NewsItem, Sermon } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers";
import { FrescoFrame } from "@/components/orthodox/Ornaments";
import { Pictogram } from "@/components/orthodox/Pictogram";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ChapterSection, EmptyState, GlowCard, Reveal } from "./common";
import { isLiveNow, upcomingServices, useDays, useParishToday } from "./useParishDays";
import type { ServiceOccurrence } from "@/lib/calendar";
import {
  type DetailTarget,
  parishPlace,
  ServiceDetailPanel,
  ServiceRowButton,
  serviceDetailTarget,
} from "./ServiceDetail";
import type { SectionProps } from "./ContentSections";
import { Breadcrumbs } from "./ContentSections";

export function FilterChips({ options, value, onChange, label }: { options: { id: string; label: string; count?: number }[]; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "label-sc rounded-full border px-3.5 py-1.5 text-[0.92rem] transition",
            value === o.id ? "border-lapis bg-lapis text-[#fff8ea] shadow" : "border-[#c9ad78] bg-vellum text-ink hover:border-ochre hover:shadow-[0_0_14px_-4px_rgb(var(--lavra-candle)/0.9)]",
          )}
        >
          {o.label}
          {o.count != null && <span className="ms-1.5 opacity-70">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* Gallery */

export function GalleryGrid({ section }: SectionProps) {
  const { tr, t } = useI18n();
  const [cat, setCat] = useState("all");
  const [open, setOpen] = useState<number | null>(null);
  const items = useMemo(() => gallery.items.filter((g) => cat === "all" || g.category === cat), [cat]);
  const options = [
    { id: "all", label: t("filter.all"), count: gallery.items.length },
    ...gallery.categories.map((c) => ({ id: c.id, label: tr(c.label), count: gallery.items.filter((g) => g.category === c.id).length })),
  ];
  const go = useCallback((dir: number) => setOpen((i) => (i == null ? i : (i + dir + items.length) % items.length)), [items.length]);

  useEffect(() => {
    if (open == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(document.dir === "rtl" ? -1 : 1);
      if (e.key === "ArrowLeft") go(document.dir === "rtl" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  const current = open != null ? items[open] : null;
  return (
    <section id={section.id} className="py-8 sm:py-12">
      <div className="container-lavra">
        <FilterChips options={options} value={cat} onChange={setCat} label={t("filter.byTheme")} />
        {items.length === 0 ? (
          <div className="mt-6">
            <EmptyState title={t("gallery.empty")} />
          </div>
        ) : (
          <ul className="mt-7 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {items.map((g, i) => (
              <li key={g.id} className={cn(i % 5 === 0 && "col-span-2 lg:col-span-1 lg:row-span-2")}>
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  className="group candle-glow fresco-card relative block size-full overflow-hidden p-1.5 text-start"
                  aria-label={t("gallery.open", { title: tr(g.title) })}
                >
                  <span className="relative block h-full overflow-hidden rounded-[3px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={g.image}
                      alt={tr(g.alt)}
                      loading="lazy"
                      className={cn("block w-full object-cover transition duration-700 group-hover:scale-[1.04]", i % 5 === 0 ? "aspect-[4/3] lg:aspect-auto lg:h-full" : "aspect-[4/3]")}
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1b1209]/85 to-transparent px-3 pt-8 pb-2.5">
                      <span className="block font-heading text-[1.02rem] font-bold leading-tight text-[#fbf1da] sm:text-lg">{tr(g.title)}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={open != null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent showCloseButton={false} className="w-[min(64rem,94vw)] max-w-none border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-none">
          {current && (
            <div className="grid gap-3">
              <FrescoFrame>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={current.image} alt={tr(current.alt)} className="block max-h-[72vh] w-full object-contain bg-[#1b1209]" />
              </FrescoFrame>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-vellum px-4 py-3">
                <div className="min-w-0">
                  <DialogTitle className="font-heading text-xl font-bold">{tr(current.title)}</DialogTitle>
                  <DialogDescription className="text-sm text-ink-soft">
                    {t("gallery.counter", { n: (open ?? 0) + 1, total: items.length })} · {tr(gallery.categories.find((c) => c.id === current.category)?.label)}
                  </DialogDescription>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => go(-1)} className="btn-lavra btn-ghost size-11 min-h-0 p-0" aria-label={t("action.previous")}>
                    <ChevronLeft className="size-5 rtl:rotate-180" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => go(1)} className="btn-lavra btn-ghost size-11 min-h-0 p-0" aria-label={t("action.next")}>
                    <ChevronRight className="size-5 rtl:rotate-180" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => setOpen(null)} className="btn-lavra btn-primary size-11 min-h-0 p-0" aria-label={t("action.close")}>
                    <X className="size-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

/* News */

function NewsCard({ n, newsPageId }: { n: NewsItem; newsPageId: string }) {
  const { lang, tr, t, fmtIso } = useI18n();
  const cat = news.categories.find((c) => c.id === n.category);
  return (
    <GlowCard as="article" className="group flex h-full flex-col overflow-hidden">
      <Link href={pagePath(lang, newsPageId, undefined, [n.id])} className="relative z-10 flex h-full flex-col">
        <span className="block overflow-hidden border-b border-[#d9c49a]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={n.image} alt="" loading="lazy" className="block aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        </span>
        <span className="flex flex-1 flex-col p-5">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="rubric text-[0.82rem]">{tr(cat?.label)}</span>
            <time dateTime={n.date} className="text-[0.85rem] text-ink-faint">
              {fmtIso(n.date, { year: "numeric", month: "long", day: "numeric" })}
            </time>
          </span>
          <span className="mt-2 font-heading text-[1.4rem] font-bold leading-tight">{tr(n.title)}</span>
          <span className="mt-2 text-ink-soft">{tr(n.summary)}</span>
          <span className="label-sc mt-auto inline-flex items-center gap-1.5 pt-4 text-cinnabar">
            {t("action.readMore")}
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
          </span>
        </span>
      </Link>
    </GlowCard>
  );
}

export function NewsList({ section, pageId }: SectionProps) {
  const { tr, t } = useI18n();
  const [cat, setCat] = useState("all");
  const items = news.items.filter((n) => cat === "all" || n.category === cat).sort((a, b) => b.date.localeCompare(a.date));
  const options = [{ id: "all", label: t("filter.all") }, ...news.categories.map((c) => ({ id: c.id, label: tr(c.label) }))];
  return (
    <section id={section.id} className="py-8 sm:py-12">
      <div className="container-lavra">
        <FilterChips options={options} value={cat} onChange={setCat} label={t("filter.byCategory")} />
        {items.length ? (
          <ul className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((n) => (
              <li key={n.id}>
                <NewsCard n={n} newsPageId={pageId} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-7">
            <EmptyState title={t("news.empty")} icon={<Pictogram name="gospel" className="size-10 text-ochre-deep" />} />
          </div>
        )}
      </div>
    </section>
  );
}

export function LatestNews({ section, numeral }: SectionProps) {
  const { lang, tr, t } = useI18n();
  const newsPage = firstPageWithSection("news-list");
  if (!newsPage) return null;
  const items = news.items.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, section.props.count ?? 3);
  return (
    <ChapterSection
      id={section.id}
      numeral={numeral}
      title={tr(section.props.title)}
      headerAside={
        <Link href={pagePath(lang, newsPage)} className="btn-lavra btn-ghost shrink-0 self-start">
          {t("news.all")}
          <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
        </Link>
      }
    >
      <ul className="grid gap-6 md:grid-cols-3">
        {items.map((n, i) => (
          <Reveal as="li" key={n.id} delay={i * 80}>
            <NewsCard n={n} newsPageId={newsPage.id} />
          </Reveal>
        ))}
      </ul>
    </ChapterSection>
  );
}

function FallbackNote({ shownLang }: { shownLang: string }) {
  const { t } = useI18n();
  const language = site.languages.find((l) => l.code === shownLang);
  return <p className="mb-3 inline-block rounded bg-ochre/15 px-2.5 py-1 text-[0.82rem] text-ink-soft">{t("i18n.fallback", { language: language?.nativeName ?? shownLang })}</p>;
}

export function NewsArticle({ id, pageId }: { id: string; pageId: string }) {
  const { lang, tr, t, fmtIso, resolve } = useI18n();
  const n = news.items.find((x) => x.id === id)!;
  const cat = news.categories.find((c) => c.id === n.category);
  const body = n.body.map((b) => resolve(b));
  const fallbackLang = body.find((b) => b.isFallback)?.lang;
  return (
    <article className="pt-8 pb-10 sm:pt-12">
      <div className="container-lavra">
        <Breadcrumbs pageId={pageId} extra={tr(n.title)} />
        <div className="mx-auto mt-8 max-w-3xl">
          <p className="flex flex-wrap items-center gap-3">
            <span className="rubric text-sm">{tr(cat?.label)}</span>
            <time dateTime={n.date} className="text-ink-faint">
              {fmtIso(n.date, { year: "numeric", month: "long", day: "numeric" })}
            </time>
          </p>
          <h1 className="mt-2 text-[2.3rem] leading-snug sm:text-[3.2rem]">{tr(n.title)}</h1>
          <p className="mt-4 text-[1.15rem] text-ink-soft">{tr(n.summary)}</p>
          <FrescoFrame className="mt-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={n.image} alt="" className="block aspect-[16/9] w-full object-cover" />
          </FrescoFrame>
          <div className="mt-8">
            {fallbackLang && <FallbackNote shownLang={fallbackLang} />}
            {body.map((b, i) => (
              <p key={i} lang={b.lang} className={cn("text-[1.1rem] leading-[1.8]", i === 0 && "drop-cap", i > 0 && "mt-5")}>
                {b.text}
              </p>
            ))}
          </div>
          <Link href={pagePath(lang, pageId)} className="btn-lavra btn-ghost mt-10">
            <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
            {t("news.back")}
          </Link>
        </div>
      </div>
    </article>
  );
}

/* Sermons */

function fmtClock(s: number) {
  if (!Number.isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

function AudioPlayer({ src, title }: { src: string; title: string }) {
  const { t } = useI18n();
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (a.paused) void a.play();
    else a.pause();
  };
  return (
    <div className="flex items-center gap-3 rounded-md border border-[#d9c49a] bg-parchment/70 p-2.5">
      <audio
        ref={ref}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
      />
      <button type="button" onClick={toggle} className="btn-lavra btn-primary size-11 min-h-0 shrink-0 rounded-full p-0" aria-label={`${playing ? t("player.pause") : t("player.play")}: ${title}`}>
        {playing ? <Pause className="size-5" aria-hidden="true" /> : <Play className="size-5 translate-x-px" aria-hidden="true" />}
      </button>
      <input
        type="range"
        min={0}
        max={dur || 0}
        step={0.1}
        value={time}
        onChange={(e) => {
          const a = ref.current;
          if (a) a.currentTime = Number(e.target.value);
        }}
        aria-label={t("player.seek")}
        className="h-11 min-w-0 flex-1 cursor-pointer accent-[var(--lavra-terracotta)]"
      />
      <span className="w-20 shrink-0 text-end text-[0.85rem] tabular-nums text-ink-soft">
        {fmtClock(time)} / {fmtClock(dur)}
      </span>
    </div>
  );
}

function VideoSlot({ s }: { s: Sermon }) {
  const { t, tr } = useI18n();
  const [show, setShow] = useState(false);
  if (s.media.embedUrl && show) {
    return <iframe src={s.media.embedUrl} title={tr(s.title)} className="aspect-video w-full rounded-md" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />;
  }
  return (
    <button type="button" onClick={() => setShow(true)} className="group relative block w-full overflow-hidden rounded-md border border-[#d9c49a]" aria-label={`${t("player.play")}: ${tr(s.title)}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={s.media.poster ?? "/images/hero-fresco.svg"} alt="" loading="lazy" className="block aspect-video w-full object-cover brightness-[0.8] transition group-hover:brightness-90" />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-16 place-items-center rounded-full bg-cinnabar/90 text-white shadow-[0_0_30px_rgb(var(--lavra-candle)/0.7)]">
          <Play className="size-7 translate-x-0.5" aria-hidden="true" />
        </span>
      </span>
      {show && !s.media.embedUrl && (
        <span className="absolute inset-x-3 bottom-3 rounded bg-vellum/95 px-3 py-2 text-start text-[0.85rem] text-ink">{t("player.videoSample")}</span>
      )}
    </button>
  );
}

const typeIcon = { audio: Headphones, video: Video, text: FileText } as const;

function SermonCard({ s, defaultOpen = false }: { s: Sermon; defaultOpen?: boolean }) {
  const { tr, t, fmtIso, resolve } = useI18n();
  const speaker = clergy.find((c) => c.id === s.speaker);
  const Icon = typeIcon[s.type];
  const transcript = s.transcript.map((p) => resolve(p));
  const fallbackLang = transcript.find((p) => p.isFallback)?.lang;
  return (
    <GlowCard as="article" className="flex h-full flex-col p-5 sm:p-6">
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.88rem]">
          <span className="label-sc inline-flex items-center gap-1.5 rounded-full bg-lapis/10 px-2.5 py-0.5 font-bold text-lapis">
            <Icon className="size-3.5" aria-hidden="true" />
            {t(`sermon.type.${s.type}`)}
          </span>
          <time dateTime={s.date} className="text-ink-faint">
            {fmtIso(s.date, { year: "numeric", month: "long", day: "numeric" })}
          </time>
          <span className="text-ink-faint">· {t("sermon.minutes", { n: s.durationMinutes })}</span>
        </div>
        <h3 className="mt-2 text-[1.5rem]">{tr(s.title)}</h3>
        <p className="mt-1 text-[0.95rem] text-ink-soft">
          {tr(speaker?.name)} · <span className="italic">{s.reading}</span>
        </p>
        <p className="mt-2 text-ink-soft">{tr(s.summary)}</p>
        <div className="mt-4">
          {s.type === "audio" && s.media.src && <AudioPlayer src={s.media.src} title={tr(s.title)} />}
          {s.type === "video" && <VideoSlot s={s} />}
        </div>
        <Collapsible defaultOpen={defaultOpen} className="mt-4 border-t border-dashed border-[#d9c49a] pt-3">
          <CollapsibleTrigger className="group label-sc inline-flex items-center gap-1.5 font-bold text-cinnabar">
            <ChevronDown className="size-4 transition group-data-[panel-open]:rotate-180" aria-hidden="true" />
            <span className="group-data-[panel-open]:hidden">{s.type === "text" ? t("sermon.read") : t("sermon.showTranscript")}</span>
            <span className="hidden group-data-[panel-open]:inline">{t("sermon.hideTranscript")}</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden">
            <div className="pt-3">
              {fallbackLang && <FallbackNote shownLang={fallbackLang} />}
              {transcript.map((p, i) => (
                <p key={i} lang={p.lang} className={cn("text-[1.02rem] leading-[1.75]", i > 0 && "mt-3")}>
                  {p.text}
                </p>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </GlowCard>
  );
}

export function SermonArchive({ section }: SectionProps) {
  const { tr, t } = useI18n();
  const [type, setType] = useState("all");
  const [speaker, setSpeaker] = useState("all");
  const [q, setQ] = useState("");
  const speakers = clergy.filter((c) => sermons.some((s) => s.speaker === c.id));
  const list = sermons.filter((s) => {
    if (type !== "all" && s.type !== type) return false;
    if (speaker !== "all" && s.speaker !== speaker) return false;
    if (q.trim()) {
      const hay = `${tr(s.title)} ${tr(s.summary)} ${s.reading}`.toLowerCase();
      if (!hay.includes(q.trim().toLowerCase())) return false;
    }
    return true;
  });
  return (
    <ChapterSection id={section.id} label={t("sermon.archiveLabel")} title={t("sermon.archiveTitle")}>
      <div className="fresco-card mb-7 grid gap-4 p-4 sm:p-5 lg:grid-cols-[1fr_auto_auto] lg:items-center">
        <label className="relative z-10 block">
          <span className="sr-only">{t("sermon.search")}</span>
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("sermon.searchPlaceholder")} className="h-11 bg-white/70 ps-9 text-base" />
        </label>
        <div className="relative z-10">
          <FilterChips
            label={t("sermon.type")}
            value={type}
            onChange={setType}
            options={[{ id: "all", label: t("filter.all") }, ...(["audio", "video", "text"] as const).map((x) => ({ id: x, label: t(`sermon.type.${x}`) }))]}
          />
        </div>
        <label className="relative z-10 flex items-center gap-2">
          <span className="label-sc text-[0.9rem] text-ink-soft">{t("sermon.speaker")}</span>
          <select value={speaker} onChange={(e) => setSpeaker(e.target.value)} className="h-11 min-w-0 rounded-md border border-input bg-white/70 px-3 text-base">
            <option value="all">{t("filter.all")}</option>
            {speakers.map((c) => (
              <option key={c.id} value={c.id}>
                {tr(c.name)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {list.length ? (
        <ul className="grid gap-6 lg:grid-cols-2">
          {list.map((s) => (
            <li key={s.id}>
              <SermonCard s={s} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={t("sermon.empty")} text={t("sermon.emptyText")} icon={<Pictogram name="gospel" className="size-10 text-ochre-deep" />} />
      )}
    </ChapterSection>
  );
}

export function LatestSermons({ section, numeral }: SectionProps) {
  const { lang, tr, t } = useI18n();
  const page = firstPageWithSection("sermon-archive");
  if (!page) return null;
  return (
    <ChapterSection
      id={section.id}
      numeral={numeral}
      label={numeral ? undefined : t("sermon.archiveLabel")}
      title={tr(section.props.title)}
      headerAside={
        <Link href={pagePath(lang, page, "sermon-archive")} className="btn-lavra btn-ghost shrink-0 self-start">
          {t("sermon.all")}
          <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
        </Link>
      }
    >
      <ul className="grid gap-6 lg:grid-cols-2">
        {sermons.slice(0, section.props.count ?? 2).map((s) => (
          <li key={s.id}>
            <SermonCard s={s} />
          </li>
        ))}
      </ul>
    </ChapterSection>
  );
}

/* Livestream */

export function Livestream({ section }: SectionProps) {
  const { tr, t, fmtDay, fmtTime } = useI18n();
  const now = useParishToday();
  const days = useDays(now ? now.jdn : null, now ? now.jdn + 14 : null);
  const live = isLiveNow(days, now);
  const next = now ? upcomingServices(days, now, 12).filter((s) => s.livestream).slice(0, 4) : [];
  const [detail, setDetail] = useState<DetailTarget | null>(null);

  const openService = (s: ServiceOccurrence) => {
    const title = tr(s.name);
    const note = (s.note ? tr(s.note) : "") || t("schedule.defaultNote");
    const place = parishPlace(tr);
    setDetail(serviceDetailTarget(s, title, note, place));
  };

  return (
    <section id={section.id} className="py-8 sm:py-12">
      <div className="container-lavra grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <FrescoFrame>
            {site.livestream.embedUrl ? (
              <iframe src={site.livestream.embedUrl} title={t("live.player")} className="aspect-video w-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            ) : (
              <div className="relative grid aspect-video w-full place-items-center bg-[#1b1209]">
                {/* No overflow clipping here, so the 16:9 box can grow taller when the message needs more room. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/gallery/iconostasis.svg" alt="" className="absolute inset-0 size-full object-cover opacity-55" />
                <div className="relative grid place-items-center p-6 text-center">
                  <div className="max-w-md">
                    {live ? (
                      <span className="label-sc inline-flex items-center gap-2 rounded-full bg-cinnabar px-3 py-1 font-bold text-white">
                        <span className="live-dot" aria-hidden="true" />
                        {t("live.now")}
                      </span>
                    ) : (
                      <span className="label-sc rounded-full bg-vellum/90 px-3 py-1 text-ink">{t("live.offline")}</span>
                    )}
                    <p className="mt-4 font-heading text-2xl font-bold text-[#fbf1da] sm:text-3xl">{live ? t("live.nowTitle") : t("live.offlineTitle")}</p>
                    <a href={site.livestream.url} className="btn-lavra btn-donate mt-5" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-4" aria-hidden="true" />
                      {t("live.open")}
                    </a>
                    <p className="mt-3 text-[0.85rem] text-[#e8dcc0]">{tr(site.livestream.platformLabel)}</p>
                  </div>
                </div>
              </div>
            )}
          </FrescoFrame>
        </div>
        <aside className="fresco-card p-5 sm:p-6">
          <div className="relative z-10">
            <p className="rubric flex items-center gap-2 text-sm">
              <Radio className="size-4" aria-hidden="true" />
              {t("live.upcoming")}
            </p>
            {!now ? (
              <div className="mt-3 space-y-2" aria-busy="true">
                <div className="h-10 animate-pulse rounded bg-parchment-deep" />
                <div className="h-10 animate-pulse rounded bg-parchment-deep" />
              </div>
            ) : next.length ? (
              <ul className="mt-3 divide-y divide-dashed divide-[#d9c49a]">
                {next.map((s) => (
                  <li key={s.id} className="py-1">
                    <ServiceRowButton onOpen={() => openService(s)} label={t("schedule.openDetails", { name: tr(s.name) })}>
                      <p className="font-heading text-lg font-bold leading-tight">{tr(s.name)}</p>
                      <p className="text-[0.92rem] capitalize text-ink-soft">
                        {fmtDay(s.jdn, { weekday: "long", month: "long", day: "numeric" })} · {fmtTime(s.time)}
                      </p>
                    </ServiceRowButton>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-ink-soft">{t("live.none")}</p>
            )}
          </div>
        </aside>
      </div>
      <ServiceDetailPanel target={detail} onClose={() => setDetail(null)} />
    </section>
  );
}

export type { Localized };
