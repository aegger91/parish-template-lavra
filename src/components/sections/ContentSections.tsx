"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, Mail } from "lucide-react";
import { clergy, history } from "@/lib/content";
import { breadcrumbs, childPages, pageById, pagePath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers";
import { Cross } from "@/components/orthodox/Cross";
import { OrnamentDivider } from "@/components/orthodox/Ornaments";
import { Pictogram } from "@/components/orthodox/Pictogram";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChapterSection, GlowCard, Reveal } from "./common";
import type { SectionProps as BaseProps } from "./HomeSections";

export interface SectionProps extends BaseProps {
  pageId: string;
}

export function Breadcrumbs({ pageId, extra }: { pageId: string; extra?: string }) {
  const { lang, tr, t } = useI18n();
  const page = pageById(pageId);
  if (!page) return null;
  const trail = breadcrumbs(page);
  const home = pageById("home");
  const items = [...(home && page.id !== "home" ? [home] : []), ...trail];
  return (
    <nav aria-label={t("nav.breadcrumbs")} className="text-[0.9rem] text-ink-soft">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((p, i) => {
          const last = i === items.length - 1 && !extra;
          return (
            <li key={p.id} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="text-ink">
                  {tr(p.title)}
                </span>
              ) : (
                <Link href={pagePath(lang, p)} className="hover:text-cinnabar hover:underline">
                  {tr(p.title)}
                </Link>
              )}
              {!last && <ChevronRight className="size-3.5 opacity-60 rtl:rotate-180" aria-hidden="true" />}
            </li>
          );
        })}
        {extra && (
          <li aria-current="page" className="text-ink">
            {extra}
          </li>
        )}
      </ol>
    </nav>
  );
}

export function PageHeader({ section, pageId }: SectionProps) {
  const { tr } = useI18n();
  const p = section.props;
  return (
    <header id={section.id} className="relative pt-8 pb-4 sm:pt-12">
      <div className="container-lavra">
        <Breadcrumbs pageId={pageId} />
        <div className="mt-6 max-w-3xl">
          {p.label && <p className="rubric text-sm">{tr(p.label)}</p>}
          <h1 className="mt-2 text-[2.4rem] leading-[1.05] sm:text-[3.4rem]">{tr(p.title)}</h1>
          {p.intro && <p className="mt-4 text-[1.12rem] leading-relaxed text-ink-soft">{tr(p.intro)}</p>}
        </div>
        <OrnamentDivider className="mt-8 max-w-md" />
      </div>
    </header>
  );
}

export function SubpageCards({ section, pageId, numeral }: SectionProps) {
  const { lang, tr, t } = useI18n();
  const kids = childPages(pageId);
  if (!kids.length) return null;
  return (
    <ChapterSection id={section.id} numeral={numeral} title={tr(section.props.title)}>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {kids.map((k, i) => (
          <Reveal as="li" key={k.id} delay={i * 60}>
            <GlowCard as={Link} href={pagePath(lang, k)} className="group flex h-full flex-col p-6">
              <span className="relative z-10 flex h-full flex-col">
                <Pictogram name={k.icon ?? "church"} className="size-9 text-ochre-deep" />
                <span className="mt-4 font-heading text-2xl font-bold">{tr(k.title)}</span>
                {k.summary && <span className="mt-2 text-ink-soft">{tr(k.summary)}</span>}
                <span className="label-sc mt-auto inline-flex items-center gap-1.5 pt-5 text-cinnabar">
                  {t("action.open")}
                  <ArrowRight className="size-4 transition group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden="true" />
                </span>
              </span>
            </GlowCard>
          </Reveal>
        ))}
      </ul>
    </ChapterSection>
  );
}

