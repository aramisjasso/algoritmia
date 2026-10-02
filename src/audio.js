// Música de fondo (public/audio/musica.mp3, opcional) y sonido de fin con Web Audio API.

const musica = new Audio(`${import.meta.env.BASE_URL}audio/musica.mp3`)
musica.loop = true
musica.preload = 'metadata'
musica.volume = 0.5

// Se llama si el archivo no existe o no se puede reproducir.
export function alFallarMusica(callback) {
  musica.addEventListener('error', callback)
}

// Debe llamarse dentro de un handler de clic (política de autoplay).
export function reproducirMusica() {
  musica.play().catch(() => {
    // Sin archivo o reproducción bloqueada: seguimos sin música.
  })
}

export function pausarMusica() {
  musica.pause()
}

export function detenerMusica() {
  musica.pause()
  musica.currentTime = 0
}

export function cambiarVolumen(valor) {
  musica.volume = valor
}

// Devuelve true si quedó silenciada.
export function alternarSilencio() {
  musica.muted = !musica.muted
  return musica.muted
}

let contexto = null

// También debe llamarse en un clic: los navegadores crean el AudioContext suspendido si no.
export function prepararSonido() {
  try {
    contexto ??= new AudioContext()
    contexto.resume()
  } catch {
    contexto = null
  }
}

// Tres pitidos cortos, el último más agudo.
export function sonarFin() {
  if (!contexto) return
  const ahora = contexto.currentTime
  ;[880, 880, 1320].forEach((frecuencia, i) => {
    const inicio = ahora + i * 0.3
    const oscilador = contexto.createOscillator()
    const ganancia = contexto.createGain()
    oscilador.frequency.value = frecuencia
    ganancia.gain.setValueAtTime(0.0001, inicio)
    ganancia.gain.exponentialRampToValueAtTime(0.3, inicio + 0.02)
    ganancia.gain.exponentialRampToValueAtTime(0.0001, inicio + (i === 2 ? 0.5 : 0.2))
    oscilador.connect(ganancia).connect(contexto.destination)
    oscilador.start(inicio)
    oscilador.stop(inicio + 0.55)
  })
}
