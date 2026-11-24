/**
 * Sample parish content for the clergy, history and gallery pages.
 * Replace names, dates and photos with the parish's own.
 */
import type { Phrase } from '../i18n/pages';

export const rectorContact = {
  email: 'paroh@example-parish.org',
  phone: '(555)-123-4568',
};

export const staff: Array<{ name: Phrase; role: Phrase; bio: Phrase }> = [
  {
    name: { sr: 'Марија Илић', en: 'Marija Ilić' },
    role: { sr: 'Хоровођа', en: 'Choir director' },
    bio: {
      sr: 'Води хор на недељним и празничним богослужењима.',
      en: 'Leads the choir at Sunday and feast-day services.',
    },
  },
  {
    name: { sr: 'Јелена Марковић', en: 'Jelena Marković' },
    role: { sr: 'Секретар парохије', en: 'Parish secretary' },
    bio: {
      sr: 'Води парохијску канцеларију и евиденцију.',
      en: 'Runs the parish office and its records.',
    },
  },
  {
    name: { sr: 'Ана Стојановић', en: 'Ana Stojanović' },
    role: { sr: 'Учитељица српске школе', en: 'Serbian school teacher' },
    bio: {
      sr: 'Држи часове за децу суботом пре подне.',
      en: 'Teaches the children’s classes on Saturday mornings.',
    },
  },
];

export const council: Array<{ name: Phrase; role: Phrase }> = [
  { role: { sr: 'Председник', en: 'President' }, name: { sr: 'Милан Петровић', en: 'Milan Petrović' } },
  { role: { sr: 'Потпредседник', en: 'Vice president' }, name: { sr: 'Душан Лукић', en: 'Dušan Lukić' } },
  { role: { sr: 'Благајник', en: 'Treasurer' }, name: { sr: 'Драган Николић', en: 'Dragan Nikolić' } },
  { role: { sr: 'Секретар', en: 'Secretary' }, name: { sr: 'Ненад Ђорђевић', en: 'Nenad Đorđević' } },
];

export const milestones: Array<{
  year: Phrase | string;
  title: Phrase;
  text: Phrase;
  image?: { src: string; caption: Phrase; position?: string };
}> = [
  {
    year: '1952',
    title: { sr: 'Прва Литургија', en: 'First Liturgy' },
    text: {
      sr: 'Породице се окупљају на првој Литургији у изнајмљеној сали.',
      en: 'Families gather for the first Liturgy in a rented hall.',
    },
  },
  {
    year: '1961',
    title: { sr: 'Камен темељац', en: 'Cornerstone laid' },
    text: {
      sr: 'Освећен је камен темељац новог храма.',
      en: 'The cornerstone of the new church is blessed.',
    },
    image: {
      src: '/images/lazarica.webp',
      caption: { sr: 'Лазарица, Крушевац', en: 'Lazarica, Kruševac' },
      position: 'center 40%',
    },
  },
  {
    year: '1968',
    title: { sr: 'Освећење храма', en: 'Church consecrated' },
    text: {
      sr: 'Храм је освећен на дан Светог Саве.',
      en: 'The church is consecrated on the feast of Saint Sava.',
    },
  },
  {
    year: '1985',
    title: { sr: 'Иконостас и фреске', en: 'Iconostasis and frescoes' },
    text: {
      sr: 'Постављен је иконостас и започето живописање храма.',
      en: 'The iconostasis is installed and fresco painting begins.',
    },
    image: {
      src: '/images/fresco-gracanica.webp',
      caption: { sr: 'Фреске, Грачаница', en: 'Frescoes, Gračanica' },
      position: 'center 30%',
    },
  },
  {
    year: '2004',
    title: { sr: 'Парохијски дом', en: 'Parish hall' },
    text: {
      sr: 'Отворен је парохијски дом са учионицом за српску школу.',
      en: 'A parish hall opens, with a classroom for the Serbian school.',
    },
  },
  {
    year: { sr: 'Данас', en: 'Today' },
    title: { sr: 'Жива заједница', en: 'A living community' },
    text: {
      sr: 'Редовна богослужења, хор и школа за децу.',
      en: 'Regular services, a choir and a school for children.',
    },
    image: {
      src: '/images/ljubostinja.webp',
      caption: { sr: 'Љубостиња', en: 'Ljubostinja' },
      position: 'center 45%',
    },
  },
];

export type GalleryCategory = 'churches' | 'frescoes';

export const galleryItems: Array<{
  src: string;
  width: number;
  height: number;
  category: GalleryCategory;
  caption: Phrase;
}> = [
  { src: '/images/lazarica.webp', width: 1920, height: 1281, category: 'churches', caption: { sr: 'Лазарица, Крушевац', en: 'Lazarica, Kruševac' } },
  { src: '/images/fresco-studenica-saints.webp', width: 1600, height: 1200, category: 'frescoes', caption: { sr: 'Свети Сава и Свети Симеон, Студеница', en: 'Saint Sava and Saint Simeon, Studenica' } },
  { src: '/images/decani.webp', width: 1920, height: 1440, category: 'churches', caption: { sr: 'Високи Дечани', en: 'Visoki Dečani' } },
  { src: '/images/fresco-mileseva-sava.webp', width: 1200, height: 1600, category: 'frescoes', caption: { sr: 'Свети Сава, Милешева', en: 'Saint Sava, Mileševa' } },
  { src: '/images/gallery-4.webp', width: 1280, height: 846, category: 'churches', caption: { sr: 'Грачаница', en: 'Gračanica' } },
  { src: '/images/manasija-domes.webp', width: 1600, height: 1008, category: 'churches', caption: { sr: 'Манасија', en: 'Manasija' } },
  { src: '/images/gallery-fresco.webp', width: 1200, height: 1731, category: 'frescoes', caption: { sr: 'Бели анђео, Милешева', en: 'The White Angel, Mileševa' } },
  { src: '/images/ljubostinja.webp', width: 1920, height: 1554, category: 'churches', caption: { sr: 'Љубостиња', en: 'Ljubostinja' } },
  { src: '/images/fresco-gracanica.webp', width: 1600, height: 1067, category: 'frescoes', caption: { sr: 'Фреске јужног брода, Грачаница', en: 'South aisle frescoes, Gračanica' } },
  { src: '/images/parish-exterior.webp', width: 1800, height: 1350, category: 'churches', caption: { sr: 'Црква Светог Николе, Студеница', en: 'Church of Saint Nicholas, Studenica' } },
  { src: '/images/fresco-studenica-forerunner.webp', width: 1200, height: 1800, category: 'frescoes', caption: { sr: 'Живопис, Студеница', en: 'Wall paintings, Studenica' } },
  { src: '/images/gallery-2.webp', width: 1920, height: 1440, category: 'churches', caption: { sr: 'Раваница', en: 'Ravanica' } },
  { src: '/images/church-interior.webp', width: 646, height: 865, category: 'frescoes', caption: { sr: 'Иконостас', en: 'Iconostasis' } },
  { src: '/images/zica.webp', width: 1920, height: 1252, category: 'churches', caption: { sr: 'Жича', en: 'Žiča' } },
  { src: '/images/gallery-1.webp', width: 1024, height: 768, category: 'churches', caption: { sr: 'Манасија, Деспотовац', en: 'Manasija, Despotovac' } },
  { src: '/images/contact-visit.webp', width: 1200, height: 799, category: 'churches', caption: { sr: 'Црква манастира Љубостиње', en: 'Church of Ljubostinja Monastery' } },
];
