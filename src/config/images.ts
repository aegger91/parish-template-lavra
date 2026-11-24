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
  fresco: {
    src: '/images/gallery-fresco.webp',
    alt: {
      sr: 'Бели анђео, фреска из Милешеве',
      lat: 'Beli anđeo, freska iz Mileševe',
      en: 'White Angel fresco from Mileševa',
    },
  },
  parish: {
    src: '/images/parish-exterior.webp',
    alt: {
      sr: 'Манастир Студеница, црква Светог Николе',
      lat: 'Manastir Studenica, crkva Svetog Nikole',
      en: 'Studenica Monastery, Church of St. Nicholas',
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
        sr: 'Манастирско двориште',
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
