export interface NewsItem {
  id: string;
  date: string;
  title: { sr: string; lat: string; en: string };
  summary: { sr: string; lat: string; en: string };
  body: { sr: string; lat: string; en: string };
}

export const newsItems: NewsItem[] = [
  {
    id: 'parish-council',
    date: '2026-11-15',
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
      sr: 'Парохијски одбор је размотрио текуће послове и најавио предстојеће активности. Записник је доступан у парохијској канцеларији.',
      lat: 'Parohijski odbor je razmotrio tekuće poslove i najavio predstojeće aktivnosti. Zapisnik je dostupan u parohijskoj kancelariji.',
      en: 'The parish council reviewed ongoing matters and announced upcoming activities. Minutes are available in the parish office.',
    },
  },
  {
    id: 'choir-rehearsal',
    date: '2026-11-10',
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
      sr: 'Пробе се одржавају суботом после вечерње. Нови чланови су добродошли — јавите се хоровођи.',
      lat: 'Probe se održavaju subotom posle večernje. Novi članovi su dobrodošli — javite se horovođi.',
      en: 'Rehearsals are held on Saturdays after Vespers. New members are welcome — speak with the choir director.',
    },
  },
  {
    id: 'building-update',
    date: '2026-11-01',
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
      sr: 'Захваљујемо добровољцима и дародавцима. Следећа етапа биће најављена ускоро.',
      lat: 'Zahvaljujemo dobrovoljcima i darodavcima. Sledeća etapa biće najavljena uskoro.',
      en: 'We thank volunteers and donors. The next phase will be announced soon.',
    },
  },
];
