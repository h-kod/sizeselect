import { defineConfig } from 'vite'
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

function copyDir(src: string, dest: string) {
  mkdirSync(dest, { recursive: true })
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry)
    const destPath = join(dest, entry)
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  build: {
    lib: {
      entry: 'src/widget/embed.ts',
      name: 'ShoeSizeWidget',
      fileName: 'shoe-size-widget'
    },
    rollupOptions: {
      output: {
        globals: {}
      }
    }
  },
  plugins: [
    {
      name: 'copy-public-to-dist',
      closeBundle() {
        copyDir('public', 'dist')
      }
    },
    {
      name: 'html-routing',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';
          const path = url.split('?')[0];
          if (path === '/' || path === '/tr' || path === '/en' || path.startsWith('/tr/') || path.startsWith('/en/')) {
            req.url = '/index.html';
          } else if (path === '/dashboard') {
            req.url = '/dashboard.html';
          }
          next();
        });
      }
    }
  ]
})
