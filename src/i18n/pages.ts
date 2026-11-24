import type { Locale } from './ui';
import { toLatin } from './translit';

/** One phrase in Cyrillic and English. Latin is derived from Cyrillic unless given. */
export interface Phrase {
  sr: string;
  en: string;
  lat?: string;
}

type Localized<T> = T extends Phrase
  ? string
  : T extends readonly (infer U)[]
    ? Localized<U>[]
    : T extends object
      ? { [K in keyof T]: Localized<T[K]> }
      : T;

function isPhrase(v: unknown): v is Phrase {
  return (
    typeof v === 'object' &&
    v !== null &&
    typeof (v as Phrase).sr === 'string' &&
    typeof (v as Phrase).en === 'string'
  );
}

export function localize<T>(value: T, locale: Locale): Localized<T> {
  if (isPhrase(value)) {
    if (locale === 'en') return value.en as Localized<T>;
    if (locale === 'lat') return (value.lat ?? toLatin(value.sr)) as Localized<T>;
    return value.sr as Localized<T>;
  }
  if (Array.isArray(value)) return value.map((v) => localize(v, locale)) as Localized<T>;
  if (typeof value === 'object' && value !== null) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = localize(v, locale);
    return out as Localized<T>;
  }
  return value as Localized<T>;
}

