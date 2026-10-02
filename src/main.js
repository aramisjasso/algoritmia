import './style.css'
import banco from './data/ejercicios.json'
import { sortear, leerHistorial, borrarHistorial } from './sorteo.js'
import { crearTemporizador, formatear } from './temporizador.js'
import { crearTarjeta } from './render.js'
import { temaActual, alternarTema } from './tema.js'
import {
  reproducirMusica,
  pausarMusica,
  detenerMusica,
  cambiarVolumen,
  alternarSilencio,
  alFallarMusica,
  prepararSonido,
  sonarFin,
} from './audio.js'

const DURACION_MS = 25 * 60 * 1000
const ALERTA_MS = 5 * 60 * 1000

const FRASES_RONDA_PESADA = [
  '¡Ronda pesada! Te tocaron dos de nivel 3. El nivel 2 se fue por un café y no volvió.',
  '¡Ronda pesada! Dos de nivel 3. Respira hondo y divide el problema en partes... dos veces.',
  '¡Ronda pesada! La suerte te tiene fe: dos ejercicios de nivel 3.',
]

const $ = (selector) => document.querySelector(selector)
const reloj = $('#reloj')
const barraProgreso = $('#barra-progreso')
const btnComenzar = $('#btn-comenzar')
const btnPausa = $('#btn-pausa')
const btnTerminar = $('#btn-terminar')
const btnSilencio = $('#btn-silencio')
const volumen = $('#volumen')
const aviso = $('#aviso')
const contenedor = $('#ejercicios')

let pausado = false

const temporizador = crearTemporizador({
  duracionMs: DURACION_MS,
  alCambiar(restanteMs) {
    reloj.textContent = formatear(restanteMs)
    barraProgreso.style.width = `${(restanteMs / DURACION_MS) * 100}%`
    reloj.classList.toggle('alerta', restanteMs <= ALERTA_MS)
    document.title = `${formatear(restanteMs)} · Algoritmia`
  },
  alTerminar() {
    terminarRonda('¡Tiempo!')
    sonarFin()
  },
})

function mostrarBotones(enRonda) {
  btnComenzar.hidden = enRonda
  btnPausa.hidden = !enRonda
  btnTerminar.hidden = !enRonda
}

function comenzar() {
  // Audio y música arrancan aquí, dentro del clic, por la política de autoplay.
  prepararSonido()
  reproducirMusica()

  const { ejercicios, pesada } = sortear(banco)
  contenedor.replaceChildren(...ejercicios.map((e, i) => crearTarjeta(e, i + 1)))

  aviso.hidden = !pesada
  if (pesada) {
    aviso.textContent = FRASES_RONDA_PESADA[Math.floor(Math.random() * FRASES_RONDA_PESADA.length)]
  }

  pausado = false
  btnPausa.textContent = 'Pausar'
  reloj.classList.remove('fin', 'pausado')
  mostrarBotones(true)
  temporizador.iniciar()
  actualizarEstadisticas()
}

function alternarPausa() {
  pausado = !pausado
  if (pausado) {
    temporizador.pausar()
    pausarMusica()
  } else {
    temporizador.reanudar()
    reproducirMusica()
  }
  btnPausa.textContent = pausado ? 'Reanudar' : 'Pausar'
  reloj.classList.toggle('pausado', pausado)
}

function terminarRonda(mensaje) {
  temporizador.detener()
  detenerMusica()
  reloj.textContent = mensaje
  reloj.classList.remove('alerta', 'pausado')
  reloj.classList.add('fin')
  document.title = `${mensaje} · Algoritmia`
  btnComenzar.textContent = 'Nueva ronda'
  mostrarBotones(false)
}

function actualizarEstadisticas() {
  const ids = new Set(banco.map((e) => e.id))
  const vistos = leerHistorial().filter((id) => ids.has(id)).length
  $('#estadisticas').textContent = `${banco.length} ejercicios en el banco · ${vistos} ya vistos en este navegador`
}

btnComenzar.addEventListener('click', comenzar)
btnPausa.addEventListener('click', alternarPausa)
btnTerminar.addEventListener('click', () => {
  if (confirm('¿Terminar la ronda antes de tiempo?')) terminarRonda('Terminado')
})

btnSilencio.addEventListener('click', () => {
  const silenciada = alternarSilencio()
  btnSilencio.classList.toggle('silenciada', silenciada)
  btnSilencio.title = silenciada ? 'Activar música' : 'Silenciar música'
  btnSilencio.setAttribute('aria-label', btnSilencio.title)
})
volumen.addEventListener('input', () => cambiarVolumen(Number(volumen.value)))

alFallarMusica(() => {
  btnSilencio.disabled = volumen.disabled = true
  btnSilencio.classList.add('silenciada')
  btnSilencio.title = 'Sin música: no se encontró public/audio/musica.mp3'
})

$('#btn-historial').addEventListener('click', () => {
  if (confirm('¿Borrar el historial de ejercicios vistos en este navegador?')) {
    borrarHistorial()
    actualizarEstadisticas()
  }
})

const btnTema = $('#btn-tema')
function etiquetarBotonTema() {
  btnTema.title = temaActual() === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
  btnTema.setAttribute('aria-label', btnTema.title)
}
btnTema.addEventListener('click', () => {
  alternarTema()
  etiquetarBotonTema()
})

etiquetarBotonTema()
actualizarEstadisticas()
