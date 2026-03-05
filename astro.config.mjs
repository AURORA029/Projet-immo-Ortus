import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://aurora029.github.io',
  base: '/Projet-immo-Ortus',
  integrations: [sitemap()],
});