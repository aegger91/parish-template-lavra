// @ts-check
import { defineConfig } from 'astro/config';

// Static-exportable parish template — no adapter, no Vercel-specific deps.
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  i18n: {
    defaultLocale: 'ro',
    locales: ['ro', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