export const pages = {
  common: {
    crumbs: { sr: 'Путања', en: 'Breadcrumb' },
    more: { sr: 'Опширније', en: 'Learn more' },
    office: { sr: 'Парохијска канцеларија', en: 'Parish office' },
    address: { sr: 'Адреса', en: 'Address' },
    phone: { sr: 'Телефон', en: 'Phone' },
    email: { sr: 'Е-пошта', en: 'Email' },
    directions: { sr: 'Упутство за долазак', en: 'Get directions' },
    upcoming: { sr: 'Предстојећа богослужења', en: 'Upcoming services' },
    fullSchedule: { sr: 'Цео распоред', en: 'Full schedule' },
    photoPlaceholder: { sr: 'Место за фотографију', en: 'Photo placeholder' },
    samples: { sr: 'Имена и бројеви су примери.', en: 'Names and figures are samples.' },
  },

  parish: {
    lead: {
      sr: 'Заједница окупљена око храма Светог Саве.',
      en: 'A community gathered around the Church of Saint Sava.',
    },
    stats: [
      { value: '1952', label: { sr: 'Година оснивања', en: 'Year founded' } },
      { value: '180', label: { sr: 'Породица', en: 'Families' } },
      { value: '3', label: { sr: 'Богослужења седмично', en: 'Services each week' } },
      { value: '40+', label: { sr: 'Деце у српској школи', en: 'Children in Serbian school' } },
    ],
    aboutEyebrow: { sr: 'О парохији', en: 'About the parish' },
    aboutTitle: {
      sr: 'Дом за веру, језик и заједницу',
      en: 'A home for faith, language and community',
    },
    aboutText1: {
      sr: 'Храм служи српској православној заједници нашег града. Овде се одржавају редовна богослужења, крштења, венчања и славе.',
      en: 'The church serves the Serbian Orthodox community of our city. Regular services, baptisms, weddings and slavas take place here.',
    },
    aboutText2: {
      sr: 'Парохијски дом, хор и школа српског језика окупљају децу и одрасле током целе године.',
      en: 'The parish hall, the choir and the Serbian school bring children and adults together all year round.',
    },
    exploreEyebrow: { sr: 'Парохија', en: 'Our parish' },
    exploreTitle: { sr: 'Упознајте парохију', en: 'Explore the parish' },
    cards: {
      clergy: { sr: 'Парох, ђакон и парохијски одбор.', en: 'Parish priest, deacon and parish council.' },
      history: { sr: 'Најважнији датуми кроз године.', en: 'Key dates through the years.' },
      gallery: { sr: 'Храм, фреске и парохијски живот.', en: 'The church, frescoes and parish life.' },
      news: { sr: 'Обавештења и догађаји.', en: 'Announcements and events.' },
    },
    patronEyebrow: { sr: 'Слава парохије', en: 'Parish slava' },
    patronTitle: { sr: 'Свети Сава', en: 'Saint Sava' },
    patronText: {
      sr: 'Парохија прославља своју славу на дан Светог Саве, уз Литургију и славски колач.',
      en: 'The parish celebrates its slava on the feast of Saint Sava, with the Liturgy and the slava bread.',
    },
    visitTitle: { sr: 'Добродошли у храм', en: 'You are welcome at church' },
    visitText: {
      sr: 'Богослужења су отворена за све. Распоред и упутство за долазак су на једном месту.',
      en: 'Services are open to everyone. The schedule and directions are all in one place.',
    },
  },

  clergy: {
    title: { sr: 'Свештенство', en: 'Clergy' },
    lead: { sr: 'Свештенство, сарадници и парохијски одбор.', en: 'Clergy, staff and parish council.' },
    rectorText: {
      sr: 'Прима парохијане по договору, у канцеларији или у дому.',
      en: 'Meets parishioners by appointment, at the office or at home.',
    },
    request: { sr: 'Захтев за требу', en: 'Request a service' },
    teamEyebrow: { sr: 'Служење', en: 'Serving the parish' },
    teamTitle: { sr: 'Свештенство и сарадници', en: 'Clergy and staff' },
    councilEyebrow: { sr: 'Управа', en: 'Leadership' },
    councilTitle: { sr: 'Парохијски одбор', en: 'Parish council' },
    councilText: {
      sr: 'Одбор води бригу о храму, имовини и парохијским активностима.',
      en: 'The council looks after the church, its property and parish activities.',
    },
  },

  history: {
    title: { sr: 'Историја', en: 'History' },
    lead: { sr: 'Кратак преглед кроз године.', en: 'A short look through the years.' },
    introEyebrow: { sr: 'Летопис', en: 'Chronicle' },
    introTitle: { sr: 'Од прве Литургије до данас', en: 'From the first Liturgy to today' },
    introText: {
      sr: 'Датуми и догађаји на овој страници су примери које парохија замењује својом историјом.',
      en: 'The dates and events on this page are samples for the parish to replace with its own history.',
    },
    ctaTitle: { sr: 'Погледајте галерију', en: 'Visit the gallery' },
    ctaText: {
      sr: 'Храм, фреске и тренуци из парохијског живота.',
      en: 'The church, its frescoes and moments from parish life.',
    },
  },

  gallery: {
    title: { sr: 'Галерија', en: 'Gallery' },
    lead: { sr: 'Храм, фреске и парохијски живот.', en: 'The church, its frescoes and parish life.' },
    all: { sr: 'Све', en: 'All' },
    churches: { sr: 'Храмови', en: 'Churches' },
    frescoes: { sr: 'Фреске и иконе', en: 'Frescoes and icons' },
    note: {
      sr: 'Фотографије српских манастира служе као пример.',
      en: 'Photos of Serbian monasteries are used as samples.',
    },
    open: { sr: 'Отвори слику', en: 'Open image' },
    prev: { sr: 'Претходна', en: 'Previous' },
    next: { sr: 'Следећа', en: 'Next' },
  },

  schedule: {
    eyebrow: { sr: 'Богослужења', en: 'Services' },
    weeklyTitle: { sr: 'Редовна богослужења', en: 'Weekly services' },
    weekly: [
      { day: { sr: 'Субота', en: 'Saturday' }, name: { sr: 'Вечерње', en: 'Vespers' }, time: '18:00' },
      { day: { sr: 'Недеља', en: 'Sunday' }, name: { sr: 'Света Литургија', en: 'Divine Liturgy' }, time: '10:00' },
      { day: { sr: 'Среда', en: 'Wednesday' }, name: { sr: 'Акатист', en: 'Akathist' }, time: '18:30' },
    ],
    feastEyebrow: { sr: 'Следећи празник', en: 'Next feast' },
    helpEyebrow: { sr: 'Требе', en: 'Requests' },
    helpTitle: { sr: 'Помени, славе и пренос', en: 'Names, slavas and livestream' },
    help: {
      pomen: { sr: 'Пошаљите имена за помињање на Литургији.', en: 'Send names to be remembered at the Liturgy.' },
      slava: {
        sr: 'Слава, освећење куће или друга треба.',
        en: 'A slava visit, a house blessing or another service.',
      },
      livestream: { sr: 'Пратите богослужења уживо.', en: 'Follow services live.' },
    },
  },

  slava: {
    eyebrow: { sr: 'Требе', en: 'Requests' },
    featureEyebrow: { sr: 'Крсна слава', en: 'Family slava' },
    featureTitle: { sr: 'Слава у вашем дому', en: 'Slava in your home' },
    featureText: {
      sr: 'Пошаљите захтев за славу или освећење куће. Канцеларија ће потврдити дан и време.',
      en: 'Send a request for a slava or a house blessing. The office will confirm the day and time.',
    },
    featureNote: {
      sr: 'Захтеве примамо најмање седам дана унапред.',
      en: 'Please send requests at least seven days ahead.',
    },
    nextSlava: { sr: 'Следећа велика слава', en: 'Next major slava' },
    typesEyebrow: { sr: 'По договору', en: 'By arrangement' },
    typesTitle: { sr: 'Остале требе', en: 'Other services' },
    types: [
      { id: 'baptism', icon: 'drop', name: { sr: 'Крштење', en: 'Baptism' }, text: { sr: 'Термин се договара са парохом.', en: 'The date is arranged with the parish priest.' } },
      { id: 'wedding', icon: 'rings', name: { sr: 'Венчање', en: 'Wedding' }, text: { sr: 'Јавите се неколико месеци унапред.', en: 'Please get in touch a few months ahead.' } },
      { id: 'memorial', icon: 'candle', name: { sr: 'Парастос', en: 'Memorial service' }, text: { sr: 'У храму или на гробљу, по договору.', en: 'At church or at the cemetery, by arrangement.' } },
      { id: 'moleben', icon: 'book', name: { sr: 'Молебан', en: 'Moleben' }, text: { sr: 'У храму или у дому, по договору.', en: 'At church or at home, by arrangement.' } },
    ],
    formEyebrow: { sr: 'Образац', en: 'Request form' },
    formTitle: { sr: 'Пошаљите захтев', en: 'Send a request' },
    sideText: {
      sr: 'Захтев можете послати и телефоном или е-поштом.',
      en: 'You can also send a request by phone or email.',
    },
  },

  pomen: {
    eyebrow: { sr: 'За живе и упокојене', en: 'For the living and the departed' },
    formEyebrow: { sr: 'Образац', en: 'Form' },
    formTitle: { sr: 'Пошаљите имена', en: 'Send names' },
    kind: { sr: 'Помен', en: 'Commemorate' },
    sideTitle: { sr: 'На Литургији', en: 'At the Liturgy' },
    sideText: {
      sr: 'Имена примљена до суботе у подне читају се на недељној Литургији.',
      en: 'Names received by Saturday noon are read at the Sunday Liturgy.',
    },
    sideList: [
      { sr: 'Једно име у сваком реду', en: 'One name on each line' },
      { sr: 'Прилог је слободан, од 0', en: 'Any offering, starting from 0' },
      { sr: 'Имена можете донети и у храм', en: 'You can also bring names to church' },
    ],
    moreEyebrow: { sr: 'Парохија', en: 'Parish' },
    moreTitle: { sr: 'Требе и прилози', en: 'Requests and gifts' },
    more: {
      slava: { sr: 'Слава, освећење куће и друге требе.', en: 'Slavas, house blessings and other services.' },
      donate: { sr: 'Подржите живот парохије.', en: 'Support the life of the parish.' },
      contact: { sr: 'Питања за парохијску канцеларију.', en: 'Questions for the parish office.' },
    },
  },

  donate: {
    eyebrow: { sr: 'Прилог', en: 'Giving' },
    formEyebrow: { sr: 'Образац', en: 'Form' },
    formTitle: { sr: 'Ваш прилог', en: 'Your gift' },
    sampleNote: {
      sr: 'Пример обрасца. Парохија повезује свој начин плаћања.',
      en: 'Sample form. The parish connects its own payment provider.',
    },
    sideTitle: { sr: 'Где иде ваш прилог', en: 'Where your gift goes' },
    uses: [
      { icon: 'home', title: { sr: 'Одржавање храма', en: 'Church upkeep' }, text: { sr: 'Грејање, осветљење и поправке.', en: 'Heating, lighting and repairs.' } },
      { icon: 'music', title: { sr: 'Хор и појање', en: 'Choir and chanting' }, text: { sr: 'Ноте, пробе и празници.', en: 'Music, rehearsals and feasts.' } },
      { icon: 'heart', title: { sr: 'Помоћ породицама', en: 'Help for families' }, text: { sr: 'Подршка члановима у потреби.', en: 'Support for members in need.' } },
      { icon: 'book', title: { sr: 'Српска школа', en: 'Serbian school' }, text: { sr: 'Књиге и часови за децу.', en: 'Books and classes for children.' } },
      { icon: 'arch', title: { sr: 'Иконе и фреске', en: 'Icons and frescoes' }, text: { sr: 'Чување и обнова живописа.', en: 'Care and restoration of the frescoes.' } },
    ],
    otherEyebrow: { sr: 'Још начина', en: 'More ways' },
    otherTitle: { sr: 'Други начини давања', en: 'Other ways to give' },
    other: [
      { icon: 'door', title: { sr: 'У храму', en: 'In person' }, text: { sr: 'Прилог можете оставити у храму после богослужења.', en: 'Leave a gift at church after any service.' } },
      { icon: 'mail', title: { sr: 'Поштом', en: 'By mail' }, text: { sr: 'Чек на име парохије, на адресу храма.', en: 'A cheque made out to the parish, sent to the church address.' } },
      { icon: 'bank', title: { sr: 'Банковни пренос', en: 'Bank transfer' }, text: { sr: 'Подаци за уплату у парохијској канцеларији.', en: 'Ask the parish office for bank details.' } },
    ],
  },

  contact: {
    eyebrow: { sr: 'Добродошли', en: 'Welcome' },
    formEyebrow: { sr: 'Пишите нам', en: 'Write to us' },
    mapEyebrow: { sr: 'Долазак', en: 'Getting here' },
    mapTitle: { sr: 'Како до храма', en: 'How to find us' },
    mapText: {
      sr: 'Паркинг је доступан испред храма и у суседној улици.',
      en: 'Parking is available in front of the church and on the next street.',
    },
    bandTitle: { sr: 'Дођите на богослужење', en: 'Join us for a service' },
    bandText: {
      sr: 'Погледајте распоред и додајте богослужење у свој календар.',
      en: 'See the schedule and add a service to your calendar.',
    },
  },

  events: {
    eyebrow: { sr: 'Парохијски живот', en: 'Parish life' },
    latest: { sr: 'Најновије', en: 'Latest' },
    moreTitle: { sr: 'Остале вести', en: 'More news' },
    back: { sr: 'Назад на вести', en: 'Back to news' },
    published: { sr: 'Објављено', en: 'Published' },
    questions: { sr: 'Имате питање?', en: 'Have a question?' },
    questionsText: {
      sr: 'Јавите се парохијској канцеларији.',
      en: 'Get in touch with the parish office.',
    },
  },

  livestream: {
    eyebrow: { sr: 'Уживо', en: 'Live' },
    nextTitle: { sr: 'Следећи преноси', en: 'Next broadcasts' },
    offlineTitle: { sr: 'Пренос тренутно није активан', en: 'The stream is not live right now' },
    offlineText: {
      sr: 'Пренос почиње са богослужењем. Погледајте распоред.',
      en: 'The stream starts with the service. Check the schedule.',
    },
    helpEyebrow: { sr: 'Парохија', en: 'Parish' },
    helpTitle: { sr: 'Укључите се', en: 'Take part' },
  },

  notFound: {
    linksTitle: { sr: 'Можда тражите', en: 'You may be looking for' },
  },
} as const satisfies Record<string, unknown>;
