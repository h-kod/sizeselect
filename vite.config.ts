import { defineConfig } from 'vite'

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
  }
})
