import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { news, products, site } from "@/lib/content";
import { tr } from "@/lib/i18n";
import { allStaticSegments, languageCodes, resolveSegments } from "@/lib/routes";
import { SectionRenderer } from "@/components/SectionRenderer";
import { NewsArticle } from "@/components/sections/MediaSections";
import { ProductView } from "@/components/modules/Store";

export const dynamicParams = false;

export function generateStaticParams() {
  const segments = allStaticSegments();
  return languageCodes().flatMap((lang) => segments.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[[...slug]]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const r = resolveSegments(slug ?? []);
  if (!r) return {};
  const d = site.defaultLanguage;
  if (r.kind === "news") {
    const item = news.items.find((n) => n.id === r.id);
    return { title: tr(item?.title, lang, d), description: tr(item?.summary, lang, d) };
  }
  if (r.kind === "product") {
    const item = products.items.find((p) => p.id === r.id);
    return { title: tr(item?.name, lang, d), description: tr(item?.description, lang, d) };
  }
  if (r.page.id === "home") return {};
  return { title: tr(r.page.title, lang, d), description: tr(r.page.description ?? r.page.summary, lang, d) || undefined };
}

export default async function Page({ params }: PageProps<"/[lang]/[[...slug]]">) {
  const { slug } = await params;
  const r = resolveSegments(slug ?? []);
  if (!r) notFound();
  if (r.kind === "news") return <NewsArticle id={r.id} pageId={r.page.id} />;
  if (r.kind === "product") return <ProductView id={r.id} pageId={r.page.id} />;
  return <SectionRenderer page={r.page} />;
}
