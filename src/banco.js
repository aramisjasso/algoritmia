// Banco de ejercicios: un archivo JSON por ejercicio en src/data/ejercicios/.
// Vite los junta en tiempo de compilación; para agregar uno basta con crear un archivo nuevo.

const archivos = import.meta.glob('./data/ejercicios/*.json', { eager: true, import: 'default' })

function esValido(e) {
  return (
    typeof e?.id === 'string' &&
    [1, 2, 3].includes(e.nivel) &&
    typeof e.titulo === 'string' &&
    typeof e.enunciado === 'string'
  )
}

export const banco = Object.entries(archivos)
  .filter(([ruta, ejercicio]) => {
    if (esValido(ejercicio)) return true
    console.warn(`Ejercicio ignorado por formato inválido: ${ruta}`)
    return false
  })
  .map(([, ejercicio]) => ejercicio)
