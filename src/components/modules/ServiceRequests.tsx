"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowRight, Clock, Loader2 } from "lucide-react";
import { serviceRequests } from "@/lib/content";
import { submitServiceRequest, type HandlerResult } from "@/lib/handlers";
import { isEmail, isPhoneComplete } from "@/lib/forms";
import { pagePath } from "@/lib/routes";
import type { ServiceRequestType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Pictogram } from "@/components/orthodox/Pictogram";
import { GlowCard, Reveal } from "@/components/sections/common";
import type { SectionProps } from "@/components/sections/ContentSections";
import { Field, PhoneInput, SuccessDialog, TextArea, TextInput, fieldClass } from "@/components/sections/FormBits";

const PANELS = [
  { bg: "#24497c", deep: "#152f55", glyph: "#e9c46a" },
  { bg: "#9c4526", deep: "#6f2c16", glyph: "#f6e3b4" },
  { bg: "#3f6b5c", deep: "#284a3f", glyph: "#efd28a" },
  { bg: "#b47a24", deep: "#7d5112", glyph: "#fff1cf" },
];

/** Painted panel with a gold line drawing, used when a service has no photo. */
export function ServiceIllustration({ name, index = 0, className }: { name: string; index?: number; className?: string }) {
  const p = PANELS[index % PANELS.length];
  return (
    <div
      className={cn("relative grid place-items-center overflow-hidden", className)}
      style={{ background: `radial-gradient(120% 90% at 50% 40%, ${p.bg} 0%, ${p.deep} 100%)` }}
      aria-hidden="true"
    >
      <div className="plaster-grain absolute inset-0" />
      <div className="absolute inset-2 rounded-[3px] border border-white/45" />
      <div className="absolute inset-3.5 rounded-[2px] border border-[#e9c46a]/50" />
      <div data-ring className="relative grid size-24 place-items-center rounded-full border-2 sm:size-28" style={{ borderColor: `${p.glyph}88`, background: `${p.deep}66`, color: p.glyph }}>
        <Pictogram name={name} className="size-14 sm:size-16" />
      </div>
    </div>
  );
}

function priceLabel(t: (k: string) => string, item: ServiceRequestType) {
  return item.price === "free" ? t("request.free") : t("request.donation");
}

function RequestForm({ item, onDone }: { item: ServiceRequestType; onDone: (r: HandlerResult) => void }) {
  const { t, tr } = useI18n();
  const [f, setF] = useState({ name: "", phone: "", email: "", date: "", time: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  const today = new Date().toISOString().slice(0, 10);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!f.name.trim()) errs.name = t("form.required");
    if (!isPhoneComplete(f.phone)) errs.phone = t("form.phoneInvalid");
    if (!isEmail(f.email)) errs.email = t("form.emailInvalid");
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const r = await submitServiceRequest({ service: item.id, serviceTitle: tr(item.title), ...f });
    setBusy(false);
    onDone(r);
  };

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="sr-name" label={t("form.name")} required error={errors.name} className="sm:col-span-2">
          <TextInput id="sr-name" autoComplete="name" value={f.name} onChange={set("name")} error={errors.name} />
        </Field>
        <Field id="sr-phone" label={t("form.phone")} required error={errors.phone} hint="(000)-000-0000">
          <PhoneInput id="sr-phone" value={f.phone} onChange={set("phone")} error={errors.phone} />
        </Field>
        <Field id="sr-email" label={t("form.email")} required error={errors.email}>
          <TextInput id="sr-email" type="email" autoComplete="email" value={f.email} onChange={set("email")} error={errors.email} />
        </Field>
        <Field id="sr-date" label={t("request.date")}>
          <input id="sr-date" type="date" min={today} value={f.date} onChange={(e) => set("date")(e.target.value)} className={cn(fieldClass, "w-full rounded-md border px-3")} />
        </Field>
        <Field id="sr-time" label={t("request.time")}>
          <input id="sr-time" type="time" step={900} value={f.time} onChange={(e) => set("time")(e.target.value)} className={cn(fieldClass, "w-full rounded-md border px-3")} />
        </Field>
      </div>
      <Field id="sr-notes" label={t("request.notes")} hint={t("request.notesHint")}>
        <TextArea id="sr-notes" value={f.notes} onChange={set("notes")} rows={3} />
      </Field>
      <p className="text-[0.88rem] text-ink-faint">{t("request.followUp")}</p>
      <button type="submit" className="btn-lavra btn-primary justify-self-start px-6" disabled={busy}>
        {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {t("request.send")}
      </button>
    </form>
  );
}

