import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://mooketsimagwaza.github.io',
  base: '/portfolio',
  integrations: [mdx(), sitemap()],
  output: 'static',
});
