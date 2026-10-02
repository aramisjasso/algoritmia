import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  // Nombre del repo en GitHub: la página se sirve en https://<usuario>.github.io/algoritmia/
  base: '/algoritmia/',
  build: {
    // Dos páginas: el sorteo (index.html) y el formulario para agregar ejercicios.
    rollupOptions: {
      input: {
        principal: resolve(import.meta.dirname, 'index.html'),
        agregar: resolve(import.meta.dirname, 'agregar.html'),
      },
    },
  },
})
