import type { ComponentType } from "react";
import { isFeatureOn } from "@/lib/content";
import { toRoman } from "@/lib/i18n";
import type { Page, Section } from "@/lib/types";
import { Hero } from "@/components/sections/Hero";
import { ChapterStory, DonateCta, ServicesWeek, Visit } from "@/components/sections/HomeSections";
import { ClergyCards, Faq, HistoryTimeline, IconCards, ModuleLinks, PageHeader, SubpageCards, type SectionProps } from "@/components/sections/ContentSections";
import { Schedule } from "@/components/sections/Schedule";
import { GalleryGrid, LatestNews, LatestSermons, Livestream, NewsList, SermonArchive } from "@/components/sections/MediaSections";
import { ContactPanel, DonationPicker } from "@/components/sections/GivingSections";
import { CartView, Checkout, StoreCatalog } from "@/components/modules/Store";
import { ServiceRequests } from "@/components/modules/ServiceRequests";
import { Zapiski } from "@/components/modules/Zapiski";
import { Events, InvolvedHighlights, Needs } from "@/components/modules/GetInvolved";

/** Every section type a page can list in content/pages.json. */
export const SECTION_COMPONENTS: Record<string, ComponentType<SectionProps>> = {
  "services-week": ServicesWeek,
  "chapter-story": ChapterStory,
  visit: Visit,
  "donate-cta": DonateCta,
  "page-header": PageHeader,
  "subpage-cards": SubpageCards,
  "module-links": ModuleLinks,
  "service-guide": IconCards,
  "giving-ways": IconCards,
  faq: Faq,
  "clergy-cards": ClergyCards,
  "history-timeline": HistoryTimeline,
  schedule: Schedule,
  "gallery-grid": GalleryGrid,
  "news-list": NewsList,
  "latest-news": LatestNews,
  "latest-sermons": LatestSermons,
  "sermon-archive": SermonArchive,
  livestream: Livestream,
  "donation-picker": DonationPicker,
  contact: ContactPanel,
  "store-catalog": StoreCatalog,
  cart: CartView,
  checkout: Checkout,
  "service-requests": ServiceRequests,
  zapiski: Zapiski,
  events: Events,
  needs: Needs,
  "involved-highlights": InvolvedHighlights,
};

export function activeSections(page: Page): Section[] {
  return (page.sections ?? []).filter((s) => s.enabled !== false && (!s.feature || isFeatureOn(s.feature)) && (s.type === "hero" || SECTION_COMPONENTS[s.type]));
}

export function SectionRenderer({ page }: { page: Page }) {
  const sections = activeSections(page);
  const hasHero = sections.some((s) => s.type === "hero");
  const chapterMap: Record<string, string> = {};
  let n = hasHero ? 2 : 1;
  for (const s of sections) if (s.chapter) chapterMap[s.id] = toRoman(n++);

  return (
    <>
      {sections.map((s) => {
        if (s.type === "hero") return <Hero key={s.id} props={s.props as never} chapterMap={chapterMap} />;
        const C = SECTION_COMPONENTS[s.type];
        return <C key={s.id} section={s} pageId={page.id} numeral={chapterMap[s.id]} />;
      })}
    </>
  );
}
