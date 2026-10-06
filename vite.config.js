import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  // Nombre del repo en GitHub: la página se sirve en https://<usuario>.github.io/algoritmia/
  base: '/algoritmia/',
  build: {
    // Tres páginas: el sorteo, el formulario para agregar/editar y la vista previa del banco.
    rollupOptions: {
      input: {
        principal: resolve(import.meta.dirname, 'index.html'),
        agregar: resolve(import.meta.dirname, 'agregar.html'),
        ver: resolve(import.meta.dirname, 'ver.html'),
      },
    },
  },
})
