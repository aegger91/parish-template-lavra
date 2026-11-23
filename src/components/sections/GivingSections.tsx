"use client";

import { useState, type FormEvent } from "react";
import { Clock, Loader2, Lock, Mail, MapPin, Navigation, Phone, Train } from "lucide-react";
import { site } from "@/lib/content";
import { startPayment, submitContactMessage, type HandlerResult } from "@/lib/handlers";
import { isEmail, isPhoneComplete } from "@/lib/forms";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers";
import { Cross } from "@/components/orthodox/Cross";
import { CROSS_GEOMETRY } from "@/components/orthodox/cross-geometry";
import { FrescoFrame, PaintedBand } from "@/components/orthodox/Ornaments";
import { Pictogram } from "@/components/orthodox/Pictogram";
import { Field, PhoneInput, SuccessDialog, TextArea, TextInput, fieldClass } from "./FormBits";
import type { SectionProps } from "./ContentSections";

export function DonationPicker({ section }: SectionProps) {
  const { t, tr, fmtMoney } = useI18n();
  const d = site.donate;
  const [frequency, setFrequency] = useState<"once" | "monthly">("once");
  const presets = frequency === "once" ? d.oneTimePresets : d.monthlyPresets;
  const [amount, setAmount] = useState<number | null>(d.oneTimePresets[1] ?? d.oneTimePresets[0]);
  const [custom, setCustom] = useState("");
  const [fund, setFund] = useState(d.defaultFund);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<HandlerResult | null>(null);

  const value = custom ? Number(custom.replace(",", ".")) : amount ?? 0;
  const fundLabel = tr(d.funds.find((f) => f.id === fund)?.label);

  const pickFrequency = (f: "once" | "monthly") => {
    setFrequency(f);
    const list = f === "once" ? d.oneTimePresets : d.monthlyPresets;
    setAmount(list[1] ?? list[0]);
    setCustom("");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!Number.isFinite(value) || value < d.minimumAmount) {
      setError(t("donate.minimum", { amount: fmtMoney(d.minimumAmount) }));
      return;
    }
    if (email && !isEmail(email)) {
      setError(t("form.emailInvalid"));
      return;
    }
    setError(null);
    setBusy(true);
    const r = await startPayment({
      kind: "donation",
      amount: value,
      currency: d.currency,
      recurring: frequency,
      lines: [{ id: fund, description: fundLabel, quantity: 1, unitAmount: value }],
      metadata: { fund, email },
    });
    setBusy(false);
    setResult(r);
  };

  return (
    <section id={section.id} className="py-8 sm:py-12">
      <div className="container-lavra grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <form onSubmit={onSubmit} noValidate className="fresco-card overflow-hidden p-0">
          <PaintedBand variant="teeth" />
          <div className="relative z-10 p-5 sm:p-8">
            <fieldset>
              <legend className="label-sc text-lg font-bold">{t("donate.howOften")}</legend>
              <div className="mt-3 grid grid-cols-2 gap-2 rounded-md border border-[#c9ad78] bg-parchment/60 p-1">
                {(["once", "monthly"] as const).map((f) => (
                  <label
                    key={f}
                    className={cn(
                      "label-sc cursor-pointer rounded px-3 py-2.5 text-center text-[1.02rem] font-bold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-lapis",
                      frequency === f ? "bg-lapis text-[#fff8ea] shadow" : "text-ink-soft hover:text-ink",
                    )}
                  >
                    <input type="radio" name="frequency" value={f} checked={frequency === f} onChange={() => pickFrequency(f)} className="sr-only" />
                    {t(`donate.${f}`)}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-7">
              <legend className="label-sc text-lg font-bold">{t("donate.amount")}</legend>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {presets.map((p) => {
                  const active = !custom && amount === p;
                  return (
                    <label
                      key={p}
                      className={cn(
                        "candle-glow relative grid cursor-pointer place-items-center rounded-md border-2 bg-vellum px-2 py-4 font-heading text-2xl font-extrabold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-lapis",
                        active ? "border-terracotta bg-[#fbeedd] text-cinnabar shadow-[0_0_24px_-6px_rgb(var(--lavra-candle)/0.9)]" : "border-[#d8c294] text-ink hover:border-ochre",
                      )}
                    >
                      <input
                        type="radio"
                        name="amount"
                        value={p}
                        checked={active}
                        onChange={() => {
                          setAmount(p);
                          setCustom("");
                        }}
                        className="sr-only"
                      />
                      {fmtMoney(p)}
                      {frequency === "monthly" && <span className="label-sc text-[0.75rem] font-normal text-ink-soft">{t("donate.perMonth")}</span>}
                    </label>
                  );
                })}
              </div>
              <div className="mt-4 grid gap-1.5">
                <label htmlFor="donate-custom" className="label-sc text-[0.95rem]">
                  {t("donate.custom")}
                </label>
                <div className="relative max-w-xs">
                  <span className="label-sc pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[0.9rem] text-ink-soft">{d.currency}</span>
                  <input
                    id="donate-custom"
                    inputMode="decimal"
                    value={custom}
                    onChange={(e) => setCustom(e.target.value.replace(/[^\d.,]/g, ""))}
                    placeholder={String(d.minimumAmount * 4)}
                    className={cn(fieldClass, "w-full rounded-md border ps-3 pe-14")}
                    aria-describedby="donate-error"
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="mt-7">
              <legend className="label-sc text-lg font-bold">{t("donate.fund")}</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {d.funds.map((f) => (
                  <label
                    key={f.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md border bg-vellum px-3.5 py-3 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-lapis",
                      fund === f.id ? "border-lapis bg-lapis/[0.06]" : "border-[#d8c294] hover:border-ochre",
                    )}
                  >
                    <input type="radio" name="fund" value={f.id} checked={fund === f.id} onChange={() => setFund(f.id)} className="size-4 accent-[var(--lavra-lapis)]" />
                    <span className="text-[1rem]">{tr(f.label)}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-7 max-w-md">
              <Field id="donate-email" label={t("donate.receiptEmail")}>
                <TextInput id="donate-email" type="email" autoComplete="email" value={email} onChange={setEmail} />
              </Field>
            </div>

            <div className="mt-8 flex flex-col gap-4 border-t border-[#dcc69c] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[1.05rem]" aria-live="polite">
                {Number.isFinite(value) && value > 0
                  ? t(frequency === "monthly" ? "donate.summaryMonthly" : "donate.summaryOnce", { amount: fmtMoney(value), fund: fundLabel })
                  : t("donate.chooseAmount")}
              </p>
              <button type="submit" className="btn-lavra btn-donate px-6 text-[1.1rem]" disabled={busy}>
                {busy ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <Lock className="size-4" aria-hidden="true" />}
                {t("donate.submit")}
              </button>
            </div>
            {error && (
              <p id="donate-error" role="alert" className="mt-3 text-cinnabar">
                {error}
              </p>
            )}
            <p className="mt-4 text-[0.85rem] text-ink-faint">{t("payment.placeholderNote")}</p>
          </div>
        </form>

        <aside className="plaster-lapis relative overflow-hidden rounded-md p-6 sm:p-8">
          <Pictogram name="candle" className="size-14 text-ochre-light" />
          <h2 className="mt-4 text-3xl">{t("donate.asideTitle")}</h2>
          <p className="mt-3 text-[#efe2c4]">{t("donate.asideText")}</p>
          <ul className="mt-6 space-y-3 text-[#efe2c4]">
            {["donate.use1", "donate.use2", "donate.use3"].map((k) => (
              <li key={k} className="flex gap-3">
                <Cross variant="byzantine" className="mt-1.5 size-3.5 shrink-0 text-ochre-light" />
                {t(k)}
              </li>
            ))}
          </ul>
        </aside>
      </div>
      <SuccessDialog
        open={!!result}
        onClose={() => setResult(null)}
        title={t("donate.thanksTitle")}
        text={t(frequency === "monthly" ? "donate.summaryMonthly" : "donate.summaryOnce", { amount: fmtMoney(value || 0), fund: fundLabel })}
        reference={result?.reference}
      />
    </section>
  );
}

function DrawnMap() {
  const { t } = useI18n();
  return (
    <svg viewBox="0 0 600 420" role="img" aria-label={t("contact.mapAlt")} className="block h-full w-full">
      <defs>
        <filter id="mapPaper">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
          <feColorMatrix values="0 0 0 0 0.45 0 0 0 0 0.32 0 0 0 0 0.15 0 0 0 0.12 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <rect width="600" height="420" fill="#f1e2c0" />
      <rect width="600" height="420" filter="url(#mapPaper)" fill="#f1e2c0" />
      <path d="M0 330c90-30 160 10 240-20s170-60 360-30v140H0z" fill="#9fb7c9" opacity=".55" />
      <path d="M0 340c90-30 160 10 240-20s170-60 360-30" fill="none" stroke="#5a7fae" strokeWidth="2" opacity=".6" />
      <g fill="#c9d1a6" opacity=".7">
        <circle cx="470" cy="90" r="46" />
        <circle cx="510" cy="130" r="30" />
      </g>
      <g stroke="#fbf5e6" strokeWidth="18" strokeLinecap="round" fill="none">
        <path d="M-10 210H610" />
        <path d="M300 -10V320" />
        <path d="M120 -10l60 330" />
        <path d="M430 210l90 120" />
      </g>
      <g stroke="#c9ad78" strokeWidth="1.5" fill="none">
        <path d="M-10 201H610M-10 219H610" />
        <path d="M291 -10V320M309 -10V320" />
      </g>
      <g fontFamily="var(--lavra-font-label)" fontSize="15" fill="#5b4634" letterSpacing="1.5">
        <text x="20" y="200">EXAMPLE STREET</text>
        <text x="318" y="60" transform="rotate(90 318 60)">SAMPLE AVENUE</text>
        <text x="360" y="372" fontStyle="italic" fill="#24497c">Sample River</text>
      </g>
      <g transform="translate(330 120)">
        <circle r="44" fill="var(--lavra-ochre)" opacity=".22" />
        <rect x="-26" y="-6" width="52" height="34" fill="#b0502b" stroke="#5b2a14" strokeWidth="2" />
        <rect x="-11" y="-26" width="22" height="22" fill="#c48a2c" stroke="#5b2a14" strokeWidth="2" />
        <path d="M-12 -26a12 12 0 0 1 24 0z" fill="#24497c" stroke="#5b2a14" strokeWidth="2" />
        <path d={CROSS_GEOMETRY.slavic.d} transform="translate(-6 -58) scale(0.5)" fill="#a32c1b" />
      </g>
      <g transform="translate(70 70)" fill="none" stroke="#8a7560" strokeWidth="1.5">
        <circle r="28" />
        <path d="M0 -36 6 0 0 36 -6 0z" fill="#b0502b" stroke="none" />
        <text y="-42" textAnchor="middle" fontFamily="var(--lavra-font-label)" fontSize="13" fill="#5b4634" stroke="none">N</text>
      </g>
      <rect x="6" y="6" width="588" height="408" fill="none" stroke="#a32c1b" strokeWidth="4" />
      <rect x="14" y="14" width="572" height="392" fill="none" stroke="#c48a2c" strokeWidth="2" />
    </svg>
  );
}

export function ContactPanel({ section }: SectionProps) {
  const { t, tr } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", phone: "", topic: "general", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<HandlerResult | null>(null);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = t("form.required");
    if (!isEmail(form.email)) errs.email = t("form.emailInvalid");
    if (form.phone && !isPhoneComplete(form.phone)) errs.phone = t("form.phoneInvalid");
    if (form.message.trim().length < 5) errs.message = t("form.messageShort");
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const r = await submitContactMessage(form);
    setBusy(false);
    setResult(r);
    setForm({ name: "", email: "", phone: "", topic: "general", message: "" });
  };

  return (
    <section id={section.id} className="py-8 sm:py-12">
      <div className="container-lavra grid gap-8 lg:grid-cols-2">
        <form onSubmit={onSubmit} noValidate className="fresco-card p-5 sm:p-8">
          <div className="relative z-10 grid gap-5">
            <h2 className="text-3xl">{t("contact.formTitle")}</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="c-name" label={t("form.name")} required error={errors.name}>
                <TextInput id="c-name" autoComplete="name" value={form.name} onChange={set("name")} error={errors.name} />
              </Field>
              <Field id="c-email" label={t("form.email")} required error={errors.email}>
                <TextInput id="c-email" type="email" autoComplete="email" value={form.email} onChange={set("email")} error={errors.email} />
              </Field>
              <Field id="c-phone" label={t("form.phone")} error={errors.phone} hint="(000)-000-0000">
                <PhoneInput id="c-phone" value={form.phone} onChange={set("phone")} error={errors.phone} />
              </Field>
              <Field id="c-topic" label={t("contact.topic")} required>
                <select id="c-topic" value={form.topic} onChange={(e) => set("topic")(e.target.value)} className={cn(fieldClass, "w-full rounded-md border px-3")}>
                  {["general", "visit", "sacraments", "clergy"].map((k) => (
                    <option key={k} value={k}>
                      {t(`contact.topic.${k}`)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field id="c-message" label={t("form.message")} required error={errors.message}>
              <TextArea id="c-message" value={form.message} onChange={set("message")} error={errors.message} rows={5} />
            </Field>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[0.85rem] text-ink-faint">{t("contact.privacy")}</p>
              <button type="submit" className="btn-lavra btn-primary px-6" disabled={busy}>
                {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {t("contact.send")}
              </button>
            </div>
          </div>
        </form>

        <div id="directions" className="grid scroll-mt-28 content-start gap-6">
          <FrescoFrame>
            <div className="aspect-[10/7]">
              {site.contact.map.embedUrl ? <iframe src={site.contact.map.embedUrl} title={t("contact.mapAlt")} className="size-full" loading="lazy" /> : <DrawnMap />}
            </div>
          </FrescoFrame>
          <div className="fresco-card p-5 sm:p-6">
            <div className="relative z-10 grid gap-4">
              <h2 className="text-2xl">{t("contact.directionsTitle")}</h2>
              <p className="flex gap-3">
                <MapPin className="mt-1 size-5 shrink-0 text-cinnabar" aria-hidden="true" />
                <span>{site.contact.addressLines.join(", ")}</span>
              </p>
              <p className="flex gap-3 text-ink-soft">
                <Navigation className="mt-1 size-5 shrink-0 text-ochre-deep" aria-hidden="true" />
                <span>{tr(site.contact.parking)}</span>
              </p>
              <p className="flex gap-3 text-ink-soft">
                <Train className="mt-1 size-5 shrink-0 text-ochre-deep" aria-hidden="true" />
                <span>{tr(site.contact.transit)}</span>
              </p>
              <p className="flex gap-3 text-ink-soft">
                <Clock className="mt-1 size-5 shrink-0 text-ochre-deep" aria-hidden="true" />
                <span>
                  {t("contact.officeHours")}: {tr(site.contact.officeHours)}
                </span>
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <a href={site.contact.map.directionsUrl} target="_blank" rel="noopener noreferrer" className="btn-lavra btn-lapis">
                  <Navigation className="size-4" aria-hidden="true" />
                  {t("glance.getDirections")}
                </a>
                <a href={`tel:${site.contact.phone.replace(/[^\d+]/g, "")}`} className="btn-lavra btn-ghost">
                  <Phone className="size-4" aria-hidden="true" />
                  {site.contact.phone}
                </a>
                <a href={`mailto:${site.contact.email}`} className="btn-lavra btn-ghost">
                  <Mail className="size-4" aria-hidden="true" />
                  {t("form.email")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SuccessDialog open={!!result} onClose={() => setResult(null)} title={t("contact.sentTitle")} text={t("contact.sentText")} reference={result?.reference} />
    </section>
  );
}
