"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { ChevronDown, MapPin, Menu, Phone, ShoppingBag } from "lucide-react";
import { isFeatureOn, site } from "@/lib/content";
import { pagePath, type NavNode } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useCart, useI18n } from "@/components/providers";
import { Logo } from "@/components/orthodox/Logo";
import { PaintedBand } from "@/components/orthodox/Ornaments";
import { Pictogram } from "@/components/orthodox/Pictogram";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileDrawer } from "./MobileDrawer";
import { useNav } from "./useNav";

function isActive(pathname: string, href: string, home: boolean) {
  if (home) return pathname === href;
  return pathname.startsWith(href);
}

const navLinkClass =
  "label-sc relative inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-[3px] px-2 py-2 text-[0.98rem] text-ink transition-colors hover:text-terracotta-deep data-[active=true]:text-cinnabar data-[active=true]:after:absolute data-[active=true]:after:inset-x-2 data-[active=true]:after:-bottom-0.5 data-[active=true]:after:h-[2px] data-[active=true]:after:bg-cinnabar";

function DesktopDropdown({ node, active }: { node: NavNode; active: boolean }) {
  const { lang, tr } = useI18n();
  const pathname = usePathname() || "";
  const items = [{ page: node.page, label: tr(node.page.overviewLabel ?? node.page.title) }, ...node.children.map((c) => ({ page: c.page, label: tr(c.page.navLabel ?? c.page.title) }))];
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger openOnHover delay={80} className={navLinkClass} data-active={active}>
        {tr(node.page.navLabel ?? node.page.title)}
        <ChevronDown className="size-3.5 opacity-70 transition-transform group-data-popup-open:rotate-180" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={10} className="w-auto min-w-64 rounded-md border border-[#d5bd8c] bg-vellum p-2 shadow-[var(--lavra-shadow-lift)] ring-0">
        {items.map((it, i) => {
          const href = pagePath(lang, it.page);
          const current = pathname === href;
          return (
            <MenuPrimitive.LinkItem
              key={it.page.id}
              render={<Link href={href} aria-current={current ? "page" : undefined} />}
              closeOnClick
              className={cn(
                "flex items-start gap-3 rounded-[3px] px-3 py-2.5 text-[0.98rem] outline-none data-highlighted:bg-parchment-deep/70",
                current && "text-cinnabar",
                i === 0 && "mb-1 border-b border-[#e2cfa6] pb-3",
              )}
            >
              <Pictogram name={it.page.icon ?? (i === 0 ? "church" : "cross")} className="mt-0.5 size-5 text-ochre-deep" />
              <span className="flex flex-col">
                <span className="font-heading font-bold leading-tight">{it.label}</span>
                {it.page.summary && <span className="mt-0.5 max-w-64 text-[0.85rem] leading-snug text-ink-soft">{tr(it.page.summary)}</span>}
              </span>
            </MenuPrimitive.LinkItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MoreMenu({ nodes }: { nodes: NavNode[] }) {
  const { lang, tr, t } = useI18n();
  if (!nodes.length) return null;
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger openOnHover delay={80} className={navLinkClass}>
        {t("nav.more")}
        <ChevronDown className="size-3.5 opacity-70" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={10} align="end" className="w-auto min-w-56 rounded-md border border-[#d5bd8c] bg-vellum p-2 shadow-[var(--lavra-shadow-lift)] ring-0">
        {nodes.flatMap((n) => [n, ...n.children]).map((n) => (
          <MenuPrimitive.LinkItem
            key={n.id}
            render={<Link href={pagePath(lang, n.page)} />}
            closeOnClick
            className={cn("block rounded-[3px] px-3 py-2 font-heading text-[0.98rem] font-bold outline-none data-highlighted:bg-parchment-deep/70", n.page.parentId && "ps-6 font-normal")}
          >
            {tr(n.page.navLabel ?? n.page.title)}
          </MenuPrimitive.LinkItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CartButton({ className }: { className?: string }) {
  const { count, ready } = useCart();
  const { lang, t } = useI18n();
  if (!isFeatureOn("store")) return null;
  return (
    <Link
      href={pagePath(lang, "cart")}
      className={cn("relative grid size-11 place-items-center rounded-full border border-[#cdb383] bg-vellum text-ink transition hover:border-ochre hover:shadow-[0_0_18px_-4px_rgb(var(--lavra-candle)/0.9)]", className)}
      aria-label={ready && count ? t("cart.openWithCount", { n: count }) : t("cart.open")}
    >
      <ShoppingBag className="size-5" aria-hidden="true" />
      {ready && count > 0 && (
        <span className="absolute -end-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-cinnabar px-1 text-[0.7rem] font-bold text-white ring-2 ring-vellum">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

export function Header() {
  const { lang, tr, t } = useI18n();
  const pathname = usePathname() || "";
  const { links, buttons, label, href } = useNav();
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setCondensed(window.scrollY > 48));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const secondary = links.filter((n) => n.page.navPriority === "secondary");
  const name = tr(site.parish.name);

  return (
    // The utility bar scrolls away through the negative sticky offset, so only the solid main bar stays pinned and nothing changes height.
    <header className="sticky top-0 z-40 md:top-[calc(var(--lavra-topbar-h)*-1)]" data-condensed={condensed}>
      <div className="hidden h-(--lavra-topbar-h) border-b border-[#d9c49a] bg-[#ead9b5] text-[0.85rem] text-ink-soft md:block">
        <div className="container-lavra flex h-full items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-5">
            <span className="flex min-w-0 items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{site.contact.addressLines.join(", ")}</span>
            </span>
            <a href={`tel:${site.contact.phone.replace(/[^\d+]/g, "")}`} className="hidden min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap hover:text-ink lg:flex">
              <Phone className="size-3.5" aria-hidden="true" />
              {site.contact.phone}
            </a>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            {site.sampleNotice && <span className="label-sc hidden whitespace-nowrap text-cinnabar lg:inline">{t("sample.badge")}</span>}
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div data-header-bar className={cn("header-solid relative transition-shadow duration-300", condensed && "shadow-[0_10px_24px_-18px_rgb(59_34_19/0.7)]")}>
        <div className="container-lavra grid h-(--lavra-header-h) grid-cols-[minmax(0,1fr)_auto] items-center gap-3 xl:grid-cols-[var(--lavra-header-logo-w)_minmax(0,1fr)_minmax(var(--lavra-header-actions-w),max-content)] xl:gap-4">
          <Link href={`/${lang}/`} className="flex min-w-0 items-center self-center rounded-sm" aria-label={t("nav.homeAria", { name })}>
            <Logo style={site.logo.style} image={site.logo.image} alt="" name={name} subtitle={tr(site.parish.jurisdiction)} showName={site.logo.showName} />
          </Link>

          <nav aria-label={t("nav.main")} className="hidden min-w-0 justify-self-center xl:block">
            <ul className="flex items-center">
              {links.map((n) => {
                const h = href(n);
                const active = isActive(pathname, h, !n.page.slug);
                if (n.page.navPriority === "secondary") return null;
                return (
                  <li key={n.id} className="shrink-0">
                    {n.children.length ? (
                      <DesktopDropdown node={n} active={active} />
                    ) : (
                      <Link href={h} className={navLinkClass} data-active={active} aria-current={pathname === h ? "page" : undefined}>
                        {label(n)}
                      </Link>
                    )}
                  </li>
                );
              })}
              {secondary.length > 0 && (
                <li className="shrink-0">
                  <MoreMenu nodes={secondary} />
                </li>
              )}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center justify-end gap-2">
            <CartButton />
            {buttons.map((n) => (
              <Link key={n.id} href={href(n)} className="btn-lavra btn-donate hidden whitespace-nowrap sm:inline-flex">
                <Pictogram name="candle" className="size-5" />
                {label(n)}
              </Link>
            ))}
            <MobileDrawer
              trigger={
                <span className="grid size-11 place-items-center rounded-full border border-[#cdb383] bg-vellum text-ink xl:hidden">
                  <Menu className="size-5" aria-hidden="true" />
                  <span className="sr-only">{t("nav.openMenu")}</span>
                </span>
              }
            />
          </div>
        </div>
        <PaintedBand variant="teeth" className="h-2" />
      </div>
    </header>
  );
}
