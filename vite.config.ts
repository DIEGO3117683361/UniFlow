import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANTE: El nombre aquí debe coincidir EXACTAMENTE con el de tu repositorio en GitHub
  // Si tu repo es https://usuario.github.io/UniFlow/, el base debe ser '/UniFlow/'
  base: '/UniFlow/', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  }
})