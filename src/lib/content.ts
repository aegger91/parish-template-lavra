import siteJson from "../../content/site.json";
import pagesJson from "../../content/pages.json";
import scheduleJson from "../../content/schedule.json";
import feastsJson from "../../content/feasts.json";
import clergyJson from "../../content/clergy.json";
import historyJson from "../../content/history.json";
import galleryJson from "../../content/gallery.json";
import newsJson from "../../content/news.json";
import sermonsJson from "../../content/sermons.json";
import productsJson from "../../content/products.json";
import serviceRequestsJson from "../../content/service-requests.json";
import eventsJson from "../../content/connect/events.json";
import needsJson from "../../content/connect/needs.json";
import uiJson from "../../content/ui.json";

import type {
  Category,
  ClergyMember,
  ConnectEvent,
  ConnectNeed,
  FeatureKey,
  FixedFeast,
  GalleryItem,
  HistoryItem,
  Localized,
  MovableFeast,
  NewsItem,
  Page,
  Product,
  Sermon,
  ServiceRequestType,
  SiteConfig,
  SpecialService,
  WeeklyService,
} from "./types";

export const site = siteJson as unknown as SiteConfig;
export const pages = (pagesJson.pages as unknown as Page[]).slice();
export const schedule = scheduleJson as unknown as { weekly: WeeklyService[]; special: SpecialService[] };
export const feasts = feastsJson as unknown as { fixed: FixedFeast[]; movable: MovableFeast[] };
export const clergy = (clergyJson.items as unknown as ClergyMember[]).slice().sort((a, b) => a.order - b.order);
export const history = historyJson.items as unknown as HistoryItem[];
export const gallery = galleryJson as unknown as { categories: Category[]; items: GalleryItem[] };
export const news = newsJson as unknown as { categories: Category[]; items: NewsItem[] };
export const sermons = (sermonsJson.items as unknown as Sermon[]).slice().sort((a, b) => b.date.localeCompare(a.date));
export const products = productsJson as unknown as { categories: Category[]; items: Product[] };
export const serviceRequests = (serviceRequestsJson.items as unknown as ServiceRequestType[]).slice().sort((a, b) => a.order - b.order);
export const connectEvents = eventsJson as unknown as { categories: Category[]; items: ConnectEvent[] };
export const connectNeeds = needsJson as unknown as { categories: (Category & { icon: string })[]; items: ConnectNeed[] };
export const uiStrings = uiJson as unknown as Record<string, Localized>;

export function isFeatureOn(feature?: FeatureKey) {
  if (!feature) return true;
  return site.features[feature] !== false;
}
