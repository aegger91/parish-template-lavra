import type { Metadata } from "next";
import "./fonts";
import "./globals.css";
import { site, uiStrings } from "@/lib/content";
import { makeT, tr } from "@/lib/i18n";
import { Cross } from "@/components/orthodox/Cross";
import { PaintedBand } from "@/components/orthodox/Ornaments";

export const metadata: Metadata = {
  title: "404",
  robots: { index: false },
  icons: { icon: "/icon.svg" },
};

export default function GlobalNotFound() {
  const def = site.languages.find((l) => l.code === site.defaultLanguage);
  return (
    <html lang={def?.locale ?? site.defaultLanguage} dir={def?.dir ?? "ltr"}>
      <body className="min-h-dvh">
        <PaintedBand variant="teeth" />
        <main className="container-lavra grid min-h-[80dvh] place-items-center py-16">
          <div className="fresco-card w-full max-w-2xl p-6 text-center sm:p-10">
            <div className="relative z-10 grid justify-items-center gap-5">
              <Cross variant="slavic" className="h-16 w-auto text-cinnabar" />
              <p className="label-sc text-[1.1rem] tracking-[0.2em] text-ochre-deep">404</p>
              <p className="font-heading text-2xl font-bold">{tr(site.parish.name, site.defaultLanguage, site.defaultLanguage)}</p>
              <ul className="grid w-full gap-4">
                {site.languages.map((l) => {
                  const t = makeT(uiStrings, l.code, site.defaultLanguage);
                  return (
                    <li key={l.code} lang={l.locale} dir={l.dir} className="rounded-md border border-[#dcc69c] bg-vellum/70 p-4">
                      <h1 className="text-[1.5rem]">{t("notFound.title")}</h1>
                      <p className="mt-1 text-ink-soft">{t("notFound.text")}</p>
                      <a href={`/${l.code}/`} className="btn-lavra btn-primary mt-3">
                        {t("notFound.home")}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
