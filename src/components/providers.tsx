"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { site, uiStrings } from "@/lib/content";
import { localeFor, makeT, resolve, tr as trBase } from "@/lib/i18n";
import { dateFromJdn } from "@/lib/calendar";
import { pagePath } from "@/lib/routes";
import type { Localized } from "@/lib/types";

interface I18nValue {
  lang: string;
  locale: string;
  dir: "ltr" | "rtl";
  t: (key: string, vars?: Record<string, string | number>) => string;
  tr: (v: Localized | undefined | null) => string;
  resolve: (v: Localized | undefined | null) => ReturnType<typeof resolve>;
  path: (pageId: string, hash?: string, extra?: string[]) => string;
  fmtDay: (jdn: number, opts?: Intl.DateTimeFormatOptions) => string;
  fmtIso: (iso: string, opts?: Intl.DateTimeFormatOptions) => string;
  fmtTime: (time: string) => string;
  fmtMoney: (amount: number, currency?: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ lang, children }: { lang: string; children: ReactNode }) {
  const value = useMemo<I18nValue>(() => {
    const def = site.defaultLanguage;
    const locale = localeFor(site.languages, lang);
    const language = site.languages.find((l) => l.code === lang);
    const dateFmt = (d: Date, opts?: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...(opts ?? { weekday: "long", month: "long", day: "numeric" }) }).format(d);
    return {
      lang,
      locale,
      dir: language?.dir ?? "ltr",
      t: makeT(uiStrings, lang, def),
      tr: (v) => trBase(v, lang, def),
      resolve: (v) => resolve(v, lang, def),
      path: (id, hash, extra) => pagePath(lang, id, hash, extra),
      fmtDay: (jdn, opts) => dateFmt(dateFromJdn(jdn), opts),
      fmtIso: (iso, opts) => {
        const [y, m, d] = iso.split("-").map(Number);
        return dateFmt(new Date(Date.UTC(y, m - 1, d, 12)), opts);
      },
      fmtTime: (time) => {
        const [h, m] = time.split(":").map(Number);
        return new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(new Date(Date.UTC(2000, 0, 1, h, m)));
      },
      fmtMoney: (amount, currency = site.donate.currency) =>
        new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: amount % 1 === 0 ? 0 : 2 }).format(amount),
    };
  }, [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const v = useContext(I18nContext);
  if (!v) throw new Error("useI18n must be used inside I18nProvider");
  return v;
}

/* Cart */

export interface CartItem {
  key: string;
  kind: "product" | "commemoration" | "candle" | "gift";
  refId: string;
  variantId?: string;
  title: Localized;
  subtitle?: Localized;
  quantity: number;
  unitPrice: number;
  image?: string;
  shippable: boolean;
  details?: Record<string, unknown>;
}

interface CartValue {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotal: number;
  add: (item: CartItem) => void;
  addMany: (items: CartItem[]) => void;
  update: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartValue | null>(null);
const STORAGE_KEY = `lavra-cart-${site.id}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore corrupted storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage may be unavailable */
    }
  }, [items, ready]);

  const addMany = useCallback((list: CartItem[]) => {
    setItems((cur) => {
      const next = [...cur];
      for (const item of list) {
        const i = next.findIndex((x) => x.key === item.key);
        if (i >= 0 && item.kind === "product") next[i] = { ...next[i], quantity: next[i].quantity + item.quantity };
        else if (i >= 0) next[i] = item;
        else next.push(item);
      }
      return next;
    });
  }, []);

  const value = useMemo<CartValue>(
    () => ({
      items,
      ready,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((n, i) => n + i.quantity * i.unitPrice, 0),
      add: (item) => addMany([item]),
      addMany,
      update: (key, quantity) =>
        setItems((cur) => cur.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, quantity) } : i))),
      remove: (key) => setItems((cur) => cur.filter((i) => i.key !== key)),
      clear: () => setItems([]),
    }),
    [items, ready, addMany],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const v = useContext(CartContext);
  if (!v) throw new Error("useCart must be used inside CartProvider");
  return v;
}
