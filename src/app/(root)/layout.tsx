import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../fonts";
import "../globals.css";
import { site } from "@/lib/content";
import { tr } from "@/lib/i18n";

export const metadata: Metadata = {
  title: tr(site.parish.name, site.defaultLanguage, site.defaultLanguage),
  icons: { icon: "/icon.svg" },
};

export default function RootRedirectLayout({ children }: { children: ReactNode }) {
  const lang = site.languages.find((l) => l.code === site.defaultLanguage);
  return (
    <html lang={lang?.locale ?? site.defaultLanguage} dir={lang?.dir ?? "ltr"}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
