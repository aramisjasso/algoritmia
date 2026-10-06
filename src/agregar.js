// Formulario para agregar o editar ejercicios, con vista previa en vivo.
// Salidas: abrir GitHub (archivo nuevo prellenado, o el editor del archivo existente)
// o copiar/descargar el JSON para quien no tiene cuenta.

import './style.css'
import { banco } from './banco.js'
import { crearTarjeta } from './render.js'
import { conectarBotonTema } from './tema.js'

// Dónde viven los ejercicios en GitHub.
const REPO = 'aramisjasso/algoritmia'
const RAMA = 'main'
const CARPETA = 'src/data/ejercicios'
// Por encima de este largo, GitHub puede rechazar el enlace con el contenido prellenado.
const LARGO_MAXIMO_URL = 8000

const CLAVE_BORRADOR = 'algoritmia:borrador'
const idsExistentes = new Set(banco.map((e) => e.id))
const NOMBRES_NIVEL = { 1: 'Nivel 1', 2: 'Nivel 2', 3: 'Nivel 3' }

const $ = (selector) => document.querySelector(selector)
const formulario = $('#formulario')
const selectorEjercicio = $('#selector-ejercicio')
const tituloPagina = $('#titulo-pagina')
const campoTitulo = $('#titulo')
const campoId = $('#id')
const ayudaId = $('#ayuda-id')
const campoEnunciado = $('#enunciado')
const listaEjemplos = $('#lista-ejemplos')
const plantillaEjemplo = $('#plantilla-ejemplo')
const vistaPrevia = $('#vista-previa')
const listaErrores = $('#errores')
const btnGithub = $('#btn-github')
const btnCopiar = $('#btn-copiar')
const btnDescargar = $('#btn-descargar')
const notaEnvio = $('#nota-envio')
const salidaJson = $('#json')

const AYUDA_ID_NUEVO = ayudaId.textContent
const AYUDA_ID_EDICION = 'Es el nombre del archivo y no se puede cambiar al editar. Para otro id, crea un ejercicio nuevo.'

// El id se genera del título hasta que la persona lo edita a mano.
let idManual = false
// Id del ejercicio existente que se está editando (null = ejercicio nuevo).
let editando = null

const nivelElegido = () => Number(formulario.elements.nivel.value)
const aJson = (ejercicio) => JSON.stringify(ejercicio, null, 2) + '\n'

function generarId(nivel, titulo) {
  const slug = titulo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    .replace(/-+$/, '')
  return slug ? `n${nivel}-${slug}` : ''
}

// ---------- Ejemplos ----------

function agregarEjemplo(datos = {}) {
  const nodo = plantillaEjemplo.content.firstElementChild.cloneNode(true)
  nodo.querySelector('.entrada').value = datos.entrada ?? ''
  nodo.querySelector('.salida').value = datos.salida ?? ''
  nodo.querySelector('.explicacion').value = datos.explicacion ?? ''
  nodo.querySelector('.quitar').addEventListener('click', () => {
    nodo.remove()
    numerarEjemplos()
    actualizar()
  })
  listaEjemplos.append(nodo)
  numerarEjemplos()
}

function numerarEjemplos() {
  listaEjemplos.querySelectorAll('.ejemplo-editor').forEach((nodo, i) => {
    nodo.querySelector('.ejemplo-numero').textContent = `Ejemplo ${i + 1}`
    nodo.setAttribute('aria-label', `Ejemplo ${i + 1}`)
  })
}

function leerEjemplos() {
  return [...listaEjemplos.querySelectorAll('.ejemplo-editor')].map((nodo) => ({
    entrada: nodo.querySelector('.entrada').value.trimEnd(),
    salida: nodo.querySelector('.salida').value.trimEnd(),
    explicacion: nodo.querySelector('.explicacion').value.trim(),
  }))
}

// ---------- Ejercicio y validación ----------

function construirEjercicio() {
  const ejercicio = {
    id: campoId.value.trim(),
    nivel: nivelElegido(),
    titulo: campoTitulo.value.trim(),
    enunciado: campoEnunciado.value.trim(),
  }
  // Los ejemplos totalmente vacíos se ignoran; la explicación solo va si tiene texto.
  const ejemplos = leerEjemplos()
    .filter((ej) => ej.entrada || ej.salida || ej.explicacion)
    .map(({ entrada, salida, explicacion }) => (explicacion ? { entrada, salida, explicacion } : { entrada, salida }))
  if (ejemplos.length) ejercicio.ejemplos = ejemplos
  return ejercicio
}

