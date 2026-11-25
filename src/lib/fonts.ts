import { site } from "@/lib/content";
import { tr } from "@/lib/i18n";

/** Files copied to public/fonts by scripts/copy-fonts.mjs and declared in src/app/critical-fonts.css. */
const CRITICAL_FACES = ["alegreya-{s}-700", "alegreya-sc-{s}-500", "alegreya-sc-{s}-700", "pt-serif-{s}-400"];

type Subset = "latin" | "latin-ext" | "cyrillic";

/** The font subsets a language needs, read from its own text so new languages work without configuration. */
export function fontSubsetsFor(lang: string): Subset[] {
  const language = site.languages.find((l) => l.code === lang);
  const sample = `${language?.nativeName ?? ""} ${tr(site.parish.name, lang, site.defaultLanguage)} ${tr(site.parish.tagline, lang, site.defaultLanguage)}`;
  const subsets: Subset[] = ["latin"];
  if (/[\u0100-\u024F\u1E00-\u1EFF]/.test(sample)) subsets.push("latin-ext");
  if (/[\u0400-\u04FF]/.test(sample)) subsets.push("cyrillic");
  return subsets;
}

export function criticalFontUrls(lang: string): string[] {
  return fontSubsetsFor(lang).flatMap((s) => CRITICAL_FACES.map((f) => `/fonts/${f.replace("{s}", s)}-normal.woff2`));
}
