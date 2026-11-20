import { defineConfig } from 'vite';

// Replaces __SITE_URL__ in index.html (Open Graph tags). Usage: SITE_URL=https://your-domain npm run build
export default defineConfig({
  base: './',
  plugins: [{
    name: 'site-url',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', (process.env.SITE_URL || 'https://YOUR-PUBLIC-DOMAIN').replace(/\/$/, '')),
  }],
});
