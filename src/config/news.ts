export interface NewsItem {
  id: string;
  date: string;
  image: string;
  title: { sr: string; lat: string; en: string };
  summary: { sr: string; lat: string; en: string };
  body: { sr: string; lat: string; en: string };
}

export const newsItems: NewsItem[] = [
  {
    id: 'parish-council',
    date: '2026-11-15',
    image: '/images/lazarica.webp',
    title: {
      sr: 'Састанак парохијског одбора',
      lat: 'Sastanak parohijskog odbora',
      en: 'Parish council meeting',
    },
    summary: {
      sr: 'Одржан је редовни састанак парохијског одбора.',
      lat: 'Održan je redovni sastanak parohijskog odbora.',
      en: 'The regular parish council meeting was held.',
    },
    body: {
      sr: 'Парохијски одбор је размотрио текуће послове и најавио предстојеће активности. Записник је доступан у парохијској канцеларији.\n\nСледећи састанак биће одржан првог четвртка у месецу у парохијском дому.',
      lat: 'Parohijski odbor je razmotrio tekuće poslove i najavio predstojeće aktivnosti. Zapisnik je dostupan u parohijskoj kancelariji.\n\nSledeći sastanak biće održan prvog četvrtka u mesecu u parohijskom domu.',
      en: 'The parish council reviewed ongoing matters and announced upcoming activities. Minutes are available in the parish office.\n\nThe next meeting will be held on the first Thursday of the month in the parish hall.',
    },
  },
  {
    id: 'choir-rehearsal',
    date: '2026-11-10',
    image: '/images/church-interior.webp',
    title: {
      sr: 'Проба хора',
      lat: 'Proba hora',
      en: 'Choir rehearsal',
    },
    summary: {
      sr: 'Хор се спрема за празнична богослужења.',
      lat: 'Hor se sprema za praznična bogosluženja.',
      en: 'The choir is preparing for festal services.',
    },
    body: {
      sr: 'Пробе се одржавају суботом после вечерње. Нови чланови су добродошли; јавите се хоровођи.\n\nХор пева на недељној Литургији и на великим празницима.',
      lat: 'Probe se održavaju subotom posle večernje. Novi članovi su dobrodošli; javite se horovođi.\n\nHor peva na nedeljnoj Liturgiji i na velikim praznicima.',
      en: 'Rehearsals are held on Saturdays after Vespers. New members are welcome; speak with the choir director.\n\nThe choir sings at the Sunday Liturgy and on major feasts.',
    },
  },
  {
    id: 'building-update',
    date: '2026-11-01',
    image: '/images/zica.webp',
    title: {
      sr: 'Радови на храму',
      lat: 'Radovi na hramu',
      en: 'Church building update',
    },
    summary: {
      sr: 'Завршена је етапа одржавања спољашњости.',
      lat: 'Završena je etapa održavanja spoljašnjosti.',
      en: 'An exterior maintenance phase has been completed.',
    },
    body: {
      sr: 'Захваљујемо добровољцима и дародавцима. Следећа етапа биће најављена ускоро.\n\nРадови су обухватили кров, олуке и фасаду око главног улаза.',
      lat: 'Zahvaljujemo dobrovoljcima i darodavcima. Sledeća etapa biće najavljena uskoro.\n\nRadovi su obuhvatili krov, oluke i fasadu oko glavnog ulaza.',
      en: 'We thank volunteers and donors. The next phase will be announced soon.\n\nThe work covered the roof, the gutters and the facade around the main entrance.',
    },
  },
];
