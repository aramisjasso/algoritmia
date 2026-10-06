// Vista previa de ejercicios: ver.html?id=<id> muestra uno; sin id, el catálogo completo.
// Con `npm run dev`, al guardar un JSON la página se recarga sola.

import './style.css'
import { banco, erroresBanco } from './banco.js'
import { crearTarjeta } from './render.js'
import { conectarBotonTema } from './tema.js'

const contenido = document.querySelector('#contenido')
const NOMBRES_NIVEL = { 1: 'Nivel 1 · Directo', 2: 'Nivel 2 · Técnica clásica', 3: 'Nivel 3 · Diseño' }

const crear = (etiqueta, propiedades = {}, ...hijos) => {
  const nodo = Object.assign(document.createElement(etiqueta), propiedades)
  nodo.append(...hijos)
  return nodo
}

function mostrarEjercicio(ejercicio) {
  document.title = `${ejercicio.titulo} · Algoritmia`
  const acciones = crear(
    'div',
    { className: 'acciones' },
    crear('a', { className: 'boton principal', href: `agregar.html?editar=${encodeURIComponent(ejercicio.id)}`, textContent: 'Editar en el formulario' }),
    crear('a', { className: 'boton', href: 'ver.html', textContent: 'Ver todos' }),
  )
  const archivo = crear('p', { className: 'nota' }, `Archivo: src/data/ejercicios/${ejercicio.id}.json`)
  contenido.replaceChildren(crearTarjeta(ejercicio), archivo, acciones)
}

function mostrarCatalogo(aviso) {
  const secciones = [1, 2, 3].map((nivel) => {
    const delNivel = banco.filter((e) => e.nivel === nivel).sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'))
    return crear(
      'section',
      { className: `catalogo nivel-${nivel}` },
      crear('h3', { textContent: `${NOMBRES_NIVEL[nivel]} (${delNivel.length})` }),
      crear(
        'ul',
        {},
        ...delNivel.map((e) =>
          crear(
            'li',
            {},
            crear('a', { href: `ver.html?id=${encodeURIComponent(e.id)}`, textContent: e.titulo }),
            crear('small', { textContent: e.id }),
          ),
        ),
      ),
    )
  })
  contenido.replaceChildren(
    crear('h2', { className: 'titulo-pagina', textContent: 'Banco de ejercicios' }),
    ...(aviso ? [crear('p', { className: 'aviso', textContent: aviso })] : []),
    crear('p', { className: 'intro' }, `${banco.length} ejercicios. Elige uno para verlo como sale en el sorteo.`),
    ...secciones,
  )
}

// Archivos que no se pudieron leer: se avisan arriba de todo, con el motivo.
function avisarErrores() {
  if (!erroresBanco.length) return
  const lista = crear('ul', {}, ...erroresBanco.map((texto) => crear('li', { textContent: texto })))
  contenido.prepend(crear('div', { className: 'aviso' }, 'Hay archivos con errores que no se muestran:', lista))
}

const id = new URLSearchParams(location.search).get('id')
const ejercicio = banco.find((e) => e.id === id)
if (ejercicio) mostrarEjercicio(ejercicio)
else mostrarCatalogo(id ? `No existe ningún ejercicio con el identificador "${id}".` : '')
avisarErrores()

conectarBotonTema(document.querySelector('#btn-tema'))
