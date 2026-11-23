"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { Check, ChevronLeft, Loader2, Lock, Minus, Package, Plus, ShoppingBag, Store as StoreIcon, Trash2, Truck } from "lucide-react";
import { products, site } from "@/lib/content";
import { startPayment, type HandlerResult } from "@/lib/handlers";
import { isEmail, isPhoneComplete } from "@/lib/forms";
import { firstPageWithSection, pagePath } from "@/lib/routes";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCart, useI18n, type CartItem } from "@/components/providers";
import { FrescoFrame, PaintedBand } from "@/components/orthodox/Ornaments";
import { Pictogram } from "@/components/orthodox/Pictogram";
import { EmptyState, GlowCard } from "@/components/sections/common";
import { Breadcrumbs, type SectionProps } from "@/components/sections/ContentSections";
import { Field, PhoneInput, SuccessDialog, TextArea, TextInput } from "@/components/sections/FormBits";
import { FilterChips } from "@/components/sections/MediaSections";

const storePage = () => firstPageWithSection("store-catalog");

function minPrice(p: Product) {
  return Math.min(...p.variants.map((v) => v.price));
}
function inStock(p: Product) {
  return p.variants.some((v) => v.stock > 0);
}

export function Price({ value, className }: { value: number; className?: string }) {
  const { fmtMoney } = useI18n();
  return <span className={cn("tabular-nums", className)}>{fmtMoney(value, site.store.currency)}</span>;
}

