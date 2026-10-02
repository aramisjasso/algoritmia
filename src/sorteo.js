// Sorteo de ejercicios y su historial en localStorage.

const CLAVE_HISTORIAL = 'algoritmia:vistos'
const PROBABILIDAD_RONDA_PESADA = 0.15

export function leerHistorial() {
  try {
    const ids = JSON.parse(localStorage.getItem(CLAVE_HISTORIAL))
    return Array.isArray(ids) ? ids : []
  } catch {
    return []
  }
}

function guardarHistorial(ids) {
  try {
    localStorage.setItem(CLAVE_HISTORIAL, JSON.stringify(ids))
  } catch {
    // Sin localStorage (modo privado, bloqueado...): el sorteo sigue funcionando sin memoria.
  }
}

export function borrarHistorial() {
  try {
    localStorage.removeItem(CLAVE_HISTORIAL)
  } catch {
    // Nada que borrar.
  }
}

function barajar(lista) {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

// Elige `cantidad` ejercicios distintos del nivel, prefiriendo los que no se han visto.
function elegir(banco, nivel, cantidad, vistos) {
  const delNivel = banco.filter((e) => e.nivel === nivel)
  let elegidos = barajar(delNivel.filter((e) => !vistos.has(e.id))).slice(0, cantidad)

  if (elegidos.length < cantidad) {
    // Nivel agotado: se reinicia su historial y se completa con los demás.
    for (const e of delNivel) vistos.delete(e.id)
    const resto = delNivel.filter((e) => !elegidos.includes(e))
    elegidos = elegidos.concat(barajar(resto).slice(0, cantidad - elegidos.length))
  }
  return elegidos
}

// Devuelve { ejercicios, pesada }: normalmente niveles 1, 2 y 3;
// con 15 % de probabilidad (si hay al menos dos de nivel 3) la ronda es 1, 3, 3.
export function sortear(banco) {
  const vistos = new Set(leerHistorial())
  const hayDosDeNivel3 = banco.filter((e) => e.nivel === 3).length >= 2
  const pesada = hayDosDeNivel3 && Math.random() < PROBABILIDAD_RONDA_PESADA

  const ejercicios = pesada
    ? [...elegir(banco, 1, 1, vistos), ...elegir(banco, 3, 2, vistos)]
    : [...elegir(banco, 1, 1, vistos), ...elegir(banco, 2, 1, vistos), ...elegir(banco, 3, 1, vistos)]

  for (const e of ejercicios) vistos.add(e.id)
  guardarHistorial([...vistos])

  return { ejercicios, pesada }
}
