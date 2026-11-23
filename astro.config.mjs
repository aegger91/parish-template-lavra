// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  integrations: [react()],
  i18n: {
    defaultLocale: 'sr',
    locales: ['sr', 'lat', 'en'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  build: {
    format: 'directory',
  },
});
