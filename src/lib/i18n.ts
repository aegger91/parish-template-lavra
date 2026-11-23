import type { Language, Localized } from "./types";

export interface TranslateContext {
  lang: string;
  defaultLang: string;
  languages: Language[];
}

export interface Resolved {
  text: string;
  lang: string;
  isFallback: boolean;
}

/** Resolve a per-field translation: requested language, then the default language, then the first value present. */
export function resolve(value: Localized | undefined | null, lang: string, defaultLang: string): Resolved {
  if (value == null) return { text: "", lang, isFallback: false };
  if (typeof value === "string") return { text: value, lang, isFallback: false };
  const own = value[lang];
  if (own != null && own !== "") return { text: own, lang, isFallback: false };
  const def = value[defaultLang];
  if (def != null && def !== "") return { text: def, lang: defaultLang, isFallback: true };
  const first = Object.entries(value).find(([, v]) => v != null && v !== "");
  if (first) return { text: first[1], lang: first[0], isFallback: true };
  return { text: "", lang, isFallback: false };
}

export function tr(value: Localized | undefined | null, lang: string, defaultLang: string): string {
  return resolve(value, lang, defaultLang).text;
}

export function interpolate(text: string, vars?: Record<string, string | number>) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : `{${k}}`));
}

export function makeT(strings: Record<string, Localized>, lang: string, defaultLang: string) {
  return (key: string, vars?: Record<string, string | number>) => {
    const v = strings[key];
    if (v == null) return key;
    return interpolate(tr(v, lang, defaultLang), vars);
  };
}

export function localeFor(languages: Language[], lang: string) {
  return languages.find((l) => l.code === lang)?.locale ?? lang;
}

export function toRoman(n: number) {
  const map: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  let rest = n;
  for (const [v, s] of map) {
    while (rest >= v) {
      out += s;
      rest -= v;
    }
  }
  return out;
}
