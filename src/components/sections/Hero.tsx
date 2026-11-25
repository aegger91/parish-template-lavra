"use client";

import Link from "next/link";
import { ArrowDown, CalendarDays, MapPin, Navigation, Radio } from "lucide-react";
import { isFeatureOn, site } from "@/lib/content";
import { linkHref, pagePath } from "@/lib/routes";
import type { Localized, LinkRef } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers";
import { Cross } from "@/components/orthodox/Cross";
import { ChapterMark, FrescoFrame } from "@/components/orthodox/Ornaments";
import { Pictogram } from "@/components/orthodox/Pictogram";
import { isLiveNow, upcomingServices, useDays, useParishToday } from "./useParishDays";
import { useCivilWithOldStyle } from "./ServiceDetail";
import { feastsInRange } from "@/lib/calendar";
import { feasts } from "@/lib/content";

interface HeroProps {
  eyebrow: Localized;
  lead: Localized;
  image: string;
  imageAlt: Localized;
  imageCaption: Localized;
  primaryCta: { label: Localized; link: LinkRef };
  secondaryCta?: { label: Localized; link: LinkRef };
  showCommemorationShortcut?: boolean;
  chapters?: { target: string; label: Localized }[];
}

export function useRelativeDay() {
  const { t } = useI18n();
  return (diff: number) => (diff === 0 ? t("time.today") : diff === 1 ? t("time.tomorrow") : t("time.inDays", { n: diff }));
}

function Skeleton({ className }: { className?: string }) {
  return <span className={cn("block animate-pulse rounded bg-parchment-deep", className)} />;
}

