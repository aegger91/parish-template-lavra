"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Radio } from "lucide-react";
import { site } from "@/lib/content";
import { linkHref } from "@/lib/routes";
import type { Section } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers";
import { Cross } from "@/components/orthodox/Cross";
import { FrescoFrame, PaintedBand } from "@/components/orthodox/Ornaments";
import { Pictogram } from "@/components/orthodox/Pictogram";
import { ChapterSection, GlowCard, Reveal } from "./common";
import { useDays, useParishToday } from "./useParishDays";
import type { ServiceOccurrence } from "@/lib/calendar";
import {
  type DetailTarget,
  parishPlace,
  ServiceDetailPanel,
  ServiceRowButton,
  serviceDetailTarget,
} from "./ServiceDetail";

export interface SectionProps {
  section: Section;
  numeral?: string;
}

export function ServicesWeek({ section, numeral }: SectionProps) {
  const { lang, t, tr, fmtDay, fmtTime } = useI18n();
  const p = section.props;
  const now = useParishToday();
  const days = useDays(now ? now.jdn : null, now ? now.jdn + 6 : null);
  const [detail, setDetail] = useState<DetailTarget | null>(null);

  const openService = (s: ServiceOccurrence) => {
    const title = tr(s.name);
    const note = (s.note ? tr(s.note) : "") || t("schedule.defaultNote");
    const place = parishPlace(tr);
    setDetail(serviceDetailTarget(s, title, note, place));
  };

  return (
    <ChapterSection
      id={section.id}
      numeral={numeral}
      title={tr(p.title)}
      intro={tr(p.intro)}
      headerAside={
        p.cta && (
          <Link href={linkHref(lang, p.cta.link)} className="btn-lavra btn-ghost shrink-0 self-start md:self-auto">
            {tr(p.cta.label)}
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        )
      }
    >
      {!now ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label={t("state.loading")}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="fresco-card h-40 animate-pulse" />
          ))}
        </div>
      ) : (
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {days
            .filter((d) => d.services.length || d.feasts.some((f) => f.rank !== "commemoration"))
            .slice(0, 8)
            .map((d, i) => {
              const feast = d.feasts.find((f) => f.rank !== "commemoration");
              const red = d.weekday === 0 || !!feast;
              return (
                <Reveal as="li" key={d.jdn} delay={i * 60}>
                  <GlowCard className="h-full p-5">
                    <div className="relative z-10">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={cn("font-heading text-[1.7rem] font-extrabold leading-tight", red ? "text-cinnabar" : "text-ink")}>
                          {fmtDay(d.jdn, { day: "numeric" })}
                        </p>
                        <p className="label-sc text-right text-[0.85rem] capitalize text-ink-soft">
                          {d.jdn === now.jdn ? t("time.today") : fmtDay(d.jdn, { weekday: "long" })}
                        </p>
                      </div>
                      {feast && <p className="mt-2 font-heading text-[0.98rem] font-bold leading-snug text-cinnabar">{tr(feast.name)}</p>}
                      <ul className="mt-3 space-y-2">
                        {d.services.map((s) => (
                          <li key={s.id} className="text-[0.97rem]">
                            <ServiceRowButton
                              onOpen={() => openService(s)}
                              label={t("schedule.openDetails", { name: tr(s.name) })}
                              className="flex gap-3"
                            >
                              <span className="w-14 shrink-0 tabular-nums font-bold text-lapis">{fmtTime(s.time)}</span>
                              <span className="min-w-0">
                                {tr(s.name)}
                                {s.livestream && site.features.livestream && (
                                  <span className="ms-1.5 inline-flex translate-y-0.5 items-center text-cinnabar" title={t("live.streamed")}>
                                    <Radio className="size-3.5" aria-hidden="true" />
                                    <span className="sr-only">{t("live.streamed")}</span>
                                  </span>
                                )}
                              </span>
                            </ServiceRowButton>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </GlowCard>
                </Reveal>
              );
            })}
        </ol>
      )}
      <ServiceDetailPanel target={detail} onClose={() => setDetail(null)} />
    </ChapterSection>
  );
}

/** Optional About / Welcome block: a title, one or two short paragraphs, optional links and image. */
export function WelcomeText({ section, numeral }: SectionProps) {
  const { lang, tr } = useI18n();
  const p = section.props;
  const paragraphs: string[] = (p.paragraphs ?? []).map((x: never) => tr(x));
  return (
    <ChapterSection id={section.id} numeral={numeral} title={tr(p.title)}>
      <div className="grid items-start gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          {paragraphs.map((text, i) => (
            <p key={i} className={cn("text-measure text-[1.1rem] leading-[1.8]", i === 0 && "drop-cap", i > 0 && "mt-5")}>
              {text}
            </p>
          ))}
          {p.links?.length > 0 && (
            <div className="mt-7 flex flex-wrap gap-3">
              {p.links.map((l: { label: never; link: never }, i: number) => (
                <Link key={i} href={linkHref(lang, l.link)} className={cn("btn-lavra", i === 0 ? "btn-lapis" : "btn-ghost")}>
                  {tr(l.label)}
                </Link>
              ))}
            </div>
          )}
        </Reveal>
        {p.image && (
          <Reveal className="lg:col-span-5" delay={120}>
            <FrescoFrame className="lg:rotate-[0.6deg]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={tr(p.imageAlt)} width={900} height={700} loading="lazy" className="block aspect-[9/7] w-full object-cover" />
            </FrescoFrame>
          </Reveal>
        )}
      </div>
    </ChapterSection>
  );
}

export function DonateCta({ section }: SectionProps) {
  const { lang, tr } = useI18n();
  const p = section.props;
  return (
    <section id={section.id} className="py-14 sm:py-20">
      <div className="container-lavra">
        <Reveal>
          <div className="relative overflow-hidden rounded-md border border-[#c9a66a] bg-[linear-gradient(120deg,#f6e7c4,#efd8a6_55%,#e8c98c)] shadow-[var(--lavra-shadow-lift)]">
            <PaintedBand variant="rope" className="h-2" />
            <div className="grid items-center gap-6 p-7 sm:p-10 md:grid-cols-[auto_1fr_auto]">
              <span className="hidden size-20 place-items-center rounded-full bg-vellum text-cinnabar shadow-inner md:grid">
                <Pictogram name="candle" className="size-11" />
              </span>
              <div>
                <h2 className="text-3xl leading-snug sm:text-4xl">{tr(p.title)}</h2>
                <p className="mt-2 max-w-2xl text-[1.07rem] text-ink-soft">{tr(p.text)}</p>
              </div>
              <Link href={linkHref(lang, p.cta.link)} className="btn-lavra btn-primary justify-self-start px-6 text-[1.1rem] md:justify-self-end">
                <Cross variant="byzantine" className="size-4" />
                {tr(p.cta.label)}
              </Link>
            </div>
            <PaintedBand variant="rope" className="h-2" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
