import './style.css'
import { banco } from './banco.js'
import { sortear, leerHistorial, borrarHistorial } from './sorteo.js'
import { crearTemporizador, formatear } from './temporizador.js'
import { crearTarjeta } from './render.js'
import { conectarBotonTema } from './tema.js'
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
const btnInicio = $('#btn-inicio')
const bienvenida = contenedor.querySelector('.bienvenida')
const tituloInicial = document.title

let enRonda = false
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
    terminarRonda('¡Tiempo!', { agotado: true })
    sonarFin()
  },
})

function mostrarBotones() {
  btnComenzar.hidden = enRonda
  btnPausa.hidden = !enRonda
  btnTerminar.hidden = !enRonda
  // "Volver al inicio" solo aparece con una ronda terminada en pantalla.
  btnInicio.hidden = enRonda || contenedor.contains(bienvenida)
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

  // Una entrada en el historial del navegador para que el botón Atrás regrese al inicio.
  if (!history.state?.ronda) history.pushState({ ronda: true }, '')

  enRonda = true
  pausado = false
  btnPausa.textContent = 'Pausar'
  reloj.classList.remove('fin', 'agotado', 'pausado')
  mostrarBotones()
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

function terminarRonda(mensaje, { agotado = false } = {}) {
  temporizador.detener()
  detenerMusica()
  reloj.textContent = mensaje
  reloj.classList.remove('alerta', 'pausado')
  reloj.classList.add('fin')
  reloj.classList.toggle('agotado', agotado)
  document.title = `${mensaje} · Algoritmia`
  btnComenzar.textContent = 'Nueva ronda'
  enRonda = false
  mostrarBotones()
}

function mostrarInicio() {
  temporizador.detener()
  detenerMusica()
  enRonda = false
  contenedor.replaceChildren(bienvenida)
  aviso.hidden = true
  reloj.textContent = formatear(DURACION_MS)
  reloj.classList.remove('alerta', 'pausado', 'fin', 'agotado')
  barraProgreso.style.width = '100%'
  document.title = tituloInicial
  btnComenzar.textContent = 'Comenzar'
  mostrarBotones()
  window.scrollTo(0, 0)
}

const CONFIRMAR_SALIDA = '¿Salir de la ronda? El reloj se detendrá.'

function irAlInicio() {
  if (enRonda && !confirm(CONFIRMAR_SALIDA)) return
  mostrarInicio()
  // Quita la entrada que agregó comenzar(); el popstate resultante ya no hace nada nuevo.
  if (history.state?.ronda) history.back()
}

// Botón Atrás del navegador durante o después de una ronda.
window.addEventListener('popstate', () => {
  if (history.state?.ronda) return
  if (enRonda && !confirm(CONFIRMAR_SALIDA)) {
    history.pushState({ ronda: true }, '')
    return
  }
  mostrarInicio()
})

// Al recargar, la página arranca en el inicio: descartamos una entrada de ronda vieja.
if (history.state?.ronda) history.replaceState(null, '')

function actualizarEstadisticas() {
  const ids = new Set(banco.map((e) => e.id))
  const vistos = leerHistorial().filter((id) => ids.has(id)).length
  $('#estadisticas').textContent = `${banco.length} ejercicios en el banco · ${vistos} ya vistos en este navegador`
}

btnComenzar.addEventListener('click', comenzar)
btnPausa.addEventListener('click', alternarPausa)
btnInicio.addEventListener('click', irAlInicio)
$('#enlace-inicio').addEventListener('click', (evento) => {
  evento.preventDefault()
  irAlInicio()
})
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

conectarBotonTema($('#btn-tema'))
actualizarEstadisticas()
