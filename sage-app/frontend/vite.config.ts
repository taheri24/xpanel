import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(configEnv=>({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    proxy: {
      '/api/v1': {
        //target: 'http://localhost:8080',
  //  https://contendingly-slipshod-sherri.ngrok-free.dev 
        target:`https://contendingly-slipshod-sherri.ngrok-free.dev`,
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