export function ModuleLinks({ section, numeral }: SectionProps) {
  const { lang, tr, t } = useI18n();
  const list = (section.props.pages as string[]).map((id) => pageById(id)).filter(Boolean);
  if (!list.length) return null;
  return (
    <ChapterSection id={section.id} numeral={numeral} title={tr(section.props.title)}>
      <ul className="grid gap-5 md:grid-cols-2">
        {list.map((k) => (
          <li key={k!.id}>
            <GlowCard as={Link} href={pagePath(lang, k!)} className="group flex h-full items-start gap-5 p-6">
              <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-full bg-lapis text-ochre-light shadow-inner">
                <Pictogram name={k!.icon ?? "candle"} className="size-8" />
              </span>
              <span className="relative z-10 min-w-0">
                <span className="block font-heading text-2xl font-bold">{tr(k!.title)}</span>
                <span className="mt-1 block text-ink-soft">{tr(k!.summary)}</span>
                <span className="label-sc mt-3 inline-flex items-center gap-1.5 text-cinnabar">
                  {t("action.open")}
                  <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
                </span>
              </span>
            </GlowCard>
          </li>
        ))}
      </ul>
    </ChapterSection>
  );
}

export function IconCards({ section, numeral }: SectionProps) {
  const { tr } = useI18n();
  const p = section.props;
  return (
    <ChapterSection id={section.id} numeral={numeral} title={tr(p.title)}>
      <ul className="grid gap-5 md:grid-cols-3">
        {p.items.map((it: { id: string; icon: string; title: never; text: never }, i: number) => (
          <Reveal as="li" key={it.id} delay={i * 60}>
            <GlowCard className="h-full p-6">
              <div className="relative z-10">
                <Pictogram name={it.icon} className="size-9 text-ochre-deep" />
                <h3 className="mt-3 text-2xl">{tr(it.title)}</h3>
                <p className="mt-2 text-ink-soft">{tr(it.text)}</p>
              </div>
            </GlowCard>
          </Reveal>
        ))}
      </ul>
    </ChapterSection>
  );
}

