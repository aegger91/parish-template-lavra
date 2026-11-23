export type CalendarStyle = 'new' | 'old';

export interface SiteConfig {
  parishName: {
    sr: string;
    lat: string;
    en: string;
  };
  tagline: {
    sr: string;
    lat: string;
    en: string;
  };
  address: {
    street: string;
    city: string;
    region: string;
    postal: string;
    country: string;
  };
  phone: string;
  email: string;
  mapQuery: string;
  mapEmbedUrl: string;
  livestreamUrl: string;
  calendarStyle: CalendarStyle;
  showAboutBlock: boolean;
  showVisitingBlock: boolean;
  donationSuggested: number[];
  showDonationProgress: boolean;
  clergy: Array<{
    name: { sr: string; lat: string; en: string };
    title: { sr: string; lat: string; en: string };
    bio: { sr: string; lat: string; en: string };
  }>;
}

export const siteConfig: SiteConfig = {
  parishName: {
    sr: 'Храм Светог Саве',
    lat: 'Hram Svetog Save',
    en: 'Church of Saint Sava',
  },
  tagline: {
    sr: 'Српска православна парохија',
    lat: 'Srpska pravoslavna parohija',
    en: 'Serbian Orthodox Parish',
  },
  address: {
    street: '123 Parish Road',
    city: 'Example City',
    region: 'State',
    postal: '00000',
    country: 'USA',
  },
  phone: '(555)-123-4567',
  email: 'office@example-parish.org',
  mapQuery: '123 Parish Road, Example City',
  mapEmbedUrl:
    'https://maps.google.com/maps?q=Belgrade%20Serbia&t=&z=13&ie=UTF8&iwloc=&output=embed',
  livestreamUrl: 'https://www.youtube.com/embed/live_stream?channel=PLACEHOLDER',
  calendarStyle: 'old',
  showAboutBlock: true,
  showVisitingBlock: true,
  donationSuggested: [25, 50, 100, 250],
  showDonationProgress: false,
  clergy: [
    {
      name: {
        sr: 'протојереј Николај Петровић',
        lat: 'protojerej Nikolaj Petrović',
        en: 'Protopresbyter Nikolaj Petrović',
      },
      title: {
        sr: 'Парох',
        lat: 'Paroh',
        en: 'Parish Priest',
      },
      bio: {
        sr: 'Служи у парохији и брине о богослужбеном животу заједнице.',
        lat: 'Služi u parohiji i brine o bogoslužbenom životu zajednice.',
        en: 'Serves the parish and oversees the liturgical life of the community.',
      },
    },
    {
      name: {
        sr: 'ђакон Стефан Јовановић',
        lat: 'đakon Stefan Jovanović',
        en: 'Deacon Stefan Jovanović',
      },
      title: {
        sr: 'Ђакон',
        lat: 'Đakon',
        en: 'Deacon',
      },
      bio: {
        sr: 'Помаже на богослужењима и у парохијским активностима.',
        lat: 'Pomaže na bogosluženjima i u parohijskim aktivnostima.',
        en: 'Assists at services and in parish activities.',
      },
    },
  ],
};
