# Serbian Orthodox Parish Website Template

Static, multilingual parish website in Serbian Orthodox visual style (Morava / Raška / Mileševa). Built with **Astro** for plain static export — no CMS, no Vercel-specific dependencies.

## Languages

| Code | Language |
|------|----------|
| `sr` | Serbian Cyrillic (default) |
| `lat` | Serbian Latin |
| `en` | English |

Language switcher lives in the main navigation.

## Quick start

```bash
npm install
npm run dev
```

Build static site to `dist/`:

```bash
npm run build
```

Preview the build:

```bash
npm run preview
```

## Customize

| What | Where |
|------|--------|
| Parish name, address, phone, calendar style, optional blocks | `src/config/site.ts` |
| Photos | `src/config/images.ts` + `public/images/` (see `CREDITS.md`) |
| Schedule / feasts | `src/config/schedule.ts` |
| News | `src/config/news.ts` |
| UI strings | `src/i18n/ui.ts` |

- `calendarStyle`: `'old'` (default) or `'new'` — shows Old Style dates on the schedule.
- `showAboutBlock` / `showVisitingBlock`: toggle home optional sections.
- `showDonationProgress`: off by default; enable only with auto-counting totals.

## Pages

Home, Our Parish, Services/Schedule, Slava & house blessings, Events/News, Livestream, Commemoration names (Помен / Pomen), Donate, Contact/Visit, 404.

## QA

```bash
npm run build && npm run qa
```

Headless checks every page in every language at 360 / 768 / 1280.

## License notes

Parish content is placeholder. Images: see `public/images/CREDITS.md`.
