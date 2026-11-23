# Lavra: Orthodox parish website template

`parish-template-lavra` is a sample parish website for the OrthodoxConnect website builder. It is one design with a warm, monastic Balkan feel: fresco colours, a painted church hero, chapter-style sections and a church wall calendar.

Everything shown is sample content for "St. Example Orthodox Church". The template ships with layout and short placeholder text only. Each parish adds its own welcome text, history, sermons and articles.

## Run it

```bash
npm install
npm run dev        # http://localhost:4317
npm run build      # checks content, then writes the static site to out/
npm run start      # serves out/ on http://localhost:4318
```

`out/` is plain HTML, CSS and JS. Each page has its own `index.html` and there is a `404.html`. Upload it to any static host.

## Where to edit

All content lives in `content/` as JSON. Each file has a JSON Schema in `content/schemas/`, so editors show hints and errors. Run `npm run validate` after editing to check the files and the links between them.

| File | What it holds |
| --- | --- |
| `site.json` | Parish name, languages, logo, calendar, module switches, contact, donations, socials |
| `pages.json` | Pages, menu order and nesting, and the sections on each page |
| `schedule.json`, `feasts.json` | Weekly and one-off services, fixed and movable feasts |
| `clergy.json`, `history.json`, `gallery.json`, `news.json`, `sermons.json` | Section data |
| `products.json`, `service-requests.json`, `connect/*.json` | Module data |
| `ui.json` | Fixed labels in every language |
| `src/styles/tokens.css` | Colours, font roles, spacing and shadows |

Every item has a stable `id`. Keep ids unchanged once a site is live.

### Sections

A page is an ordered list of sections in `pages.json`. To reorder sections, move them in the list. To hide one, set `"enabled": false`. Set `"chapter": true` to number a section (II, III...) and list it in the hero contents.

The home page includes an optional `welcome-text` block for a short About or Welcome text. Turn it off or replace the placeholder lines.

Section types: `hero`, `welcome-text`, `services-week`, `latest-news`, `latest-sermons`, `involved-highlights`, `donate-cta`, `page-header`, `subpage-cards`, `module-links`, `giving-ways`, `faq`, `clergy-cards`, `history-timeline`, `schedule`, `gallery-grid`, `news-list`, `sermon-archive`, `livestream`, `donation-picker`, `contact`, `store-catalog`, `cart`, `checkout`, `service-requests`, `zapiski`, `events`, `needs`.

### Modules

These switches in `site.json` → `features` turn each module on or off. Turning one off hides its pages, menu items and sections:

- `livestream`
- `sermons`
- `store`
- `serviceRequests`
- `zapiski`
- `getInvolved`

### Menu

The menu is built from `pages.json`:

- `parentId` nests a page under another one.
- `order` sorts sibling pages.
- `navPriority: "secondary"` moves an item into the More menu on narrower screens.
- `navStyle: "button"` shows an item as the Donate button.

### Languages

Add a language to `site.json` → `languages`. Then add that language code to any text you want translated. A missing translation falls back to `defaultLanguage`. The language switcher adapts to the number of languages, and `dir: "rtl"` is supported.

### Logo and calendar

- `logo.style` is one of `circular-seal`, `kiot`, `square-image` or `wordmark`. The demo uses `square-image`.
- `calendar.style` is `julian`, `revised-julian` or `gregorian`. Feasts in `feasts.json` use church dates, and the calendar moves them to civil dates.

## Connecting real services

All form and payment handlers are in `src/lib/handlers.ts`. Each one returns a sample reference for now, and each has a `TODO` for the real integration:

- payments for donations, store orders and commemorations go through `startPayment`, with Stripe or Authorize.net
- the contact form
- service requests
- zapiski delivery
- newsletter signup
- OrthodoxConnect sign-ups

OrthodoxConnect deep links are built from the patterns in `site.json` → `orthodoxConnect`.

## Art

All pictures are original drawings made by `npm run art` (`scripts/generate-art.mts`). See `SOURCES.md` for fonts and credits.
