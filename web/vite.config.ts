import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/courses': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
      '/grades': 'http://localhost:3000',
      '/attendance': 'http://localhost:3000',
      '/enrollments': 'http://localhost:3000',
    },
  },
})
