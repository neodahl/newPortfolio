import { fileURLToPath } from 'node:url';
import path from 'node:path';
import pug from 'pug';
import { defineConfig } from 'vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

function pugPage() {
  return {
    name: 'pug-page',
    transformIndexHtml: {
      order: 'pre',
      handler() {
        return pug.renderFile(path.join(projectRoot, 'src', 'index.pug'), {
          pretty: true,
        });
      },
    },
  };
}

export default defineConfig({
  base: '/newPortfolio/',
  plugins: [pugPage()],
});
