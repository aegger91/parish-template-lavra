import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../fonts";
import "../globals.css";
import { site, uiStrings } from "@/lib/content";
import { makeT, tr } from "@/lib/i18n";
import { languageCodes } from "@/lib/routes";
import { CartProvider, I18nProvider } from "@/components/providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const dynamicParams = false;

export function generateStaticParams() {
  return languageCodes().map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const name = tr(site.parish.name, lang, site.defaultLanguage);
  return {
    title: { default: name, template: `%s | ${name}` },
    description: tr(site.parish.tagline, lang, site.defaultLanguage),
    icons: { icon: "/icon.svg" },
  };
}

export const viewport: Viewport = {
  themeColor: "#f2e6cc",
  width: "device-width",
  initialScale: 1,
};

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  const language = site.languages.find((l) => l.code === lang);
  if (!language) notFound();
  const t = makeT(uiStrings, lang, site.defaultLanguage);

  return (
    <html lang={language.locale ?? lang} dir={language.dir} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-[100] focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
          {t("nav.skip")}
        </a>
        <I18nProvider lang={lang}>
          <CartProvider>
            <Header />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