function Qty({ value, onChange, max, label }: { value: number; onChange: (n: number) => void; max?: number; label: string }) {
  const { t } = useI18n();
  return (
    <div className="inline-flex items-center rounded-md border border-[#c9ad78] bg-vellum" role="group" aria-label={label}>
      <button type="button" className="grid size-10 place-items-center disabled:opacity-40" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label={t("store.decrease")}>
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <span className="w-9 text-center tabular-nums" aria-live="polite">
        {value}
      </span>
      <button type="button" className="grid size-10 place-items-center disabled:opacity-40" onClick={() => onChange(value + 1)} disabled={max != null && value >= max} aria-label={t("store.increase")}>
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function StoreCatalog({ section, pageId }: SectionProps) {
  const { lang, tr, t } = useI18n();
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("featured");
  const list = useMemo(() => {
    const l = products.items.filter((p) => cat === "all" || p.category === cat);
    if (sort === "price-asc") return l.slice().sort((a, b) => minPrice(a) - minPrice(b));
    if (sort === "price-desc") return l.slice().sort((a, b) => minPrice(b) - minPrice(a));
    if (sort === "name") return l.slice().sort((a, b) => tr(a.name).localeCompare(tr(b.name)));
    return l.slice().sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [cat, sort, tr]);

  const options = [
    { id: "all", label: t("filter.all"), count: products.items.length },
    ...products.categories.map((c) => ({ id: c.id, label: tr(c.label), count: products.items.filter((p) => p.category === c.id).length })),
  ];

  return (
    <section id={section.id} className="py-8 sm:py-12">
      <div className="container-lavra">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <FilterChips options={options} value={cat} onChange={setCat} label={t("filter.byCategory")} />
          <label className="flex shrink-0 items-center gap-2">
            <span className="label-sc text-[0.9rem] text-ink-soft">{t("store.sort")}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 rounded-md border border-input bg-vellum px-3 text-[0.97rem]">
              <option value="featured">{t("store.sort.featured")}</option>
              <option value="price-asc">{t("store.sort.priceAsc")}</option>
              <option value="price-desc">{t("store.sort.priceDesc")}</option>
              <option value="name">{t("store.sort.name")}</option>
            </select>
          </label>
        </div>
        <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[0.92rem] text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <Truck className="size-4 text-ochre-deep" aria-hidden="true" />
            {t("store.shipFlat")} <Price value={site.store.shipping.flatRate} /> · {t("store.freeOver")} <Price value={site.store.shipping.freeOver} />
          </span>
          <span className="inline-flex items-center gap-1.5">
            <StoreIcon className="size-4 text-ochre-deep" aria-hidden="true" />
            {t("store.pickupFree")}
          </span>
        </p>
        {list.length ? (
          <ul className="mt-7 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((p) => {
              const available = inStock(p);
              const multiple = new Set(p.variants.map((v) => v.price)).size > 1;
              return (
                <li key={p.id}>
                  <GlowCard as={Link} href={pagePath(lang, pageId, undefined, [p.id])} className="group flex h-full flex-col overflow-hidden">
                    <span className="relative z-10 block overflow-hidden border-b border-[#d9c49a] bg-parchment-deep">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0]} alt="" loading="lazy" className={cn("block aspect-square w-full object-cover transition duration-700 group-hover:scale-[1.04]", !available && "grayscale-[0.6]")} />
                      {!available && <span className="label-sc absolute start-2 top-2 rounded bg-ink/85 px-2 py-0.5 text-[0.75rem] text-white">{t("store.soldOut")}</span>}
                      {p.featured && available && <span className="label-sc absolute start-2 top-2 rounded bg-ochre px-2 py-0.5 text-[0.75rem] font-bold text-[#2a1407]">{t("store.featured")}</span>}
                    </span>
                    <span className="relative z-10 flex flex-1 flex-col p-3 sm:p-4">
                      <span className="rubric text-[0.75rem] sm:text-[0.8rem]">{tr(products.categories.find((c) => c.id === p.category)?.label)}</span>
                      <span className="mt-1 font-heading text-[1.05rem] font-bold leading-tight sm:text-[1.2rem]">{tr(p.name)}</span>
                      <span className="mt-auto flex flex-wrap items-baseline gap-x-1.5 pt-3">
                        {multiple && <span className="text-[0.82rem] text-ink-soft">{t("store.from")}</span>}
                        <Price value={minPrice(p)} className="font-heading text-lg font-bold text-cinnabar" />
                      </span>
                    </span>
                  </GlowCard>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-7">
            <EmptyState title={t("store.empty")} icon={<Pictogram name="candle" className="size-10 text-ochre-deep" />} />
          </div>
        )}
      </div>
    </section>
  );
}

export function ProductView({ id, pageId }: { id: string; pageId: string }) {
  const { lang, tr, t } = useI18n();
  const cart = useCart();
  const p = products.items.find((x) => x.id === id)!;
  const [variantId, setVariantId] = useState(p.variants.find((v) => v.stock > 0)?.id ?? p.variants[0].id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [image, setImage] = useState(0);
  const v = p.variants.find((x) => x.id === variantId)!;
  const related = products.items.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 3);

  const add = () => {
    cart.add({
      key: `product:${p.id}:${v.id}`,
      kind: "product",
      refId: p.id,
      variantId: v.id,
      title: p.name,
      subtitle: v.label,
      quantity: qty,
      unitPrice: v.price,
      image: p.images[0],
      shippable: true,
    });
    setAdded(true);
  };

  return (
    <section className="pt-8 pb-10 sm:pt-12">
      <div className="container-lavra">
        <Breadcrumbs pageId={pageId} extra={tr(p.name)} />
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div>
            <FrescoFrame>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.images[image]} alt={tr(p.name)} className="block aspect-square w-full object-cover" />
            </FrescoFrame>
            {p.images.length > 1 && (
              <div className="mt-3 flex gap-2">
                {p.images.map((src, i) => (
                  <button key={src} type="button" onClick={() => setImage(i)} className={cn("size-16 overflow-hidden rounded border-2", i === image ? "border-cinnabar" : "border-transparent")} aria-label={t("gallery.counter", { n: i + 1, total: p.images.length })}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="rubric text-sm">{tr(products.categories.find((c) => c.id === p.category)?.label)}</p>
            <h1 className="mt-2 text-[2.2rem] leading-[1.06] sm:text-[2.9rem]">{tr(p.name)}</h1>
            <p className="mt-3 font-heading text-3xl font-bold text-cinnabar">
              <Price value={v.price} />
            </p>
            <p className="mt-4 text-[1.08rem] text-ink-soft">{tr(p.description)}</p>

            <fieldset className="mt-6">
              <legend className="label-sc text-[1rem] font-bold">{t("store.option")}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.variants.map((x) => (
                  <label
                    key={x.id}
                    className={cn(
                      "label-sc cursor-pointer rounded-full border px-4 py-2 text-[0.95rem] transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-lapis",
                      x.id === variantId ? "border-lapis bg-lapis text-[#fff8ea]" : "border-[#c9ad78] bg-vellum hover:border-ochre",
                      x.stock === 0 && "line-through opacity-60",
                    )}
                  >
                    <input
                      type="radio"
                      name="variant"
                      className="sr-only"
                      checked={x.id === variantId}
                      onChange={() => {
                        setVariantId(x.id);
                        setQty(1);
                        setAdded(false);
                      }}
                    />
                    {tr(x.label)}
                  </label>
                ))}
              </div>
            </fieldset>

            <p className={cn("mt-4 inline-flex items-center gap-2 text-[0.95rem]", v.stock > 0 ? "text-verdigris" : "text-cinnabar")}>
              <Package className="size-4" aria-hidden="true" />
              {v.stock === 0 ? t("store.soldOutLong") : v.stock <= 5 ? t("store.fewLeft", { n: v.stock }) : t("store.inStock")}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Qty value={qty} onChange={(n) => setQty(Math.max(1, Math.min(n, v.stock || 1)))} max={v.stock} label={t("store.quantity")} />
              <button type="button" onClick={add} disabled={v.stock === 0} className="btn-lavra btn-primary px-6 disabled:cursor-not-allowed disabled:opacity-50">
                <ShoppingBag className="size-4" aria-hidden="true" />
                {t("store.addToCart")}
              </button>
            </div>
            {added && (
              <p role="status" className="mt-4 flex flex-wrap items-center gap-3 rounded border border-verdigris/40 bg-verdigris/10 px-3 py-2">
                <Check className="size-4 text-verdigris" aria-hidden="true" />
                {t("store.added")}
                <Link href={pagePath(lang, "cart")} className="label-sc font-bold text-cinnabar underline underline-offset-4">
                  {t("cart.view")}
                </Link>
              </p>
            )}

            <div className="mt-8 grid gap-3 rounded-md border border-[#d9c49a] bg-vellum/70 p-4 text-[0.95rem] sm:grid-cols-2">
              <p className="flex gap-2">
                <Truck className="mt-0.5 size-4 shrink-0 text-ochre-deep" aria-hidden="true" />
                <span>
                  {t("store.shipFlat")} <Price value={site.store.shipping.flatRate} />. {t("store.freeOver")} <Price value={site.store.shipping.freeOver} />.
                </span>
              </p>
              <p className="flex gap-2">
                <StoreIcon className="mt-0.5 size-4 shrink-0 text-ochre-deep" aria-hidden="true" />
                <span>{tr(site.store.pickup.label)}</span>
              </p>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl">{t("store.related")}</h2>
            <ul className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.id}>
                  <GlowCard as={Link} href={pagePath(lang, pageId, undefined, [r.id])} className="flex h-full items-center gap-4 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.images[0]} alt="" className="relative z-10 size-20 shrink-0 rounded object-cover" />
                    <span className="relative z-10 min-w-0">
                      <span className="block font-heading font-bold leading-tight">{tr(r.name)}</span>
                      <Price value={minPrice(r)} className="text-cinnabar" />
                    </span>
                  </GlowCard>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function CartLine({ item, editable = true }: { item: CartItem; editable?: boolean }) {
  const { tr, t } = useI18n();
  const cart = useCart();
  const details = item.details as { names?: string[] } | undefined;
  return (
    <li className="flex gap-4 py-4">
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt="" className="size-20 shrink-0 rounded border border-[#d9c49a] object-cover" />
      ) : (
        <span className="grid size-20 shrink-0 place-items-center rounded border border-[#d9c49a] bg-parchment-deep text-cinnabar">
          <Pictogram name={item.kind === "candle" ? "candle" : item.kind === "gift" ? "church" : "cross"} className="size-9" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-heading text-lg font-bold leading-tight">{tr(item.title)}</p>
            {item.subtitle && <p className="text-[0.92rem] text-ink-soft">{tr(item.subtitle)}</p>}
            {details?.names && details.names.length > 0 && <p className="mt-1 text-[0.9rem] text-ink-soft">{details.names.join(", ")}</p>}
          </div>
          <Price value={item.unitPrice * item.quantity} className="font-heading text-lg font-bold" />
        </div>
        {editable && (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {item.kind === "product" ? (
              <Qty value={item.quantity} onChange={(n) => cart.update(item.key, n)} label={t("store.quantity")} />
            ) : (
              <span className="text-[0.88rem] text-ink-faint">{t(`cart.kind.${item.kind}`)}</span>
            )}
            <button type="button" onClick={() => cart.remove(item.key)} className="inline-flex items-center gap-1.5 text-[0.9rem] text-cinnabar hover:underline">
              <Trash2 className="size-4" aria-hidden="true" />
              {t("cart.remove")}
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

function shippingFor(subtotalShippable: number, method: "ship" | "pickup") {
  if (method === "pickup" || subtotalShippable === 0) return 0;
  return subtotalShippable >= site.store.shipping.freeOver ? 0 : site.store.shipping.flatRate;
}

export function CartView({ section }: SectionProps) {
  const { lang, t } = useI18n();
  const cart = useCart();
  const sp = storePage();
  return (
    <section id={section.id} className="pt-8 pb-10 sm:pt-12">
      <div className="container-lavra">
        <Breadcrumbs pageId="cart" />
        <h1 className="mt-6 text-[2.4rem] sm:text-[3.2rem]">{t("cart.title")}</h1>
        {!cart.ready ? (
          <div className="mt-8 h-40 animate-pulse rounded-md bg-parchment-deep" aria-busy="true" aria-label={t("state.loading")} />
        ) : cart.items.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title={t("cart.empty")}
              text={t("cart.emptyText")}
              icon={<ShoppingBag className="size-10 text-ochre-deep" aria-hidden="true" />}
            />
            {sp && (
              <div className="mt-6 text-center">
                <Link href={pagePath(lang, sp)} className="btn-lavra btn-primary">
                  {t("cart.continue")}
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="fresco-card px-5 sm:px-6">
              <ul className="relative z-10 divide-y divide-dashed divide-[#d9c49a]">
                {cart.items.map((i) => (
                  <CartLine key={i.key} item={i} />
                ))}
              </ul>
            </div>
            <aside className="fresco-card h-fit p-5 sm:p-6 lg:sticky lg:top-24">
              <div className="relative z-10">
                <p className="flex items-baseline justify-between text-lg">
                  <span className="label-sc">{t("cart.subtotal")}</span>
                  <Price value={cart.subtotal} className="font-heading text-2xl font-bold" />
                </p>
                <p className="mt-2 text-[0.9rem] text-ink-soft">{t("cart.shippingLater")}</p>
                <Link href={pagePath(lang, "checkout")} className="btn-lavra btn-donate mt-5 w-full">
                  <Lock className="size-4" aria-hidden="true" />
                  {t("cart.checkout")}
                </Link>
                {sp && (
                  <Link href={pagePath(lang, sp)} className="btn-lavra btn-ghost mt-3 w-full">
                    <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
                    {t("cart.continue")}
                  </Link>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

export function Checkout({ section }: SectionProps) {
  const { lang, t, tr } = useI18n();
  const cart = useCart();
  const shippableSubtotal = cart.items.filter((i) => i.shippable).reduce((n, i) => n + i.unitPrice * i.quantity, 0);
  const needsFulfillment = cart.items.some((i) => i.shippable);
  const [method, setMethod] = useState<"ship" | "pickup">("pickup");
  const [f, setF] = useState({ name: "", email: "", phone: "", address1: "", address2: "", city: "", region: "", postal: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<HandlerResult | null>(null);
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  const shipping = needsFulfillment ? shippingFor(shippableSubtotal, method) : 0;
  const total = cart.subtotal + shipping;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!f.name.trim()) errs.name = t("form.required");
    if (!isEmail(f.email)) errs.email = t("form.emailInvalid");
    if (f.phone && !isPhoneComplete(f.phone)) errs.phone = t("form.phoneInvalid");
    if (needsFulfillment && method === "ship") {
      if (!f.address1.trim()) errs.address1 = t("form.required");
      if (!f.city.trim()) errs.city = t("form.required");
      if (!f.postal.trim()) errs.postal = t("form.required");
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const r = await startPayment({
      kind: "order",
      amount: total,
      currency: site.store.currency,
      recurring: "once",
      lines: [
        ...cart.items.map((i) => ({ id: i.key, description: tr(i.title), quantity: i.quantity, unitAmount: i.unitPrice })),
        ...(shipping ? [{ id: "shipping", description: "Shipping", quantity: 1, unitAmount: shipping }] : []),
      ],
      metadata: { fulfillment: needsFulfillment ? method : "none", email: f.email },
    });
    setBusy(false);
    setResult(r);
    cart.clear();
  };

  return (
    <section id={section.id} className="pt-8 pb-10 sm:pt-12">
      <div className="container-lavra">
        <Breadcrumbs pageId="checkout" />
        <h1 className="mt-6 text-[2.4rem] sm:text-[3.2rem]">{t("checkout.title")}</h1>
        {!cart.ready ? (
          <div className="mt-8 h-40 animate-pulse rounded-md bg-parchment-deep" aria-busy="true" />
        ) : cart.items.length === 0 && !result ? (
          <div className="mt-8">
            <EmptyState title={t("cart.empty")} text={t("cart.emptyText")} icon={<ShoppingBag className="size-10 text-ochre-deep" aria-hidden="true" />} />
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="grid content-start gap-6">
              <section className="fresco-card p-5 sm:p-6">
                <div className="relative z-10 grid gap-4">
                  <h2 id="co-h-contact" className="font-heading text-2xl font-bold">{t("checkout.contact")}</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="co-name" label={t("form.name")} required error={errors.name}>
                      <TextInput id="co-name" autoComplete="name" value={f.name} onChange={set("name")} error={errors.name} />
                    </Field>
                    <Field id="co-email" label={t("form.email")} required error={errors.email}>
                      <TextInput id="co-email" type="email" autoComplete="email" value={f.email} onChange={set("email")} error={errors.email} />
                    </Field>
                    <Field id="co-phone" label={t("form.phone")} error={errors.phone} hint="(000)-000-0000">
                      <PhoneInput id="co-phone" value={f.phone} onChange={set("phone")} error={errors.phone} />
                    </Field>
                  </div>
                </div>
              </section>

              {needsFulfillment && (
                <section className="fresco-card p-5 sm:p-6">
                  <div className="relative z-10 grid gap-4">
                    <h2 id="co-h-fulfil" className="font-heading text-2xl font-bold">{t("checkout.fulfillment")}</h2>
                    <div role="radiogroup" aria-labelledby="co-h-fulfil" className="grid gap-3 sm:grid-cols-2">
                      {(["pickup", "ship"] as const).map((m) => (
                        <label
                          key={m}
                          className={cn(
                            "flex cursor-pointer gap-3 rounded-md border-2 bg-vellum p-4 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-lapis",
                            method === m ? "border-lapis shadow-[0_0_22px_-8px_rgb(36_73_124/0.6)]" : "border-[#d8c294] hover:border-ochre",
                          )}
                        >
                          <input type="radio" name="fulfillment" checked={method === m} onChange={() => setMethod(m)} className="mt-1 size-4 accent-[var(--lavra-lapis)]" />
                          <span>
                            <span className="flex items-center gap-2 font-heading text-lg font-bold">
                              {m === "ship" ? <Truck className="size-5 text-ochre-deep" aria-hidden="true" /> : <StoreIcon className="size-5 text-ochre-deep" aria-hidden="true" />}
                              {t(`checkout.${m}`)}
                            </span>
                            <span className="mt-1 block text-[0.92rem] text-ink-soft">
                              {m === "pickup" ? (
                                tr(site.store.pickup.label)
                              ) : (
                                <>
                                  <Price value={shippingFor(shippableSubtotal, "ship")} /> · {t("store.freeOver")} <Price value={site.store.shipping.freeOver} />
                                </>
                              )}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                    {method === "ship" && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field id="co-a1" label={t("checkout.address1")} required error={errors.address1} className="sm:col-span-2">
                          <TextInput id="co-a1" autoComplete="address-line1" value={f.address1} onChange={set("address1")} error={errors.address1} />
                        </Field>
                        <Field id="co-a2" label={t("checkout.address2")} className="sm:col-span-2">
                          <TextInput id="co-a2" autoComplete="address-line2" value={f.address2} onChange={set("address2")} />
                        </Field>
                        <Field id="co-city" label={t("checkout.city")} required error={errors.city}>
                          <TextInput id="co-city" autoComplete="address-level2" value={f.city} onChange={set("city")} error={errors.city} />
                        </Field>
                        <Field id="co-region" label={t("checkout.region")}>
                          <TextInput id="co-region" autoComplete="address-level1" value={f.region} onChange={set("region")} />
                        </Field>
                        <Field id="co-postal" label={t("checkout.postal")} required error={errors.postal}>
                          <TextInput id="co-postal" autoComplete="postal-code" value={f.postal} onChange={set("postal")} error={errors.postal} />
                        </Field>
                      </div>
                    )}
                  </div>
                </section>
              )}

              <section className="fresco-card p-5 sm:p-6">
                <div className="relative z-10 grid gap-4">
                  <h2 id="co-h-pay" className="font-heading text-2xl font-bold">{t("checkout.payment")}</h2>
                  <div className="rounded-md border border-dashed border-ochre bg-ochre/10 p-4 text-[0.95rem] text-ink-soft">
                    <p className="flex items-center gap-2 font-bold text-ink">
                      <Lock className="size-4" aria-hidden="true" />
                      {t("payment.providerTitle")}
                    </p>
                    <p className="mt-1">{t("payment.placeholderNote")}</p>
                  </div>
                  <Field id="co-notes" label={t("checkout.notes")}>
                    <TextArea id="co-notes" value={f.notes} onChange={set("notes")} rows={3} />
                  </Field>
                </div>
              </section>
            </div>

            <aside className="fresco-card h-fit overflow-hidden p-0 lg:sticky lg:top-24">
              <PaintedBand variant="teeth" />
              <div className="relative z-10 p-5 sm:p-6">
                <h2 className="text-2xl">{t("checkout.summary")}</h2>
                <ul className="divide-y divide-dashed divide-[#d9c49a]">
                  {cart.items.map((i) => (
                    <CartLine key={i.key} item={i} editable={false} />
                  ))}
                </ul>
                <dl className="mt-2 grid gap-1.5 border-t border-[#d9c49a] pt-3">
                  <div className="flex justify-between">
                    <dt>{t("cart.subtotal")}</dt>
                    <dd><Price value={cart.subtotal} /></dd>
                  </div>
                  {needsFulfillment && (
                    <div className="flex justify-between">
                      <dt>{t("checkout.shipping")}</dt>
                      <dd>{shipping ? <Price value={shipping} /> : t("checkout.free")}</dd>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-[#d9c49a] pt-2 font-heading text-xl font-bold">
                    <dt>{t("checkout.total")}</dt>
                    <dd><Price value={total} /></dd>
                  </div>
                </dl>
                <button type="submit" className="btn-lavra btn-donate mt-5 w-full" disabled={busy || cart.items.length === 0}>
                  {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Lock className="size-4" aria-hidden="true" />}
                  {t("checkout.place")}
                </button>
                <Link href={pagePath(lang, "cart")} className="mt-3 inline-flex items-center gap-1 text-[0.92rem] text-ink-soft hover:text-cinnabar">
                  <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
                  {t("checkout.backToCart")}
                </Link>
              </div>
            </aside>
          </form>
        )}
      </div>
      <SuccessDialog open={!!result} onClose={() => setResult(null)} title={t("checkout.thanksTitle")} text={t("checkout.thanksText")} reference={result?.reference} />
    </section>
  );
}
