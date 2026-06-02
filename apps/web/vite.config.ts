import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/mermaid')) {
            return 'mermaid'
          }
          if (id.includes('node_modules/shiki')) {
            return 'shiki'
          }
          if (id.includes('node_modules/katex')) {
            return 'katex'
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react'
          }
          if (id.includes('node_modules/@codemirror')) {
            return 'codemirror'
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
})
