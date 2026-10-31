import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://subodh-cv.vidyanexa.com',
  integrations: [sitemap({ filter: (page) => !page.includes('/404') && !page.includes('/og/'), changefreq: 'monthly', lastmod: new Date() })],
  server: { port: 4321 },
  trailingSlash: 'never',
  build: { inlineStylesheets: 'always', format: 'file' },
});