export function AtAGlance({ className }: { className?: string }) {
  const { lang, t, tr, fmtDay, fmtTime } = useI18n();
  const now = useParishToday();
  const days = useDays(now ? now.jdn : null, now ? now.jdn + 21 : null);
  const live = isLiveNow(days, now);
  const rel = useRelativeDay();
  const next = now ? upcomingServices(days, now, 3) : [];
  const today = days[0];
  const nextFeast = now ? feastsInRange(now.jdn + 1, now.jdn + 120, site.calendar.style, feasts).find((f) => f.rank !== "commemoration") : undefined;
  const civilWithOld = useCivilWithOldStyle();
  const showLivestream = isFeatureOn("livestream");

  return (
    <div className={cn("fresco-card relative overflow-visible p-0", className)}>
      <span aria-hidden="true" className="absolute -top-3 left-1/2 z-20 grid size-7 -translate-x-1/2 place-items-center rounded-full bg-cinnabar shadow-[0_3px_6px_rgb(0_0_0/0.35),inset_0_-2px_3px_rgb(0_0_0/0.3),inset_0_2px_2px_rgb(255_255_255/0.35)]">
        <Cross variant="byzantine" className="size-3.5 text-[#f4d9a8]" />
      </span>
      <div className="relative z-10 p-5 pt-7 sm:p-6 sm:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="rubric text-sm">{t("glance.title")}</p>
          {live && (
            <Link href={pagePath(lang, "livestream")} className="-my-2 inline-flex min-h-11 items-center rounded-full">
              <span className="label-sc inline-flex items-center gap-2 rounded-full bg-cinnabar px-3 py-1 text-[0.82rem] font-bold text-white shadow-[0_0_16px_-2px_rgb(224_65_42/0.8)]">
                <span className="live-dot" aria-hidden="true" />
                {t("live.now")}
              </span>
            </Link>
          )}
        </div>

        <div className="mt-4">
          <p className="label-sc flex items-center gap-1.5 text-[0.82rem] text-ink-soft">
            <Pictogram name="censer" className="size-4 text-ochre-deep" />
            {t("glance.nextService")}
          </p>
          {!now ? (
            <div className="mt-2 space-y-2" aria-busy="true" aria-label={t("state.loading")}>
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : next[0] ? (
            <div className="mt-1.5">
              <p className="font-heading text-[1.45rem] font-bold leading-tight">{tr(next[0].name)}</p>
              <p className="mt-1 text-[0.98rem]">
                <span className="font-bold text-cinnabar">{rel(next[0].jdn - now.jdn)}</span>
                <span className="text-ink-soft">
                  {" · "}
                  {fmtDay(next[0].jdn, { weekday: "long", month: "long", day: "numeric" })} {" · "}
                  {fmtTime(next[0].time)}
                </span>
              </p>
              {next.length > 1 && (
                <ul className="mt-3 space-y-1.5 border-t border-dashed border-[#d9c49a] pt-3 text-[0.92rem]">
                  {next.slice(1).map((s) => (
                    <li key={s.id} className="flex flex-wrap justify-between gap-x-3">
                      <span>{tr(s.name)}</span>
                      <span className="tabular-nums text-ink-soft">
                        {fmtDay(s.jdn, { weekday: "short", day: "numeric" })} {fmtTime(s.time)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="mt-1.5 text-ink-soft">{t("glance.noServices")}</p>
          )}
        </div>

        <div className="mt-5 border-t border-[#dcc69c] pt-4">
          <p className="label-sc flex items-center gap-1.5 text-[0.82rem] text-ink-soft">
            <CalendarDays className="size-4 text-ochre-deep" aria-hidden="true" />
            {t("glance.today")}
          </p>
          {!today || !now ? (
            <div className="mt-2 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : (
            <div className="mt-1.5">
              <p className="font-heading text-lg font-bold capitalize">
                {site.calendar.style === "old" && site.calendar.showChurchDate
                  ? civilWithOld(today.jdn, { weekday: "long", month: "long", day: "numeric" })
                  : fmtDay(today.jdn, { weekday: "long", month: "long", day: "numeric" })}
              </p>
              {today.feasts.length > 0 ? (
                <p className={cn("mt-1.5 font-heading font-bold", today.feasts[0].rank === "commemoration" ? "text-ink" : "text-cinnabar")}>{tr(today.feasts[0].name)}</p>
              ) : (
                <p className="mt-1.5 text-[0.95rem] text-ink-soft">
                  {nextFeast ? (
                    <>
                      {t("glance.nextFeast")}{" "}
                      <span className="font-bold text-cinnabar">{tr(nextFeast.name)}</span>
                      {", "}
                      {fmtDay(nextFeast.jdn, { month: "long", day: "numeric" })}
                    </>
                  ) : null}
                </p>
              )}
              {today.fast && site.calendar.showFasting && (
                <p className="mt-1 text-[0.88rem] text-lapis">{t(`fast.${today.fast.period}`)}</p>
              )}
              <p className="mt-2 text-[0.8rem] text-ink-faint">{t("glance.saintsFeed")}</p>
            </div>
          )}
        </div>

        <div className="mt-5 border-t border-[#dcc69c] pt-4">
          <p className="label-sc flex items-center gap-1.5 text-[0.82rem] text-ink-soft">
            <MapPin className="size-4 text-ochre-deep" aria-hidden="true" />
            {t("glance.directions")}
          </p>
          <address className="mt-1.5 not-italic">
            {site.contact.addressLines.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </address>
          <p className="mt-1 text-[0.88rem] text-ink-soft">{tr(site.contact.parking)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={site.contact.map.directionsUrl} target="_blank" rel="noopener noreferrer" className="btn-lavra btn-ghost min-h-11 px-3 text-[0.92rem]">
              <Navigation className="size-4" aria-hidden="true" />
              {t("glance.getDirections")}
            </a>
            {showLivestream && (
              <Link href={pagePath(lang, "livestream")} className="btn-lavra btn-ghost min-h-11 px-3 text-[0.92rem]">
                <Radio className="size-4" aria-hidden="true" />
                {live ? t("live.watch") : t("live.watchOnline")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero({ props, chapterMap = {} }: { props: HeroProps; chapterMap?: Record<string, string> }) {
  const { lang, t, tr } = useI18n();
  const name = tr(site.parish.name);
  const chapters = (props.chapters ?? []).filter((c) => chapterMap[c.target]);
  return (
    <section id="home-hero" className="relative overflow-x-clip pt-8 sm:pt-12" aria-labelledby="home-hero-title">
      <div
        className={cn(
          "container-lavra grid grid-cols-1 gap-x-10 gap-y-8",
          "[grid-template-areas:'intro'_'card'_'image'_'toc']",
          "lg:grid-cols-[minmax(0,1fr)_22rem] lg:[grid-template-areas:'intro_card'_'image_card'_'toc_card'] xl:grid-cols-[minmax(0,1fr)_24rem]",
        )}
      >
        <div className="[grid-area:intro]">
          <ChapterMark label={tr(props.eyebrow)} />
          <h1 id="home-hero-title" className="mt-4 text-[2.5rem] leading-snug sm:text-6xl xl:text-[4.6rem]">
            {name}
          </h1>
          <p className="mt-5 max-w-2xl text-[1.12rem] leading-relaxed text-ink-soft sm:text-[1.2rem]">{tr(props.lead)}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href={linkHref(lang, props.primaryCta.link)} className="btn-lavra btn-primary px-5 text-[1.08rem]">
              {tr(props.primaryCta.label)}
            </Link>
            {props.secondaryCta && (
              <Link href={linkHref(lang, props.secondaryCta.link)} className="btn-lavra btn-ghost px-5 text-[1.08rem]">
                {tr(props.secondaryCta.label)}
              </Link>
            )}
          </div>
          {props.showCommemorationShortcut && isFeatureOn("zapiski") && (
            <Link
              href={pagePath(lang, "zapiski")}
              className="group mt-5 inline-flex items-center gap-2 text-[0.98rem] text-ink-soft underline decoration-ochre/60 underline-offset-4 hover:text-cinnabar"
            >
              <Pictogram name="candle" className="size-5 text-cinnabar transition group-hover:drop-shadow-[0_0_6px_rgb(255_196_110)]" />
              {t("hero.commemoration")}
            </Link>
          )}
        </div>

        <aside className="[grid-area:card] lg:pt-3" aria-label={t("glance.title")}>
          <div className="lg:sticky lg:top-(--lavra-sticky-offset)">
            <AtAGlance />
          </div>
        </aside>

        <figure className="[grid-area:image]">
          <FrescoFrame>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={props.image} alt={tr(props.imageAlt)} width={1200} height={800} className="block aspect-[3/2] w-full object-cover" fetchPriority="high" />
          </FrescoFrame>
          <figcaption className="label-sc mt-3 text-center text-[0.85rem] text-ink-faint">{tr(props.imageCaption)}</figcaption>
        </figure>

        {chapters.length > 0 && (
          <nav className="[grid-area:toc]" aria-label={t("hero.contents")}>
            <div className="flex flex-col items-start gap-4 border-y border-[#d9c49a] py-5 sm:flex-row sm:items-center">
              <a href={`#${chapters[0].target}`} className="label-sc inline-flex shrink-0 items-center gap-2 text-cinnabar">
                <ArrowDown className="size-4 motion-safe:animate-bounce" aria-hidden="true" />
                {t("hero.readOn")}
              </a>
              <ol className="flex flex-wrap gap-x-5 gap-y-2">
                {chapters.map((c) => (
                  <li key={c.target}>
                    <a href={`#${c.target}`} className="group inline-flex items-baseline gap-1.5 text-[0.98rem] hover:text-cinnabar">
                      <span className="label-sc text-[0.85rem] font-bold text-ochre-deep group-hover:text-cinnabar">{chapterMap[c.target]}</span>
                      {tr(c.label)}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>
        )}
      </div>
    </section>
  );
}