export function ServiceRequests({ section }: SectionProps) {
  const { lang, t, tr } = useI18n();
  const [open, setOpen] = useState<ServiceRequestType | null>(null);
  const [result, setResult] = useState<HandlerResult | null>(null);
  const items = serviceRequests;

  return (
    <section id={section.id} className="py-8 sm:py-12">
      <div className="container-lavra">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, i) => {
            const link = item.action.type === "link" && item.action.page ? pagePath(lang, item.action.page) : null;
            const body = (
              <>
                <div className="relative z-10 overflow-hidden rounded-t-[inherit]">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt="" className="block aspect-[16/10] w-full object-cover" />
                  ) : (
                    <ServiceIllustration name={item.illustration} index={i} className="aspect-[16/10]" />
                  )}
                </div>
                <div className="relative z-10 flex flex-1 flex-col p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-2 text-[0.85rem]">
                    <span className={cn("label-sc rounded-full px-2.5 py-0.5 font-bold", item.price === "free" ? "bg-verdigris/15 text-verdigris" : "bg-ochre/20 text-ochre-deep")}>{priceLabel(t, item)}</span>
                    <span className="inline-flex items-center gap-1 text-ink-soft">
                      <Clock className="size-3.5" aria-hidden="true" />
                      {t("request.duration", { n: item.durationMinutes })}
                    </span>
                  </div>
                  <h2 className="mt-2.5 text-[1.3rem] leading-tight">{tr(item.title)}</h2>
                  <p className="mt-2 text-[0.98rem] text-ink-soft">{tr(item.text)}</p>
                  <span className="label-sc mt-auto inline-flex items-center gap-1.5 pt-4 font-bold text-cinnabar">
                    {link ? t("request.openPage") : t("request.request")}
                    <ArrowRight className="size-4 transition group-hover:translate-x-1 rtl:rotate-180" aria-hidden="true" />
                  </span>
                </div>
              </>
            );
            return (
              <Reveal as="li" key={item.id} delay={(i % 4) * 60}>
                {link ? (
                  <GlowCard as={Link} href={link} className="group flex h-full flex-col">
                    {body}
                  </GlowCard>
                ) : (
                  <GlowCard as="button" type="button" onClick={() => setOpen(item)} className="group flex h-full w-full flex-col text-start" aria-haspopup="dialog">
                    {body}
                  </GlowCard>
                )}
              </Reveal>
            );
          })}
        </ul>
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto border border-[#d5bd8c] bg-vellum p-0 sm:max-w-xl">
          {open && (
            <>
              <div className="flex items-center gap-4 border-b border-[#dcc69c] bg-parchment-deep/60 p-5 pe-12">
                <div className="shrink-0 overflow-hidden rounded">
                  <ServiceIllustration name={open.illustration} index={items.indexOf(open)} className="size-20 [&_[data-ring]]:size-14 [&_svg]:size-9" />
                </div>
                <div className="min-w-0">
                  <p className="rubric text-[0.82rem]">{t("request.formLabel")}</p>
                  <DialogTitle className="font-heading text-[1.5rem] font-bold leading-tight">{tr(open.title)}</DialogTitle>
                  <DialogDescription className="text-[0.92rem] text-ink-soft">
                    {priceLabel(t, open)} · {t("request.duration", { n: open.durationMinutes })}
                  </DialogDescription>
                </div>
              </div>
              <div className="p-5">
                <RequestForm
                  item={open}
                  onDone={(r) => {
                    setOpen(null);
                    setResult(r);
                  }}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <SuccessDialog open={!!result} onClose={() => setResult(null)} title={t("request.sentTitle")} text={t("request.sentText")} reference={result?.reference} />
    </section>
  );
}
