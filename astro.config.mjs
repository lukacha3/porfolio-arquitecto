// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sanity from '@sanity/astro';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID || env.PUBLIC_SANITY_PROJECT_ID || '';
const dataset = process.env.PUBLIC_SANITY_DATASET || env.PUBLIC_SANITY_DATASET || 'production';

// Detect preview mode to omit sitemap in preview builds
const isPreview =
  process.env.MODE === 'preview' ||
  (process.argv.includes('--mode') && process.argv[process.argv.indexOf('--mode') + 1] === 'preview');

// https://astro.build/config
export default defineConfig({
  site: 'https://lukacha3.github.io',
  base: '/porfolio-arquitecto',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    sanity({
      projectId,
      dataset,
      useCdn: false,
      studioBasePath: '/admin',
    }),
    react(),
    ...(!isPreview
      ? [
          sitemap({
            filter: (page) => !page.includes('/admin'),
          }),
        ]
      : []),
  ],
});