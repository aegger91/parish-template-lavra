/**
 * Swap parish photos here. Paths are under /images/.
 * See public/images/CREDITS.md for licenses.
 */
export const images = {
  hero: {
    src: '/images/hero-monastery.webp',
    alt: {
      sr: 'Манастир Грачаница',
      lat: 'Manastir Gračanica',
      en: 'Gračanica Monastery',
    },
  },
  parish: {
    src: '/images/parish-exterior.webp',
    alt: {
      sr: 'Фасада православног храма',
      lat: 'Fasada pravoslavnog hrama',
      en: 'Exterior of an Orthodox church',
    },
  },
  interior: {
    src: '/images/church-interior.webp',
    alt: {
      sr: 'Унутрашњост храма са иконостасом',
      lat: 'Unutrašnjost hrama sa ikonostasom',
      en: 'Church interior with iconostasis',
    },
  },
  gallery: [
    {
      src: '/images/gallery-1.webp',
      alt: {
        sr: 'Црква међу дрвећем',
        lat: 'Crkva među drvećem',
        en: 'Church among trees',
      },
    },
    {
      src: '/images/gallery-2.webp',
      alt: {
        sr: 'Камени портал храма',
        lat: 'Kameni portal hrama',
        en: 'Stone church portal',
      },
    },
    {
      src: '/images/gallery-3.webp',
      alt: {
        sr: 'Куполе у позлати сунца',
        lat: 'Kupole u pozlati sunca',
        en: 'Cupolas in golden light',
      },
    },
    {
      src: '/images/gallery-4.webp',
      alt: {
        sr: 'Манастирски двориште',
        lat: 'Manastirsko dvorište',
        en: 'Monastery courtyard',
      },
    },
  ],
  contact: {
    src: '/images/contact-visit.webp',
    alt: {
      sr: 'Улаз у црквену порту',
      lat: 'Ulaz u crkvenu portu',
      en: 'Entrance to the church grounds',
    },
  },
} as const;