function validar(ejercicio) {
  const errores = []
  if (!ejercicio.titulo) errores.push('Falta el título.')
  // Sin título el id aún no se genera; en ese caso basta con pedir el título.
  if (ejercicio.titulo && !ejercicio.id) errores.push('Falta el identificador.')
  else if (ejercicio.id && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(ejercicio.id))
    errores.push('El identificador solo puede tener minúsculas, números y guiones (sin espacios ni acentos).')
  else if (idsExistentes.has(ejercicio.id) && ejercicio.id !== editando)
    errores.push(`Ya existe un ejercicio con el identificador "${ejercicio.id}"; cámbialo.`)
  if (!ejercicio.enunciado) errores.push('Falta el enunciado.')
  ;(ejercicio.ejemplos ?? []).forEach((ej, i) => {
    if (!ej.entrada || !ej.salida) errores.push(`Al ejemplo ${i + 1} le falta la entrada o la salida.`)
  })
  return errores
}

// ---------- Salidas: GitHub, copiar, descargar ----------

function urlArchivoNuevo(nombreArchivo, json) {
  const consulta = `filename=${encodeURIComponent(nombreArchivo)}&value=${encodeURIComponent(json)}`
  return `https://github.com/${REPO}/new/${RAMA}/${CARPETA}?${consulta}`
}

function actualizarEnvio(ejercicio, json, errores) {
  listaErrores.replaceChildren(
    ...errores.map((texto) => Object.assign(document.createElement('li'), { textContent: texto })),
  )
  const valido = errores.length === 0
  btnCopiar.disabled = btnDescargar.disabled = !valido
  btnGithub.textContent = editando ? 'Editar en GitHub' : 'Enviar a GitHub'

  if (!valido) {
    btnGithub.removeAttribute('href')
    btnGithub.setAttribute('aria-disabled', 'true')
    notaEnvio.textContent = ''
    return
  }
  btnGithub.removeAttribute('aria-disabled')

  if (editando) {
    // GitHub no permite prellenar el editor de un archivo existente:
    // al hacer clic se copia el JSON para pegarlo encima.
    btnGithub.href = `https://github.com/${REPO}/edit/${RAMA}/${CARPETA}/${editando}.json`
    const original = banco.find((e) => e.id === editando)
    notaEnvio.textContent =
      json === aJson(original)
        ? 'Todavía no hay cambios respecto al archivo publicado.'
        : 'Al abrir GitHub se copia el JSON: en el editor selecciona todo (Ctrl+A), pega (Ctrl+V) y confirma el commit.'
    return
  }

  const url = urlArchivoNuevo(`${ejercicio.id}.json`, json)
  if (url.length <= LARGO_MAXIMO_URL) {
    btnGithub.href = url
    notaEnvio.textContent = `Se creará el archivo ${CARPETA}/${ejercicio.id}.json.`
  } else {
    // Demasiado largo para un enlace: se sube el archivo descargado.
    btnGithub.href = `https://github.com/${REPO}/upload/${RAMA}/${CARPETA}`
    btnGithub.textContent = 'Subir a GitHub'
    notaEnvio.textContent =
      'El ejercicio es muy largo para enviarlo en un enlace: descarga el .json y súbelo en la página de GitHub que se abre.'
  }
}

const copiarJson = () => navigator.clipboard.writeText(salidaJson.textContent)

btnGithub.addEventListener('click', () => {
  // En modo edición, el JSON va al portapapeles; el enlace se abre igual.
  if (editando && btnGithub.hasAttribute('href')) copiarJson().catch(() => {})
})

btnCopiar.addEventListener('click', async () => {
  try {
    await copiarJson()
    btnCopiar.textContent = '¡Copiado!'
  } catch {
    // Sin permiso de portapapeles: mostramos el JSON seleccionado para copiarlo a mano.
    salidaJson.closest('details').open = true
    getSelection().selectAllChildren(salidaJson)
    btnCopiar.textContent = 'Usa Ctrl+C'
  }
  setTimeout(() => (btnCopiar.textContent = 'Copiar JSON'), 2000)
})

btnDescargar.addEventListener('click', () => {
  const ejercicio = construirEjercicio()
  const blob = new Blob([salidaJson.textContent], { type: 'application/json' })
  const enlace = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: `${ejercicio.id}.json`,
  })
  enlace.click()
  URL.revokeObjectURL(enlace.href)
})

// ---------- Borrador en localStorage ----------

function guardarBorrador() {
  try {
    localStorage.setItem(
      CLAVE_BORRADOR,
      JSON.stringify({
        editando,
        nivel: nivelElegido(),
        titulo: campoTitulo.value,
        id: campoId.value,
        idManual,
        enunciado: campoEnunciado.value,
        ejemplos: leerEjemplos(),
      }),
    )
  } catch {
    // Sin localStorage el borrador no se conserva al recargar.
  }
}

