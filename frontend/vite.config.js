import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // '@/...' apunta a src/, asi los imports no dependen de cuantos '../' hay.
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
