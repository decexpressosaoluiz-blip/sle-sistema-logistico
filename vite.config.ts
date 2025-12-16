// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // Base relativa './' é a configuração mais segura para evitar erros de caminho
  base: './', 
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
        overlay: false
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})