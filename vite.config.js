import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            console.warn('[Vite Proxy Warning] Could not connect to backend on port 3000:', err.message);
            if (!res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ message: 'Backend server is connecting or offline on port 3000. Please start the backend server.' }));
            }
          });
        }
      },
    },
  },
})
