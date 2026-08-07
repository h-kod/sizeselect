import { defineConfig } from 'vite'
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join, resolve } from 'path'

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
  resolve: {
    // Widget her ürün sayfasına yüklendiği için React yerine Preact kullanılır:
    // aynı API, yaklaşık üçte bir paket boyutu.
    alias: {
      react: 'preact/compat',
      'react-dom/client': 'preact/compat/client',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime'
    }
  },
  build: {
    target: 'es2019',
    lib: {
      entry: resolve(__dirname, 'src/widget/embed.ts'),
      name: 'ShoeFitWidget',
      // Tek bir IIFE üretilir; merchant klasik <script src> ile ekleyebilir,
      // type="module" gerekmez.
      formats: ['iife'],
      fileName: () => 'shoe-size-widget.js'
    },
    cssCodeSplit: false,
    reportCompressedSize: true
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
        server.middlewares.use((req, _res, next) => {
          const path = (req.url || '').split('?')[0]
          if (path === '/' || /^\/(tr|en)(\/|$)/.test(path)) {
            req.url = '/index.html'
          } else if (path === '/dashboard' || path === '/panel') {
            req.url = '/dashboard.html'
          }
          next()
        })
      }
    }
  ]
})
