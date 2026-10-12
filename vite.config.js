import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: '',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'app.js',
        chunkFileNames: 'chunk-[name].js',
        assetFileNames: ({ name }) => {
          const ext = path.extname(name || '')
          const base = path.basename(name || 'asset', ext)
          if (ext === '.css') return 'app.css'
          return `${base}${ext}`
        },
      },
    },
  },
})
