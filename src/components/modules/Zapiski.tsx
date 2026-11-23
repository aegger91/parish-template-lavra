"use client";

import { useRef, useState } from "react";
import { Info, Loader2, Lock, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { isFeatureOn, site } from "@/lib/content";
import { startPayment, submitCommemorations, type HandlerResult } from "@/lib/handlers";
import { isEmail } from "@/lib/forms";
import { pagePath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useCart, useI18n, type CartItem } from "@/components/providers";
import { Cross } from "@/components/orthodox/Cross";
import type { SectionProps } from "@/components/sections/ContentSections";
import { Field, SuccessDialog, TextInput } from "@/components/sections/FormBits";

type SlipType = "health" | "repose";
interface NameRow {
  id: string;
  prefix: string;
  name: string;
}
interface Slip {
  id: string;
  type: SlipType;
  rows: NameRow[];
  commemoration: string;
  candle: string;
  amount: number;
  amountCustom: string;
}

const CLERGY_PREFIXES = ["infant", "priest", "deacon", "hieromonk", "monk", "nun"];
const prefixesFor = (type: SlipType) => (type === "repose" ? [...CLERGY_PREFIXES, "newlyDeparted"] : CLERGY_PREFIXES);

const cfg = site.zapiski;
const typesFor = (type: SlipType) => cfg.commemorationTypes.filter((c) => c.appliesTo.includes(type));

function slipDonation(s: Slip) {
  if (s.amountCustom.trim()) return Number(s.amountCustom.replace(",", ".")) || 0;
  return s.amount;
}

function slipTotal(s: Slip) {
  const k = cfg.candles.find((x) => x.id === s.candle)?.price ?? 0;
  return slipDonation(s) + k;
}

function SlipPaper({
  slip,
  index,
  error,
  onChange,
}: {
  slip: Slip;
  index: number;
  error?: string;
  onChange: (s: Slip) => void;
}) {
  const { t } = useI18n();
  const repose = slip.type === "repose";
  const max = cfg.maxNamesPerSlip;
  const setRow = (id: string, patch: Partial<NameRow>) => onChange({ ...slip, rows: slip.rows.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  const addRow = () => {
    if (slip.rows.length >= max) return;
    const id = `${slip.id}-r${Date.now().toString(36)}`;
    onChange({ ...slip, rows: [...slip.rows, { id, prefix: "", name: "" }] });
    requestAnimationFrame(() => document.getElementById(`${id}-name`)?.focus());
  };
  const removeRow = (id: string) => onChange({ ...slip, rows: slip.rows.length > 1 ? slip.rows.filter((r) => r.id !== id) : [{ ...slip.rows[0], prefix: "", name: "" }] });

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[24rem] bg-[#fffdf7] px-4 pt-5 pb-4 shadow-[0_14px_30px_-18px_rgb(42_28_18/0.6)] sm:px-6",
        repose ? "border-[5px] border-[#17110d] outline outline-1 -outline-offset-[11px] outline-[#17110d]" : "border border-[#e3b3a4] outline outline-1 -outline-offset-[7px] outline-[#e3b3a4]/70",
      )}
    >
      <div className={cn("flex flex-col items-center", repose ? "text-[#17110d]" : "text-cinnabar")}>
        <Cross variant="slavic" className="h-11 w-auto" title={t("zapiski.crossTitle")} />
        <p className="label-sc mt-2 text-[1.2rem] font-bold leading-snug tracking-[0.06em]">{t(repose ? "zapiski.repose" : "zapiski.health")}</p>
        <span className={cn("mt-1 h-px w-24", repose ? "bg-[#17110d]" : "bg-cinnabar/60")} />
      </div>
      <ol className="mt-3" aria-label={t("zapiski.namesLabel", { n: index + 1 })}>
        {slip.rows.map((r, i) => (
          <li key={r.id} className="flex items-end gap-1.5 py-1">
            <span className="w-5 shrink-0 pb-2 text-end font-heading text-[0.95rem] text-ink-faint tabular-nums">{i + 1}.</span>
            <label className="sr-only" htmlFor={`${r.id}-prefix`}>
              {t("zapiski.prefix")}
            </label>
            <select
              id={`${r.id}-prefix`}
              value={r.prefix}
              onChange={(e) => setRow(r.id, { prefix: e.target.value })}
              className="h-9 w-[6.4rem] shrink-0 truncate rounded border border-[#e2d3b4] bg-transparent px-1 text-[0.86rem] text-ink-soft"
            >
              <option value="">{t("zapiski.prefix.none")}</option>
              {prefixesFor(slip.type).map((p) => (
                <option key={p} value={p}>
                  {t(`zapiski.prefix.${p}`)}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor={`${r.id}-name`}>
              {t("zapiski.nameN", { n: i + 1 })}
            </label>
            <input
              id={`${r.id}-name`}
              value={r.name}
              maxLength={40}
              autoComplete="off"
              onChange={(e) => setRow(r.id, { name: e.target.value })}
              placeholder={i === 0 ? t("zapiski.namePlaceholder") : ""}
              className="h-9 min-w-0 flex-1 border-0 border-b border-dashed border-[#b9a17a] bg-transparent px-1 font-heading text-[1.12rem] text-ink outline-none placeholder:text-ink-faint/70 focus:border-solid focus:border-lapis"
            />
            <button type="button" onClick={() => removeRow(r.id)} className="grid size-9 shrink-0 place-items-center rounded text-ink-faint hover:bg-cinnabar/10 hover:text-cinnabar" aria-label={t("zapiski.removeName", { n: i + 1 })}>
              <X className="size-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
      <div className="mt-2 flex items-center justify-between gap-2">
        <button type="button" onClick={addRow} disabled={slip.rows.length >= max} className="label-sc inline-flex items-center gap-1.5 rounded px-1.5 py-1 text-[0.95rem] font-bold text-lapis hover:bg-lapis/10 disabled:opacity-40">
          <Plus className="size-4" aria-hidden="true" />
          {t("zapiski.addName")}
        </button>
        <span className="text-[0.82rem] text-ink-faint tabular-nums">{t("zapiski.count", { n: slip.rows.length, max })}</span>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-[0.9rem] text-cinnabar">
          {error}
        </p>
      )}
    </div>
  );
}

function SlipOptions({ slip, onChange }: { slip: Slip; onChange: (s: Slip) => void }) {
  const { t, tr, fmtMoney } = useI18n();
  const types = typesFor(slip.type);
  const selected = types.find((c) => c.id === slip.commemoration);
  const suggested = selected?.suggestedDonation ?? 0;
  const usingCustom = slip.amountCustom.trim().length > 0;
  const zeroActive = !usingCustom && slip.amount === 0;
  const suggestedActive = !usingCustom && slip.amount === suggested;

  return (
    <div className="grid content-start gap-5">
      <fieldset>
        <legend className="label-sc text-[1.02rem] font-bold">{t("zapiski.commemoration")}</legend>
        <div className="mt-2 grid gap-2">
          {types.map((c) => (
            <label
              key={c.id}
              className={cn(
                "flex cursor-pointer gap-3 rounded-md border bg-vellum px-3 py-2.5 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-lapis",
                slip.commemoration === c.id ? "border-lapis bg-lapis/[0.06]" : "border-[#d8c294] hover:border-ochre",
              )}
            >
              <input type="radio" name={`${slip.id}-comm`} checked={slip.commemoration === c.id} onChange={() => onChange({ ...slip, commemoration: c.id })} className="mt-1.5 size-4 shrink-0 accent-[var(--lavra-lapis)]" />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-heading text-[1.08rem] font-bold">{tr(c.label)}</span>
                  <span className="label-sc rounded-full border border-[#d8c294] bg-parchment/50 px-2 py-0.5 text-[0.72rem] font-normal text-ink-faint">
                    {t("zapiski.suggested")} {fmtMoney(c.suggestedDonation)}
                  </span>
                </span>
                {c.hint && <span className="mt-1 block text-[0.9rem] text-ink-soft">{tr(c.hint)}</span>}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="label-sc text-[1.02rem] font-bold">{t("donate.amount")}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...slip, amount: 0, amountCustom: "" })}
            className={cn(
              "candle-glow relative grid min-w-[4.5rem] cursor-pointer place-items-center rounded-md border-2 bg-vellum px-3 py-3 font-heading text-lg font-extrabold transition",
              zeroActive ? "border-terracotta bg-[#fbeedd] text-cinnabar shadow-[0_0_24px_-6px_rgb(var(--lavra-candle)/0.9)]" : "border-[#d8c294] text-ink hover:border-ochre",
            )}
          >
            {fmtMoney(0)}
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...slip, amount: suggested, amountCustom: "" })}
            className={cn(
              "candle-glow relative grid min-w-[4.5rem] cursor-pointer place-items-center rounded-md border-2 bg-vellum px-3 py-3 font-heading text-lg font-extrabold transition",
              suggestedActive ? "border-terracotta bg-[#fbeedd] text-cinnabar shadow-[0_0_24px_-6px_rgb(var(--lavra-candle)/0.9)]" : "border-[#d8c294] text-ink hover:border-ochre",
            )}
          >
            {fmtMoney(suggested)}
          </button>
        </div>
        <div className="mt-4 grid gap-1.5">
          <label htmlFor={`${slip.id}-amount-custom`} className="label-sc text-[0.95rem]">
            {t("donate.custom")}
          </label>
          <div className="relative max-w-xs">
            <span className="label-sc pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[0.9rem] text-ink-soft">{site.donate.currency}</span>
            <input
              id={`${slip.id}-amount-custom`}
              inputMode="decimal"
              value={slip.amountCustom}
              onChange={(e) => onChange({ ...slip, amountCustom: e.target.value.replace(/[^\d.,]/g, "") })}
              placeholder="0"
              className="h-11 w-full rounded-md border border-input bg-vellum ps-3 pe-14 text-base"
            />
          </div>
        </div>
      </fieldset>
      <div className="grid gap-1.5">
        <label htmlFor={`${slip.id}-candle`} className="label-sc text-[1.02rem] font-bold">
          {t("zapiski.candle")} <span className="text-[0.8rem] font-normal text-ink-faint">({t("form.optional")})</span>
        </label>
        <select id={`${slip.id}-candle`} value={slip.candle} onChange={(e) => onChange({ ...slip, candle: e.target.value })} className="h-11 rounded-md border border-input bg-vellum px-3 text-[1rem]">
          <option value="">{t("zapiski.noCandle")}</option>
          {cfg.candles.map((c) => (
            <option key={c.id} value={c.id}>
              {tr(c.label)} · {fmtMoney(c.price)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function makeSlip(type: SlipType, id: string): Slip {
  return {
    id,
    type,
    rows: [0, 1, 2].map((n) => ({ id: `${id}-r${n}`, prefix: "", name: "" })),
    commemoration: typesFor(type)[0]?.id ?? "",
    candle: "",
    amount: 0,
    amountCustom: "",
  };
}

export function Zapiski({ section }: SectionProps) {
  const { lang, t, tr, fmtMoney } = useI18n();
  const cart = useCart();
  const storeOn = isFeatureOn("store");
  const seq = useRef(1);
  const [slips, setSlips] = useState<Slip[]>(() => [makeSlip("health", "s0")]);
  const [gift, setGift] = useState("");
  const [consent, setConsent] = useState(false);
  const [contact, setContact] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ r: HandlerResult; kind: "cart" | "paid" } | null>(null);

  const giftValue = Number(gift.replace(",", ".")) || 0;
  const total = slips.reduce((n, s) => n + slipTotal(s), 0) + giftValue;

  const update = (s: Slip) => setSlips((list) => list.map((x) => (x.id === s.id ? s : x)));
  const setType = (s: Slip, type: SlipType) => {
    const allowed = typesFor(type);
    const commemoration = allowed.some((c) => c.id === s.commemoration) ? s.commemoration : allowed[0]?.id ?? "";
    const valid = prefixesFor(type);
    update({ ...s, type, commemoration, rows: s.rows.map((r) => (r.prefix && !valid.includes(r.prefix) ? { ...r, prefix: "" } : r)) });
  };
  const addSlip = (type: SlipType) => {
    if (slips.length >= cfg.maxSlips) return;
    const s = makeSlip(type, `s${seq.current++}`);
    setSlips((l) => [...l, s]);
    requestAnimationFrame(() => document.getElementById(`${s.id}-r0-name`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  const namesOf = (s: Slip) =>
    s.rows
      .filter((r) => r.name.trim())
      .map((r) => (r.prefix ? `${t(`zapiski.prefix.${r.prefix}`)} ${r.name.trim()}` : r.name.trim()));

  const validate = () => {
    const errs: Record<string, string> = {};
    for (const s of slips) if (namesOf(s).length === 0) errs[s.id] = t("zapiski.needName");
    if (!consent) errs.consent = t("zapiski.needConsent");
    if (contact.email && !isEmail(contact.email)) errs.email = t("form.emailInvalid");
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) document.getElementById(first === "consent" ? "zap-consent" : first === "email" ? "zap-email" : `${first}-r0-name`)?.focus();
    return !first;
  };

  const reset = () => {
    seq.current = 1;
    setSlips([makeSlip("health", "s0")]);
    setGift("");
    setConsent(false);
  };

  const toCart = () => {
    if (!validate()) return;
    const items: CartItem[] = [];
    slips.forEach((s) => {
      const c = cfg.commemorationTypes.find((x) => x.id === s.commemoration);
      items.push({
        key: `commemoration:${s.id}:${Date.now().toString(36)}`,
        kind: "commemoration",
        refId: s.commemoration,
        title: s.type === "health" ? { [lang]: t("zapiski.health") } : { [lang]: t("zapiski.repose") },
        subtitle: c?.label,
        quantity: 1,
        unitPrice: slipDonation(s),
        shippable: false,
        details: { type: s.type, names: namesOf(s), commemoration: s.commemoration },
      });
      const k = cfg.candles.find((x) => x.id === s.candle);
      if (k) items.push({ key: `candle:${s.id}:${Date.now().toString(36)}`, kind: "candle", refId: k.id, title: k.label, subtitle: { [lang]: t(s.type === "health" ? "zapiski.health" : "zapiski.repose") }, quantity: 1, unitPrice: k.price, shippable: false });
    });
    if (giftValue > 0) items.push({ key: `gift:${Date.now().toString(36)}`, kind: "gift", refId: "zapiski-gift", title: { [lang]: t("zapiski.gift") }, quantity: 1, unitPrice: giftValue, shippable: false });
    cart.addMany(items);
    setResult({ r: { ok: true, reference: "", sample: true }, kind: "cart" });
    reset();
  };

  const submit = async () => {
    if (!validate()) return;
    setBusy(true);
    const payload = slips.map((s) => ({ type: s.type, names: namesOf(s), commemoration: s.commemoration, candle: s.candle || null }));
    await submitCommemorations({ slips: payload, contact, gift: giftValue });
    const r = await startPayment({
      kind: "commemoration",
      amount: total,
      currency: site.donate.currency,
      recurring: "once",
      lines: [
        ...slips.map((s) => ({ id: s.id, description: `${s.type} / ${s.commemoration}`, quantity: 1, unitAmount: slipTotal(s) })),
        ...(giftValue ? [{ id: "gift", description: "Gift", quantity: 1, unitAmount: giftValue }] : []),
      ],
      metadata: { slips: String(slips.length), email: contact.email },
    });
    setBusy(false);
    setResult({ r, kind: "paid" });
    reset();
  };

  return (
    <section id={section.id} className="py-8 sm:py-12">
      <div className="container-lavra">
        <div className="flex gap-3 rounded-md border border-[#d9c49a] bg-vellum/80 p-4 text-[0.98rem] text-ink-soft sm:p-5">
          <Info className="mt-0.5 size-5 shrink-0 text-lapis" aria-hidden="true" />
          <p>{t("zapiski.hint")}</p>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="grid content-start gap-8">
            {slips.map((s, i) => (
              <article key={s.id} className="fresco-card overflow-visible p-4 sm:p-6" aria-labelledby={`${s.id}-title`}>
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 id={`${s.id}-title`} className="text-[1.35rem]">
                      {t("zapiski.slipN", { n: i + 1 })}
                    </h2>
                    <div className="flex items-center gap-2">
                      <div role="radiogroup" aria-label={t("zapiski.type")} className="grid grid-cols-2 rounded-md border border-[#c9ad78] bg-parchment/60 p-0.5">
                        {(["health", "repose"] as const).map((type) => (
                          <label
                            key={type}
                            className={cn(
                              "label-sc cursor-pointer rounded px-3 py-1.5 text-center text-[0.92rem] font-bold transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-lapis",
                              s.type === type ? (type === "health" ? "bg-cinnabar text-white" : "bg-[#17110d] text-white") : "text-ink-soft",
                            )}
                          >
                            <input type="radio" className="sr-only" name={`${s.id}-type`} checked={s.type === type} onChange={() => setType(s, type)} />
                            {t(`zapiski.type.${type}`)}
                          </label>
                        ))}
                      </div>
                      {slips.length > 1 && (
                        <button type="button" onClick={() => setSlips((l) => l.filter((x) => x.id !== s.id))} className="grid size-9 place-items-center rounded-md border border-[#d8c294] text-ink-soft hover:border-cinnabar hover:text-cinnabar" aria-label={t("zapiski.removeSlip", { n: i + 1 })}>
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:items-start">
                    <SlipPaper slip={s} index={i} error={errors[s.id]} onChange={update} />
                    <SlipOptions slip={s} onChange={update} />
                  </div>
                  <p className="mt-4 text-end text-[0.95rem] text-ink-soft">
                    {t("zapiski.slipTotal")}: <span className="font-heading text-lg font-bold text-ink">{fmtMoney(slipTotal(s))}</span>
                  </p>
                </div>
              </article>
            ))}

            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => addSlip("health")} disabled={slips.length >= cfg.maxSlips} className="btn-lavra btn-ghost border-cinnabar/50 text-cinnabar">
                <Plus className="size-4" aria-hidden="true" />
                {t("zapiski.addHealth")}
              </button>
              <button type="button" onClick={() => addSlip("repose")} disabled={slips.length >= cfg.maxSlips} className="btn-lavra btn-ghost border-[#17110d]/60 text-[#17110d]">
                <Plus className="size-4" aria-hidden="true" />
                {t("zapiski.addRepose")}
              </button>
              <span className="text-[0.88rem] text-ink-faint">{t("zapiski.slipCount", { n: slips.length, max: cfg.maxSlips })}</span>
            </div>
          </div>

          <aside className="fresco-card h-fit p-5 sm:p-6 xl:sticky xl:top-24" aria-labelledby="zap-summary">
            <div className="relative z-10 grid gap-4">
              <h2 id="zap-summary" className="text-2xl">
                {t("zapiski.summary")}
              </h2>
              <ul className="grid gap-2 text-[0.95rem]">
                {slips.map((s, i) => {
                  const c = cfg.commemorationTypes.find((x) => x.id === s.commemoration);
                  const k = cfg.candles.find((x) => x.id === s.candle);
                  return (
                    <li key={s.id} className="flex justify-between gap-3 border-b border-dashed border-[#dcc69c] pb-2">
                      <span className="min-w-0">
                        <span className={cn("font-bold", s.type === "health" ? "text-cinnabar" : "text-[#17110d]")}>
                          {i + 1}. {t(`zapiski.type.${s.type}`)}
                        </span>
                        <span className="block text-ink-soft">
                          {tr(c?.label)} · {t("zapiski.namesCount", { n: namesOf(s).length })}
                          {k ? ` · ${tr(k.label)}` : ""}
                        </span>
                      </span>
                      <span className="shrink-0 tabular-nums">{fmtMoney(slipTotal(s))}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="grid gap-1.5">
                <label htmlFor="zap-gift" className="label-sc text-[0.98rem] font-bold">
                  {t("zapiski.gift")} <span className="text-[0.8rem] font-normal text-ink-faint">({t("form.optional")})</span>
                </label>
                <div className="relative">
                  <input id="zap-gift" inputMode="decimal" value={gift} onChange={(e) => setGift(e.target.value.replace(/[^\d.,]/g, ""))} placeholder="0" className="h-11 w-full rounded-md border border-input bg-white/75 ps-3 pe-14 text-base" />
                  <span className="label-sc pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[0.9rem] text-ink-soft">{site.donate.currency}</span>
                </div>
              </div>
              <p className="flex items-baseline justify-between border-t border-[#d9c49a] pt-3 font-heading text-xl font-bold">
                <span>{t("checkout.total")}</span>
                <span className="tabular-nums">{fmtMoney(total)}</span>
              </p>
              <Field id="zap-name" label={t("zapiski.yourName")}>
                <TextInput id="zap-name" autoComplete="name" value={contact.name} onChange={(v) => setContact((c) => ({ ...c, name: v }))} />
              </Field>
              <Field id="zap-email" label={t("zapiski.yourEmail")} error={errors.email}>
                <TextInput id="zap-email" type="email" autoComplete="email" value={contact.email} onChange={(v) => setContact((c) => ({ ...c, email: v }))} error={errors.email} />
              </Field>
              <label className="flex gap-3 rounded-md border border-[#d9c49a] bg-parchment/50 p-3 text-[0.9rem] text-ink-soft">
                <input id="zap-consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 size-4 shrink-0 accent-[var(--lavra-lapis)]" aria-describedby={errors.consent ? "zap-consent-error" : undefined} />
                <span>{t("zapiski.consent")}</span>
              </label>
              {errors.consent && (
                <p id="zap-consent-error" role="alert" className="-mt-2 text-[0.9rem] text-cinnabar">
                  {errors.consent}
                </p>
              )}
              {storeOn && (
                <button type="button" onClick={toCart} className="btn-lavra btn-primary w-full">
                  <ShoppingBag className="size-4" aria-hidden="true" />
                  {t("zapiski.addToCart")}
                </button>
              )}
              <button type="button" onClick={submit} disabled={busy} className="btn-lavra btn-donate w-full">
                {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Lock className="size-4" aria-hidden="true" />}
                {t("zapiski.submit")}
              </button>
              <p className="text-[0.82rem] text-ink-faint">{t("payment.placeholderNote")}</p>
            </div>
          </aside>
        </div>
      </div>
      <SuccessDialog
        open={!!result}
        onClose={() => setResult(null)}
        title={result?.kind === "cart" ? t("zapiski.addedTitle") : t("zapiski.sentTitle")}
        text={result?.kind === "cart" ? t("zapiski.addedText") : t("zapiski.sentText")}
        reference={result?.r.reference || undefined}
        action={result?.kind === "cart" ? { href: pagePath(lang, "cart"), label: t("cart.view") } : undefined}
      />
    </section>
  );
}
