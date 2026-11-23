/**
 * Central image map — swap paths here to rebrand the template.
 * All files live under public/images/ as WebP. See CREDITS.md.
 */
export const images = {
  hero: {
    src: '/images/hero-monastery.webp',
    alt: {
      ro: 'Mănăstire ortodoxă românească la răsărit',
      en: 'Romanian Orthodox monastery at sunrise',
    },
  },
  parish: {
    src: '/images/parish-exterior.webp',
    alt: {
      ro: 'Fațada bisericii parohiale',
      en: 'Parish church exterior',
    },
  },
  interior: {
    src: '/images/church-interior.webp',
    alt: {
      ro: 'Interior de biserică ortodoxă',
      en: 'Orthodox church interior',
    },
  },
  gallery: [
    {
      src: '/images/gallery-01.webp',
      alt: { ro: 'Turnuri de lemn Maramureș', en: 'Maramureș wooden church spires' },
    },
    {
      src: '/images/gallery-02.webp',
      alt: { ro: 'Fresce moldovenești', en: 'Moldavian frescoes' },
    },
    {
      src: '/images/gallery-03.webp',
      alt: { ro: 'Arhitectură brâncovenească', en: 'Brâncovenesc architecture' },
    },
    {
      src: '/images/gallery-04.webp',
      alt: { ro: 'Curtea mănăstirii', en: 'Monastery courtyard' },
    },
  ],
  donate: {
    src: '/images/donate-band.webp',
    alt: {
      ro: 'Lumânări de ceară în biserică',
      en: 'Beeswax candles in church',
    },
  },
  contact: {
    src: '/images/contact-visit.webp',
    alt: {
      ro: 'Poarta bisericii',
      en: 'Church gate',
    },
  },
  livestream: {
    src: '/images/livestream-poster.webp',
    alt: {
      ro: 'Iconostas — imagine de fundal transmisie',
      en: 'Iconostasis — livestream poster',
    },
  },
  og: {
    src: '/images/og-default.webp',
    alt: { ro: 'Imagine socială', en: 'Social share image' },
  },
} as const;
