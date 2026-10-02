// Cuenta regresiva basada en la hora real, para que no se desfase
// si el navegador ralentiza los intervalos (por ejemplo, en una pestaña de fondo).

export function crearTemporizador({ duracionMs, alCambiar, alTerminar }) {
  let restanteMs = duracionMs
  let finEn = 0
  let intervalo = null

  function tick() {
    restanteMs = Math.max(0, finEn - Date.now())
    alCambiar(restanteMs)
    if (restanteMs === 0) {
      detener()
      alTerminar()
    }
  }

  function reanudar() {
    finEn = Date.now() + restanteMs
    intervalo = setInterval(tick, 250)
    tick()
  }

  function pausar() {
    restanteMs = Math.max(0, finEn - Date.now())
    detener()
  }

  function detener() {
    clearInterval(intervalo)
    intervalo = null
  }

  function iniciar() {
    detener()
    restanteMs = duracionMs
    reanudar()
  }

  return { iniciar, pausar, reanudar, detener }
}

export function formatear(ms) {
  const totalSegundos = Math.ceil(ms / 1000)
  const minutos = String(Math.floor(totalSegundos / 60)).padStart(2, '0')
  const segundos = String(totalSegundos % 60).padStart(2, '0')
  return `${minutos}:${segundos}`
}
