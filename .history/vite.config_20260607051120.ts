import { defineConfig } from 'vite'

export default defineConfig({
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
