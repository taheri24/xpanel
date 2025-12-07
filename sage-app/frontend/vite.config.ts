import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(configEnv=>({
  plugins: [react()],
  server: {
    proxy: {
      '/api/v1': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: configEnv.mode === 'development',

  }
}))