function cargarBorrador() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_BORRADOR))
  } catch {
    return null
  }
}

function llenarFormulario(datos) {
  formulario.elements.nivel.value = String(datos?.nivel ?? 1)
  campoTitulo.value = datos?.titulo ?? ''
  campoId.value = datos?.id ?? ''
  idManual = Boolean(datos?.idManual)
  campoEnunciado.value = datos?.enunciado ?? ''
  listaEjemplos.replaceChildren()
  const ejemplos = datos?.ejemplos?.length ? datos.ejemplos : [{}]
  ejemplos.forEach(agregarEjemplo)
}

// ---------- Nuevo / editar existente ----------

// Llena el selector con el banco, agrupado por nivel.
for (const nivel of [1, 2, 3]) {
  const grupo = Object.assign(document.createElement('optgroup'), { label: NOMBRES_NIVEL[nivel] })
  banco
    .filter((e) => e.nivel === nivel)
    .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'))
    .forEach((e) => grupo.append(new Option(e.titulo, e.id)))
  selectorEjercicio.append(grupo)
}

function aplicarModo() {
  selectorEjercicio.value = editando ?? ''
  tituloPagina.textContent = editando ? 'Editar un ejercicio' : 'Agregar un ejercicio'
  campoId.readOnly = Boolean(editando)
  ayudaId.textContent = editando ? AYUDA_ID_EDICION : AYUDA_ID_NUEVO
  // La URL refleja el modo, para poder recargar o compartir el enlace.
  const url = new URL(location.href)
  if (editando) url.searchParams.set('editar', editando)
  else url.searchParams.delete('editar')
  history.replaceState(null, '', url)
}

// Pasa a editar un ejercicio del banco, o a uno nuevo si id es null.
function cambiarA(id) {
  editando = id
  const ejercicio = banco.find((e) => e.id === id)
  llenarFormulario(ejercicio ? { ...ejercicio, idManual: true } : null)
  aplicarModo()
  actualizar()
}

// ¿Hay algo escrito que se perdería al cambiar de ejercicio?
function hayCambiosSinGuardar() {
  if (editando) return aJson(construirEjercicio()) !== aJson(banco.find((e) => e.id === editando))
  return Boolean(campoTitulo.value.trim() || campoEnunciado.value.trim())
}

selectorEjercicio.addEventListener('change', () => {
  const elegido = selectorEjercicio.value || null
  if (hayCambiosSinGuardar() && !confirm('Se perderá lo que escribiste en el formulario. ¿Continuar?')) {
    selectorEjercicio.value = editando ?? ''
    return
  }
  cambiarA(elegido)
})

$('#btn-limpiar').addEventListener('click', () => {
  if (!confirm('¿Borrar todo lo escrito y empezar con un ejercicio nuevo?')) return
  try {
    localStorage.removeItem(CLAVE_BORRADOR)
  } catch {
    // Nada que borrar.
  }
  cambiarA(null)
})

// ---------- Actualización en vivo ----------

let esperaVistaPrevia = null

function actualizar() {
  if (!idManual) campoId.value = generarId(nivelElegido(), campoTitulo.value)

  const ejercicio = construirEjercicio()
  const json = aJson(ejercicio)
  salidaJson.textContent = json
  actualizarEnvio(ejercicio, json, validar(ejercicio))
  guardarBorrador()

  // La vista previa (Markdown + KaTeX + resaltado) espera a que se deje de escribir.
  clearTimeout(esperaVistaPrevia)
  esperaVistaPrevia = setTimeout(() => {
    const previa = { ...ejercicio, titulo: ejercicio.titulo || 'Sin título' }
    vistaPrevia.replaceChildren(crearTarjeta(previa))
  }, 200)
}

campoId.addEventListener('input', () => {
  // Si se borra el id, vuelve a generarse solo.
  idManual = campoId.value.trim() !== ''
})
formulario.addEventListener('input', actualizar)
$('#btn-agregar-ejemplo').addEventListener('click', () => {
  agregarEjemplo()
  actualizar()
})

// ---------- Arranque ----------

conectarBotonTema($('#btn-tema'))

// ?editar=<id> carga ese ejercicio, salvo que haya un borrador sin terminar del mismo.
const pedido = new URLSearchParams(location.search).get('editar')
const borrador = cargarBorrador()

if (pedido && idsExistentes.has(pedido) && borrador?.editando !== pedido) {
  cambiarA(pedido)
} else {
  editando = idsExistentes.has(borrador?.editando) ? borrador.editando : null
  llenarFormulario(borrador)
  aplicarModo()
  actualizar()
}
