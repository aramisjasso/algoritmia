// Convierte un ejercicio del JSON en su tarjeta HTML:
// Markdown (marked) + resaltado de código (highlight.js) + fórmulas $...$ (KaTeX).

import { marked } from 'marked'
import hljs from 'highlight.js/lib/core'
import python from 'highlight.js/lib/languages/python'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import renderMathInElement from 'katex/contrib/auto-render'
import 'katex/dist/katex.min.css'

hljs.registerLanguage('python', python)
hljs.registerLanguage('c', c)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('java', java)
hljs.registerLanguage('javascript', javascript)

const escaparHtml = (texto) =>
  texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Deja intactas las fórmulas $...$ y $$...$$ para que marked no convierta,
// por ejemplo, los "_" de a_i en cursivas. Luego KaTeX auto-render las dibuja.
marked.use({
  extensions: [
    {
      name: 'formula',
      level: 'inline',
      start: (src) => src.indexOf('$'),
      tokenizer(src) {
        const coincidencia = /^\$\$[^$]+?\$\$|^\$[^$\n]+?\$/.exec(src)
        if (coincidencia) return { type: 'formula', raw: coincidencia[0] }
      },
      renderer: (token) => escaparHtml(token.raw),
    },
  ],
})

const NOMBRES_NIVEL = { 1: 'Directo', 2: 'Técnica clásica', 3: 'Diseño de algoritmos' }

// `numero` es opcional: solo el sorteo lo muestra.
export function crearTarjeta(ejercicio, numero) {
  const tarjeta = document.createElement('article')
  tarjeta.className = `tarjeta nivel-${ejercicio.nivel}`

  const ejemplos = (ejercicio.ejemplos ?? [])
    .map(
      (ej, i) => `
      <div class="ejemplo">
        <h4>Ejemplo ${i + 1}</h4>
        <div class="entrada-salida">
          <div>
            <span class="etiqueta">Entrada</span>
            <pre>${escaparHtml(ej.entrada)}</pre>
          </div>
          <div>
            <span class="etiqueta">Salida</span>
            <pre>${escaparHtml(ej.salida)}</pre>
          </div>
        </div>
        ${ej.explicacion ? `<p class="explicacion">${marked.parseInline(ej.explicacion)}</p>` : ''}
      </div>`,
    )
    .join('')

  tarjeta.innerHTML = `
    <header class="tarjeta-encabezado">
      <span class="insignia">Nivel ${ejercicio.nivel} · ${NOMBRES_NIVEL[ejercicio.nivel] ?? ''}</span>
      ${numero ? `<span class="numero">Ejercicio ${numero}</span>` : ''}
    </header>
    <h2>${escaparHtml(ejercicio.titulo)}</h2>
    <div class="enunciado">${marked.parse(ejercicio.enunciado)}</div>
    ${ejemplos ? `<section class="ejemplos">${ejemplos}</section>` : ''}
  `

  for (const bloque of tarjeta.querySelectorAll('.enunciado pre code')) {
    const lenguaje = [...bloque.classList].find((c) => c.startsWith('language-'))?.slice(9)
    if (!lenguaje || hljs.getLanguage(lenguaje)) hljs.highlightElement(bloque)
  }

  renderMathInElement(tarjeta, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false },
    ],
    throwOnError: false,
  })

  return tarjeta
}
