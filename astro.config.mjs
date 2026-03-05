import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://aurora029.github.io/Projet-immo-Ortus/', // À ajuster plus tard avec le vrai domaine
  compressHTML: true,
  build: {
    format: 'directory'
  }
});