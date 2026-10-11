// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://lukacha3.github.io',
  base: '/portfolio-arquitecto',
  vite: {
    plugins: [tailwindcss()],
  },
});