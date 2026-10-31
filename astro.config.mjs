import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://subodhkant.dev',
  server: { port: 4321 },
  build: { inlineStylesheets: 'always' },
});
