// Modo claro / oscuro. Por defecto sigue al sistema; si la persona elige uno,
// se guarda en localStorage y se marca con data-theme en <html>.
// (index.html aplica el tema guardado antes de pintar, para evitar un parpadeo.)

import temaClaroHljs from 'highlight.js/styles/github.css?inline'
import temaOscuroHljs from 'highlight.js/styles/github-dark.css?inline'

const CLAVE_TEMA = 'algoritmia:tema'
const sistemaOscuro = window.matchMedia('(prefers-color-scheme: dark)')

function crearEstilo(css) {
  const estilo = document.createElement('style')
  estilo.textContent = css
  document.head.append(estilo)
  return estilo
}

const estiloClaro = crearEstilo(temaClaroHljs)
const estiloOscuro = crearEstilo(temaOscuroHljs)

// Tema elegido a mano: 'light', 'dark' o null (seguir al sistema).
let elegido = null
try {
  elegido = localStorage.getItem(CLAVE_TEMA)
} catch {
  // Sin localStorage: se sigue al sistema.
}

export function temaActual() {
  return elegido ?? (sistemaOscuro.matches ? 'dark' : 'light')
}

function aplicar(tema) {
  document.documentElement.dataset.theme = tema
  // Solo una hoja de highlight.js activa a la vez.
  estiloClaro.media = tema === 'light' ? 'all' : 'not all'
  estiloOscuro.media = tema === 'dark' ? 'all' : 'not all'
}

export function alternarTema() {
  elegido = temaActual() === 'dark' ? 'light' : 'dark'
  try {
    localStorage.setItem(CLAVE_TEMA, elegido)
  } catch {
    // Sin localStorage el cambio dura hasta recargar.
  }
  aplicar(elegido)
  return elegido
}

// Si no hay elección guardada, seguimos los cambios del sistema en vivo.
sistemaOscuro.addEventListener('change', () => {
  if (!elegido) aplicar(temaActual())
})

aplicar(temaActual())
