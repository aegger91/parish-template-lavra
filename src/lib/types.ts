export type Localized = string | Record<string, string>;

export interface Language {
  code: string;
  label: string;
  nativeName: string;
  shortLabel: string;
  locale: string;
  dir: "ltr" | "rtl";
}

export type LogoStyle = "circular-seal" | "kiot" | "square-image" | "wordmark";
/** Site calendar: old = Julian (Old Calendar), new = Revised Julian (New Calendar). */
export type CalendarStyle = "old" | "new";
export type FeatureKey = "livestream" | "sermons" | "store" | "serviceRequests" | "zapiski" | "getInvolved";

export interface LinkRef {
  page?: string;
  hash?: string;
  href?: string;
}

export interface ServiceTemplate {
  time: string;
  durationMinutes: number;
  kind: string;
  livestream: boolean;
  name: Localized;
}

export interface CommemorationType {
  id: string;
  appliesTo: ("health" | "repose")[];
  suggestedDonation: number;
  label: Localized;
  hint?: Localized;
}

export interface CandleOption {
  id: string;
  price: number;
  label: Localized;
}

export interface SiteConfig {
  id: string;
  template: { name: string; slug: string; version: string };
  sampleNotice: boolean;
  defaultLanguage: string;
  languages: Language[];
  parish: {
    name: Localized;
    shortName: Localized;
    tagline: Localized;
    jurisdiction: Localized;
    timeZone: string;
  };
  logo: { style: LogoStyle; image: string | null; alt: Localized; showName: boolean };
  calendar: {
    style: CalendarStyle;
    showChurchDate: boolean;
    showFasting: boolean;
    autoServiceRanks: FeastRank[];
    feastEveService: ServiceTemplate;
    feastDayService: ServiceTemplate;
  };
  features: Record<FeatureKey, boolean>;
  store: {
    currency: string;
    shipping: { flatRate: number; freeOver: number; countries: string[] };
    pickup: { label: Localized };
  };
  zapiski: {
    maxNamesPerSlip: number;
    maxSlips: number;
    commemorationTypes: CommemorationType[];
    candles: CandleOption[];
  };
  livestream: {
    status: "live" | "offline" | "auto";
    url: string;
    embedUrl: string | null;
    platformLabel: Localized;
  };
  orthodoxConnect: {
    appUrl: string;
    parishId: string;
    newsletter: { enabled: boolean; listId: string };
    calendarFeed: { enabled: boolean; url: string | null };
    deepLinks: Record<"createEvent" | "postNeed" | "event" | "need" | "signIn", string>;
  };
  contact: {
    addressLines: string[];
    email: string;
    phone: string;
    officeHours: Localized;
    parking: Localized;
    transit: Localized;
    map: { embedUrl: string | null; directionsUrl: string };
  };
  donate: {
    currency: string;
    provider: "none" | "stripe" | "authorize-net";
    minimumAmount: number;
    oneTimePresets: number[];
    monthlyPresets: number[];
    defaultFund: string;
    funds: { id: string; label: Localized }[];
  };
  socials: { id: string; network: string; url: string; label: string }[];
}

export interface Section {
  id: string;
  type: string;
  enabled: boolean;
  chapter?: boolean;
  feature?: FeatureKey;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>;
}

export interface Page {
  id: string;
  slug: string;
  parentId: string | null;
  order: number;
  showInNav: boolean;
  navLabel?: Localized;
  overviewLabel?: Localized;
  navPriority?: "primary" | "secondary";
  navStyle?: "link" | "button";
  feature?: FeatureKey;
  icon?: string;
  title: Localized;
  summary?: Localized;
  description?: Localized;
  sections: Section[];
}

export type FeastRank = "pascha" | "great" | "major" | "commemoration";

export interface FeastService extends ServiceTemplate {
  id: string;
  dayOffset: number;
}

export interface FixedFeast {
  id: string;
  month: number;
  day: number;
  rank: FeastRank;
  name: Localized;
  services?: FeastService[];
}

export interface MovableFeast {
  id: string;
  paschaOffset: number;
  rank: FeastRank;
  name: Localized;
  services?: FeastService[];
}

export interface WeeklyService extends ServiceTemplate {
  id: string;
  dayOfWeek: number;
  note?: Localized;
}

export interface SpecialService extends ServiceTemplate {
  id: string;
  date: string;
  note?: Localized;
}

export interface ClergyMember {
  id: string;
  order: number;
  monogram: string;
  photo: string | null;
  name: Localized;
  role: Localized;
  email: string;
  bio: Localized;
}

export interface HistoryItem {
  id: string;
  year: string;
  icon: string;
  title: Localized;
  text: Localized;
}

export interface Category {
  id: string;
  icon?: string;
  label: Localized;
}

export interface GalleryItem {
  id: string;
  category: string;
  image: string;
  title: Localized;
  alt: Localized;
}

export interface NewsItem {
  id: string;
  date: string;
  category: string;
  image: string;
  title: Localized;
  summary: Localized;
  body: Localized[];
}

export interface Sermon {
  id: string;
  date: string;
  type: "audio" | "video" | "text";
  speaker: string;
  reading: string;
  durationMinutes: number;
  media: { src: string | null; poster: string | null; embedUrl: string | null };
  title: Localized;
  summary: Localized;
  transcript: Localized[];
}

export interface ProductVariant {
  id: string;
  label: Localized;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  category: string;
  images: string[];
  featured: boolean;
  name: Localized;
  description: Localized;
  variants: ProductVariant[];
}

export interface ServiceRequestType {
  id: string;
  order: number;
  illustration: string;
  image: string | null;
  price: "free" | "donation";
  durationMinutes: number;
  action: { type: "form" | "link"; page?: string };
  title: Localized;
  text: Localized;
}

export interface ConnectEvent {
  id: string;
  title: Localized;
  date: string;
  time: string;
  endTime?: string;
  location: Localized;
  capacity: number;
  signups: number;
  organizer: Localized;
  category: string;
  description: Localized;
}

export interface NeedSlot {
  id: string;
  date: string;
  time: string;
  capacity: number;
  signups: number;
}

export interface ConnectNeed {
  id: string;
  title: Localized;
  category: string;
  location: Localized;
  organizer: Localized;
  description: Localized;
  slots: NeedSlot[];
}
