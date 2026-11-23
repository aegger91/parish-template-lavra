import { isFeatureOn, news, pages, products, site } from "./content";
import type { LinkRef, Page } from "./types";

export function visiblePages(): Page[] {
  const byId = new Map(pages.map((p) => [p.id, p]));
  const isVisible = (p: Page): boolean => {
    if (!isFeatureOn(p.feature)) return false;
    if (p.parentId) {
      const parent = byId.get(p.parentId);
      return parent ? isVisible(parent) : false;
    }
    return true;
  };
  return pages.filter(isVisible);
}

export function pageById(id: string): Page | undefined {
  return visiblePages().find((p) => p.id === id);
}

export function pageSegments(page: Page): string[] {
  const segs: string[] = [];
  let cur: Page | undefined = page;
  const all = new Map(pages.map((p) => [p.id, p]));
  while (cur) {
    if (cur.slug) segs.unshift(cur.slug);
    cur = cur.parentId ? all.get(cur.parentId) : undefined;
  }
  return segs;
}

export function pagePath(lang: string, pageOrId: Page | string, hash?: string, extra?: string[]) {
  const page = typeof pageOrId === "string" ? pageById(pageOrId) : pageOrId;
  if (!page) return `/${lang}/`;
  const segs = [...pageSegments(page), ...(extra ?? [])];
  const path = `/${lang}/${segs.length ? segs.join("/") + "/" : ""}`;
  return hash ? `${path}#${hash}` : path;
}

export function linkHref(lang: string, link?: LinkRef | null): string {
  if (!link) return `/${lang}/`;
  if (link.href) return link.href;
  if (link.page) return pagePath(lang, link.page, link.hash);
  return link.hash ? `#${link.hash}` : `/${lang}/`;
}

export function childPages(id: string, navOnly = true): Page[] {
  return visiblePages()
    .filter((p) => p.parentId === id && (!navOnly || p.showInNav))
    .sort((a, b) => a.order - b.order);
}

export interface NavNode {
  id: string;
  page: Page;
  children: NavNode[];
}

export function navTree(): NavNode[] {
  const build = (p: Page): NavNode => ({ id: p.id, page: p, children: childPages(p.id).map(build) });
  return visiblePages()
    .filter((p) => !p.parentId && p.showInNav)
    .sort((a, b) => a.order - b.order)
    .map(build);
}

export function breadcrumbs(page: Page): Page[] {
  const trail: Page[] = [];
  let cur: Page | undefined = page;
  while (cur) {
    trail.unshift(cur);
    cur = cur.parentId ? pageById(cur.parentId) : undefined;
  }
  return trail;
}

export function pageHasSection(page: Page, type: string) {
  return page.sections.some((s) => s.type === type && s.enabled && isFeatureOn(s.feature));
}

export type Resolution =
  | { kind: "page"; page: Page }
  | { kind: "news"; page: Page; id: string }
  | { kind: "product"; page: Page; id: string };

export function resolveSegments(segments: string[]): Resolution | null {
  const all = visiblePages();
  for (const page of all) {
    const segs = pageSegments(page);
    if (segs.length === segments.length && segs.every((s, i) => s === segments[i])) {
      return { kind: "page", page };
    }
  }
  if (segments.length > 0) {
    const parentSegs = segments.slice(0, -1);
    const last = segments[segments.length - 1];
    const parent = all.find((p) => {
      const s = pageSegments(p);
      return s.length === parentSegs.length && s.every((x, i) => x === parentSegs[i]);
    });
    if (parent && pageHasSection(parent, "news-list") && news.items.some((n) => n.id === last)) {
      return { kind: "news", page: parent, id: last };
    }
    if (parent && pageHasSection(parent, "store-catalog") && products.items.some((p) => p.id === last)) {
      return { kind: "product", page: parent, id: last };
    }
  }
  return null;
}

export function allStaticSegments(): string[][] {
  const out: string[][] = [];
  for (const page of visiblePages()) {
    const segs = pageSegments(page);
    out.push(segs);
    if (pageHasSection(page, "news-list")) news.items.forEach((n) => out.push([...segs, n.id]));
    if (pageHasSection(page, "store-catalog")) products.items.forEach((p) => out.push([...segs, p.id]));
  }
  return out;
}

export function firstPageWithSection(type: string): Page | undefined {
  return visiblePages().find((p) => pageHasSection(p, type));
}

export function languageCodes() {
  return site.languages.map((l) => l.code);
}
