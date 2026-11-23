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
  "label-sc relative inline-flex items-center gap-1 whitespace-nowrap rounded-[3px] px-2.5 py-2 text-[1.02rem] text-ink transition-colors hover:text-terracotta-deep data-[active=true]:text-cinnabar data-[active=true]:after:absolute data-[active=true]:after:inset-x-2.5 data-[active=true]:after:-bottom-0.5 data-[active=true]:after:h-[2px] data-[active=true]:after:bg-cinnabar";

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
      <DropdownMenuTrigger openOnHover delay={80} className={cn(navLinkClass, "min-[1600px]:hidden")}>
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
      className={cn("relative grid size-11 place-items-center rounded-full border border-[#cdb383] bg-vellum/80 text-ink transition hover:border-ochre hover:shadow-[0_0_18px_-4px_rgb(var(--lavra-candle)/0.9)]", className)}
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
    <header className="sticky top-0 z-40" data-condensed={condensed}>
      <div
        className={cn(
          "hidden border-b border-[#d9c49a] bg-parchment-deep/70 text-[0.85rem] text-ink-soft transition-[opacity,visibility] duration-300 md:block md:h-10",
          condensed ? "pointer-events-none border-b-0 opacity-0 invisible" : "opacity-100 visible",
        )}
      >
        <div className={cn("container-lavra flex h-10 items-center justify-between gap-4", condensed && "hidden")}>
          <div className="flex min-w-0 items-center gap-5">
            <span className="flex min-w-0 items-center gap-1.5 truncate">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{site.contact.addressLines.join(", ")}</span>
            </span>
            <a href={`tel:${site.contact.phone.replace(/[^\d+]/g, "")}`} className="hidden items-center gap-1.5 hover:text-ink lg:flex">
              <Phone className="size-3.5" aria-hidden="true" />
              {site.contact.phone}
            </a>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            {site.sampleNotice && <span className="label-sc hidden text-cinnabar lg:inline">{t("sample.badge")}</span>}
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      <div
        className={cn(
          "border-b border-transparent bg-parchment/95 backdrop-blur-md transition-[box-shadow,background-color] duration-300 supports-[backdrop-filter]:bg-parchment/85",
          condensed && "shadow-[0_10px_24px_-18px_rgb(59_34_19/0.7)]",
        )}
      >
        <div className="container-lavra flex h-[5.5rem] items-center justify-between gap-3">
          <Link href={`/${lang}/`} className="flex min-w-0 shrink items-center rounded-sm xl:min-w-[13rem] xl:max-w-[19rem]" aria-label={t("nav.homeAria", { name })}>
            <Logo
              style={site.logo.style}
              image={site.logo.image}
              alt=""
              name={name}
              subtitle={tr(site.parish.jurisdiction)}
              showName={site.logo.showName}
              compact={condensed}
            />
          </Link>

          <nav aria-label={t("nav.main")} className="hidden xl:block">
            <ul className="flex items-center gap-0.5">
              {links.map((n) => {
                const h = href(n);
                const active = isActive(pathname, h, !n.page.slug);
                const isSecondary = n.page.navPriority === "secondary";
                return (
                  <li key={n.id} className={cn(isSecondary && "hidden min-[1600px]:block")}>
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
                <li className="min-[1600px]:hidden">
                  <MoreMenu nodes={secondary} />
                </li>
              )}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <CartButton />
            {buttons.map((n) => (
              <Link key={n.id} href={href(n)} className="btn-lavra btn-donate hidden sm:inline-flex">
                <Pictogram name="candle" className="size-5" />
                {label(n)}
              </Link>
            ))}
            <MobileDrawer
              trigger={
                <span className="grid size-11 place-items-center rounded-full border border-[#cdb383] bg-vellum/80 text-ink xl:hidden">
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
