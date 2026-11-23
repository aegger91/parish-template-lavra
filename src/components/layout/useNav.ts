"use client";

import { navTree, pagePath, type NavNode } from "@/lib/routes";
import { useI18n } from "@/components/providers";

export function useNav() {
  const { lang, tr } = useI18n();
  const tree = navTree();
  const label = (n: NavNode) => tr(n.page.navLabel ?? n.page.title);
  const href = (n: NavNode) => pagePath(lang, n.page);
  const links = tree.filter((n) => n.page.navStyle !== "button");
  const buttons = tree.filter((n) => n.page.navStyle === "button");
  return { tree, links, buttons, label, href };
}
