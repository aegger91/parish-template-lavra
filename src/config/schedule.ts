export interface ServiceItem {
  id: string;
  title: { sr: string; lat: string; en: string };
  description: { sr: string; lat: string; en: string };
  /** ISO date of the civil (new-style) occurrence */
  date: string;
  /** Start time HH:MM local */
  start: string;
  /** End time HH:MM local */
  end: string;
  location: { sr: string; lat: string; en: string };
  /** Optional feast/old-style label key */
  feast?: { sr: string; lat: string; en: string };
  /** Julian (O.S.) month/day for display when calendarStyle is 'old' */
  oldStyleDate?: { month: number; day: number };
}

/** Placeholder week of services — replace with parish data */
export const weekServices: ServiceItem[] = [
  {
    id: 'vespers-sat',
    title: {
      sr: 'Вечерње',
      lat: 'Večernje',
      en: 'Vespers',
    },
    description: {
      sr: 'Суботње вечерње богослужење.',
      lat: 'Subotnje večernje bogosluženje.',
      en: 'Saturday evening service.',
    },
    date: '2026-11-28',
    start: '18:00',
    end: '19:00',
    location: {
      sr: 'Главни храм',
      lat: 'Glavni hram',
      en: 'Main church',
    },
  },
  {
    id: 'liturgy-sun',
    title: {
      sr: 'Света Литургија',
      lat: 'Sveta Liturgija',
      en: 'Divine Liturgy',
    },
    description: {
      sr: 'Недељна Света Литургија.',
      lat: 'Nedeljna Sveta Liturgija.',
      en: 'Sunday Divine Liturgy.',
    },
    date: '2026-11-29',
    start: '10:00',
    end: '12:00',
    location: {
      sr: 'Главни храм',
      lat: 'Glavni hram',
      en: 'Main church',
    },
  },
  {
    id: 'akathist',
    title: {
      sr: 'Акатист',
      lat: 'Akathist',
      en: 'Akathist',
    },
    description: {
      sr: 'Среда вече — акатист.',
      lat: 'Sreda veče — akathist.',
      en: 'Wednesday evening Akathist.',
    },
    date: '2026-12-02',
    start: '18:30',
    end: '19:15',
    location: {
      sr: 'Главни храм',
      lat: 'Glavni hram',
      en: 'Main church',
    },
  },
];

export const nextFeast: ServiceItem = {
  id: 'st-nicholas',
  title: {
    sr: 'Свети Николај Мирликијски',
    lat: 'Sveti Nikolaj Mirlikijski',
    en: 'Saint Nicholas of Myra',
  },
  description: {
    sr: 'Празнична Света Литургија.',
    lat: 'Praznična Sveta Liturgija.',
    en: 'Festal Divine Liturgy.',
  },
  date: '2026-12-19',
  start: '09:00',
  end: '11:30',
  location: {
    sr: 'Главни храм',
    lat: 'Glavni hram',
    en: 'Main church',
  },
  feast: {
    sr: 'Свети Никола',
    lat: 'Sveti Nikola',
    en: 'St. Nicholas',
  },
  oldStyleDate: { month: 12, day: 6 },
};

export const allServices: ServiceItem[] = [
  ...weekServices,
  nextFeast,
  {
    id: 'liturgy-weekday',
    title: {
      sr: 'Света Литургија',
      lat: 'Sveta Liturgija',
      en: 'Divine Liturgy',
    },
    description: {
      sr: 'Радна Света Литургија.',
      lat: 'Radna Sveta Liturgija.',
      en: 'Weekday Divine Liturgy.',
    },
    date: '2026-12-06',
    start: '09:00',
    end: '10:30',
    location: {
      sr: 'Главни храм',
      lat: 'Glavni hram',
      en: 'Main church',
    },
  },
  {
    id: 'vespers-feast-eve',
    title: {
      sr: 'Бденије',
      lat: 'Bdenije',
      en: 'Vigil',
    },
    description: {
      sr: 'Бденије уочи празника.',
      lat: 'Bdenije uoči praznika.',
      en: 'Vigil on the eve of the feast.',
    },
    date: '2026-12-18',
    start: '18:00',
    end: '20:30',
    location: {
      sr: 'Главни храм',
      lat: 'Glavni hram',
      en: 'Main church',
    },
    feast: {
      sr: 'Уочи Светог Николе',
      lat: 'Uoči Svetog Nikole',
      en: 'Eve of St. Nicholas',
    },
    oldStyleDate: { month: 12, day: 5 },
  },
];
