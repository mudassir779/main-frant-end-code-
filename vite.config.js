import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 8000,
    host: '0.0.0.0',
    allowedHosts: [
      'americantreesexpert.com',
      '.americantreesexpert.com'  // subdomain ke liye
    ]
  }
})
