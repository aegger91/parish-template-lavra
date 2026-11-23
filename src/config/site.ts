/**
 * Site-level configuration for the Romanian Orthodox parish template.
 * Swap parish details, calendar style, and feature flags here.
 */
export const siteConfig = {
  /** Parish display name (Romanian diacritics supported) */
  name: {
    ro: 'Parohia Sfântul Nicolae',
    en: 'Saint Nicholas Parish',
  },
  shortName: {
    ro: 'Sf. Nicolae',
    en: 'St. Nicholas',
  },
  tagline: {
    ro: 'Biserica Ortodoxă Română',
    en: 'Romanian Orthodox Church',
  },
  /** Julian ('old') or Revised Julian / civil ('new') calendar label on schedules */
  calendarStyle: 'new' as 'new' | 'old',
  address: {
    street: 'Strada Bisericii 12',
    city: 'Cluj-Napoca',
    region: 'Cluj',
    postal: '400000',
    country: {
      ro: 'România',
      en: 'Romania',
    },
  },
  phone: '(026)-412-3456',
  email: 'contact@parohie-exemplu.ro',
  mapQuery: 'Biserica Ortodoxa Cluj-Napoca',
  mapUrl: 'https://www.openstreetmap.org/search?query=Cluj-Napoca%20Biserica',
  livestreamUrl: 'https://www.youtube.com/embed/live_stream?channel=CHANNEL_ID',
  social: {
    facebook: '',
    youtube: '',
  },
  /** Optional page blocks — set false to hide */
  features: {
    aboutBlock: true,
    visitingBlock: true,
    donationProgress: false,
    /** Only meaningful when donationProgress is true and totals are auto-counted */
    donationAutoCount: false,
  },
  donation: {
    suggestedAmounts: [50, 100, 200, 500],
    currency: 'RON',
  },
  clergy: [
    {
      name: 'Pr. Ioan Popescu',
      role: { ro: 'Paroh', en: 'Parish Priest' },
      photo: '/images/clergy-placeholder.webp',
    },
    {
      name: 'Pr. Andrei Ionescu',
      role: { ro: 'Preot slujitor', en: 'Assistant Priest' },
      photo: '/images/clergy-placeholder.webp',
    },
  ],
} as const;

export type Locale = 'ro' | 'en';
export type CalendarStyle = typeof siteConfig.calendarStyle;
