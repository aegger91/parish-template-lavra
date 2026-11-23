"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/lib/content";
import { pagePath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Cross } from "@/components/orthodox/Cross";
import { PaintedBand } from "@/components/orthodox/Ornaments";
import { Pictogram } from "@/components/orthodox/Pictogram";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useNav } from "./useNav";

export function MobileDrawer({ trigger }: { trigger: ReactNode }) {
  const { lang, tr, t, dir } = useI18n();
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);
  const { links, buttons, label, href } = useNav();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  const activeGroup = links.find((n) => n.children.length && pathname.startsWith(href(n)))?.id;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="rounded-full xl:hidden" aria-label={t("nav.openMenu")}>
        {trigger}
      </SheetTrigger>
      <SheetContent
        side={dir === "rtl" ? "left" : "right"}
        className="w-[min(24rem,92vw)] gap-0 overflow-y-auto border-[#c9ad78] bg-parchment p-0 data-[side=right]:sm:max-w-sm"
      >
        <PaintedBand variant="diamond" />
        <SheetHeader className="gap-1 px-5 pt-5 pb-3 text-start">
          <SheetTitle className="flex items-center gap-2 font-heading text-xl font-bold">
            <Cross className="h-6 text-cinnabar" />
            {t("nav.menu")}
          </SheetTitle>
          <SheetDescription className="text-ink-soft">{tr(site.parish.name)}</SheetDescription>
        </SheetHeader>

        <div className="px-5 pb-4">
          <LanguageSwitcher variant="drawer" />
        </div>

        <nav aria-label={t("nav.main")} className="border-y border-[#dcc69c] px-3 py-2">
          <Accordion defaultValue={activeGroup ? [activeGroup] : []}>
            {links.map((n) =>
              n.children.length ? (
                <AccordionItem key={n.id} value={n.id} className="border-[#e2cfa6]">
                  <AccordionTrigger className="px-2 py-3 font-heading text-lg font-bold text-ink hover:no-underline">
                    {label(n)}
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <ul className="ms-2 border-s-2 border-ochre/50 ps-2">
                      {[{ page: n.page, text: tr(n.page.overviewLabel ?? n.page.title) }, ...n.children.map((c) => ({ page: c.page, text: label(c) }))].map((it) => {
                        const h = pagePath(lang, it.page);
                        return (
                          <li key={it.page.id}>
                            <Link
                              href={h}
                              aria-current={pathname === h ? "page" : undefined}
                              className={cn("flex items-center gap-2.5 rounded px-2 py-2.5 text-base no-underline! hover:bg-parchment-deep/60", pathname === h && "text-cinnabar")}
                            >
                              <Pictogram name={it.page.icon ?? "church"} className="size-5 text-ochre-deep" />
                              {it.text}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <div key={n.id} className="border-b border-[#e2cfa6] last:border-0">
                  <Link
                    href={href(n)}
                    aria-current={pathname === href(n) ? "page" : undefined}
                    className={cn("block px-2 py-3 font-heading text-lg font-bold", pathname === href(n) && "text-cinnabar")}
                  >
                    {label(n)}
                  </Link>
                </div>
              ),
            )}
          </Accordion>
        </nav>

        <div className="flex flex-col gap-3 px-5 py-5">
          {buttons.map((n) => (
            <Link key={n.id} href={href(n)} className="btn-lavra btn-donate w-full">
              <Pictogram name="candle" className="size-5" />
              {label(n)}
            </Link>
          ))}
          <div className="mt-2 space-y-2 text-[0.95rem] text-ink-soft">
            <p className="flex items-start gap-2">
              <MapPin className="mt-1 size-4 shrink-0" aria-hidden="true" />
              <span>{site.contact.addressLines.join(", ")}</span>
            </p>
            <a className="flex items-center gap-2" href={`tel:${site.contact.phone.replace(/[^\d+]/g, "")}`}>
              <Phone className="size-4" aria-hidden="true" />
              {site.contact.phone}
            </a>
            <a className="flex items-center gap-2" href={`mailto:${site.contact.email}`}>
              <Mail className="size-4" aria-hidden="true" />
              {site.contact.email}
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
