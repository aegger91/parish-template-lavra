"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { ChevronDown, Languages } from "lucide-react";
import { site } from "@/lib/content";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function useLanguageHref() {
  const pathname = usePathname() || "/";
  return (code: string) => {
    const rest = pathname.replace(/^\/[^/]+/, "");
    return `/${code}${rest || "/"}`;
  };
}

/** Adapts to the number of configured languages: hidden for one, inline for up to four, a menu beyond that. */
export function LanguageSwitcher({ variant = "bar", className }: { variant?: "bar" | "drawer"; className?: string }) {
  const { lang, t } = useI18n();
  const hrefFor = useLanguageHref();
  const langs = site.languages;
  if (langs.length <= 1) return null;

  if (variant === "drawer") {
    return (
      <nav aria-label={t("lang.switch")} className={cn("flex flex-wrap gap-2", className)}>
        {langs.map((l) => (
          <Link
            key={l.code}
            href={hrefFor(l.code)}
            hrefLang={l.code}
            lang={l.code}
            aria-current={l.code === lang ? "true" : undefined}
            className={cn(
              "label-sc rounded-full border px-3 py-1.5 text-sm transition-colors",
              l.code === lang ? "border-lapis bg-lapis text-[#fff8ea]" : "border-[#c9ad78] bg-vellum hover:border-ochre",
            )}
          >
            {l.nativeName}
          </Link>
        ))}
      </nav>
    );
  }

  if (langs.length <= 4) {
    return (
      <nav aria-label={t("lang.switch")} className={cn("flex items-center", className)}>
        <Languages className="me-1.5 size-4 text-ink-soft" aria-hidden="true" />
        <ul className="flex items-center rounded-full border border-[#cdb383] bg-vellum/80 p-0.5">
          {langs.map((l) => (
            <li key={l.code}>
              <Link
                href={hrefFor(l.code)}
                hrefLang={l.code}
                lang={l.code}
                title={l.nativeName}
                aria-label={l.nativeName}
                aria-current={l.code === lang ? "true" : undefined}
                className={cn(
                  "label-sc block min-w-9 rounded-full px-2 py-0.5 text-center text-[0.8rem] transition-colors",
                  l.code === lang ? "bg-lapis text-[#fff8ea]" : "text-ink-soft hover:bg-parchment-deep hover:text-ink",
                )}
              >
                {l.shortLabel}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  const current = langs.find((l) => l.code === lang);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn("label-sc flex items-center gap-1.5 rounded-full border border-[#cdb383] bg-vellum px-3 py-1 text-sm", className)} aria-label={t("lang.switch")}>
        <Languages className="size-4" aria-hidden="true" />
        {current?.nativeName}
        <ChevronDown className="size-3.5" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-44 bg-vellum">
        {langs.map((l) => (
          <MenuPrimitive.LinkItem
            key={l.code}
            render={<Link href={hrefFor(l.code)} hrefLang={l.code} lang={l.code} />}
            className="block rounded px-2 py-1.5 text-sm data-highlighted:bg-accent"
          >
            {l.nativeName}
          </MenuPrimitive.LinkItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
