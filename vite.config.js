import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Change '/surf-tracker/' to match your GitHub repo name exactly
  base: '/surf-report/',
  server: {
    // Listen on LAN when using `vite --host` (or rely on this)
    host: true,
    // Dev from phone: nip.io / other Host headers are rejected by default
    allowedHosts: true,
  },
})
