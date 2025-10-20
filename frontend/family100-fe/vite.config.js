import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
server: {
  host: '127.0.0.1',
  port: 5173,
  strictPort: true,
  hmr: { host: '127.0.0.1' },
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:3099',
      changeOrigin: true,
    },
  },
}
})
