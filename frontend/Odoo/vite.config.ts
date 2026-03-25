import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/users': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/contacts': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/products': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/recurring-plans': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/subscriptions': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/invoices': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/payment-terms': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/quotation-templates': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/taxes': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/discounts': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/reports': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