export function Faq({ section, numeral }: SectionProps) {
  const { tr } = useI18n();
  const p = section.props;
  return (
    <ChapterSection id={section.id} numeral={numeral} title={tr(p.title)}>
      <div className="fresco-card max-w-3xl px-5 py-2 sm:px-7">
        <Accordion className="relative z-10">
          {p.items.map((it: { id: string; q: never; a: never }) => (
            <AccordionItem key={it.id} value={it.id} className="border-[#e2cfa6]">
              <AccordionTrigger className="py-4 text-start font-heading text-lg font-bold hover:no-underline">{tr(it.q)}</AccordionTrigger>
              <AccordionContent className="pb-4 text-base text-ink-soft">{tr(it.a)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </ChapterSection>
  );
}

function Monogram({ text, className }: { text: string; className?: string }) {
  return (
    <span
      className={cn(
        "relative grid place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#3a669f,var(--lavra-lapis-deep))] font-heading font-bold text-ochre-light shadow-[inset_0_0_0_3px_var(--lavra-ochre),inset_0_0_0_5px_var(--lavra-lapis-deep),inset_0_0_0_6px_rgb(231_194_122/0.5)]",
        className,
      )}
      aria-hidden="true"
    >
      {text}
    </span>
  );
}

export function ClergyCards({ section }: SectionProps) {
  const { tr, t } = useI18n();
  return (
    <section id={section.id} className="py-10 sm:py-14">
      <div className="container-lavra">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {clergy.map((c, i) => (
            <Reveal as="li" key={c.id} delay={i * 70}>
              <GlowCard className="flex h-full flex-col items-center p-6 text-center">
                <div className="relative z-10 flex h-full w-full flex-col items-center">
                  {c.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.photo} alt="" className="size-28 rounded-full object-cover ring-4 ring-ochre" />
                  ) : (
                    <Monogram text={c.monogram} className="size-28 text-3xl" />
                  )}
                  <p className="rubric mt-4 text-sm">{tr(c.role)}</p>
                  <h2 className="mt-1 text-[1.45rem]">{tr(c.name)}</h2>
                  <p className="mt-3 line-clamp-3 text-[0.97rem] text-ink-soft">{tr(c.bio)}</p>
                  <Dialog>
                    <DialogTrigger className="btn-lavra btn-ghost mt-auto min-h-10 px-4 text-[0.95rem]" style={{ marginTop: "1.25rem" }}>
                      {t("clergy.readBio")}
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto border border-[#d5bd8c] bg-vellum p-6 sm:max-w-lg">
                      <div className="flex flex-col items-center text-center">
                        <Monogram text={c.monogram} className="size-24 text-2xl" />
                        <p className="rubric mt-4 text-sm">{tr(c.role)}</p>
                        <DialogTitle className="mt-1 font-heading text-3xl font-bold leading-tight">{tr(c.name)}</DialogTitle>
                        <OrnamentDivider className="my-4 w-40" />
                      </div>
                      <DialogDescription className="text-start text-base leading-relaxed text-ink">{tr(c.bio)}</DialogDescription>
                      <a href={`mailto:${c.email}`} className="btn-lavra btn-lapis mt-2 justify-self-start">
                        <Mail className="size-4" aria-hidden="true" />
                        {c.email}
                      </a>
                    </DialogContent>
                  </Dialog>
                </div>
              </GlowCard>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function HistoryTimeline({ section }: SectionProps) {
  const { tr, t } = useI18n();
  return (
    <section id={section.id} className="py-10 sm:py-14" aria-label={t("history.timeline")}>
      <div className="container-lavra">
        <ol className="relative mx-auto max-w-5xl before:absolute before:inset-y-0 before:start-6 before:w-[3px] before:bg-[repeating-linear-gradient(180deg,var(--lavra-ochre)_0_10px,var(--lavra-terracotta)_10px_14px)] md:before:start-1/2 md:before:-translate-x-1/2 rtl:md:before:translate-x-1/2">
          {history.map((h, i) => {
            const left = i % 2 === 0;
            return (
              <li key={h.id} className="relative grid grid-cols-[3rem_1fr] gap-4 pb-10 last:pb-0 md:grid-cols-[1fr_4rem_1fr] md:gap-6">
                <div className={cn("hidden md:block", left ? "md:col-start-1" : "md:col-start-3 md:row-start-1")}>
                  <Reveal>
                    <GlowCard className={cn("p-6", left ? "md:text-end" : "")}>
                      <div className="relative z-10">
                        <p className="font-heading text-4xl font-extrabold text-cinnabar">{h.year}</p>
                        <h2 className="mt-1 text-2xl">{tr(h.title)}</h2>
                        <p className="mt-2 text-ink-soft">{tr(h.text)}</p>
                      </div>
                    </GlowCard>
                  </Reveal>
                </div>
                <div className="relative z-10 col-start-1 row-start-1 flex justify-center pt-4 md:col-start-2">
                  <span className="grid size-12 place-items-center rounded-full border-2 border-ochre bg-vellum text-cinnabar shadow-[0_0_0_4px_var(--lavra-parchment)]">
                    <Pictogram name={h.icon} className="size-6" />
                  </span>
                </div>
                <div className="col-start-2 row-start-1 md:hidden">
                  <Reveal>
                    <GlowCard className="p-5">
                      <div className="relative z-10">
                        <p className="font-heading text-3xl font-extrabold text-cinnabar">{h.year}</p>
                        <h2 className="mt-1 text-xl">{tr(h.title)}</h2>
                        <p className="mt-2 text-ink-soft">{tr(h.text)}</p>
                      </div>
                    </GlowCard>
                  </Reveal>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-10 flex items-center justify-center gap-2 text-center text-ink-faint">
          <Cross className="h-5 text-ochre-deep" />
          {t("history.sample")}
        </p>
      </div>
    </section>
  );
}
