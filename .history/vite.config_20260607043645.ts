import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
