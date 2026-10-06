// Banco de ejercicios: un archivo JSON por ejercicio en src/data/ejercicios/.
// Vite los junta en tiempo de compilación; para agregar uno basta con crear un archivo nuevo.
//
// Se leen como texto y se convierten aquí (en vez de importarlos como JSON) para que
// un archivo mal escrito no tumbe la página: se reporta en erroresBanco y se omite.
// La publicación sí se bloquea: `npm run build` corre antes scripts/validar.js.

const archivos = import.meta.glob('./data/ejercicios/*.json', { eager: true, query: '?raw', import: 'default' })

function esValido(e) {
  return (
    typeof e?.id === 'string' &&
    [1, 2, 3].includes(e.nivel) &&
    typeof e.titulo === 'string' &&
    typeof e.enunciado === 'string'
  )
}

export const banco = []
export const erroresBanco = []

for (const [ruta, texto] of Object.entries(archivos)) {
  const archivo = ruta.split('/').pop()
  let ejercicio
  try {
    ejercicio = JSON.parse(texto)
  } catch (error) {
    erroresBanco.push(`${archivo}: el JSON está mal escrito (${error.message}).`)
    continue
  }
  if (!esValido(ejercicio)) {
    erroresBanco.push(`${archivo}: faltan id, titulo o enunciado, o el nivel no es 1, 2 o 3.`)
    continue
  }
  banco.push(ejercicio)
}

for (const error of erroresBanco) console.warn(`Ejercicio omitido: ${error}`)
