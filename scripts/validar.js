// Revisa los ejercicios antes de compilar: si algo está mal, `npm run build` falla
// (y por lo tanto el despliegue en GitHub Actions), diciendo qué archivo corregir.

import fs from 'node:fs'
import path from 'node:path'

const carpeta = path.join(import.meta.dirname, '..', 'src', 'data', 'ejercicios')
const errores = []
const ids = new Map()

for (const archivo of fs.readdirSync(carpeta).filter((a) => a.endsWith('.json'))) {
  let e
  try {
    e = JSON.parse(fs.readFileSync(path.join(carpeta, archivo), 'utf8'))
  } catch (error) {
    errores.push(`${archivo}: el JSON está mal escrito (${error.message}).`)
    continue
  }
  if (typeof e.id !== 'string' || typeof e.titulo !== 'string' || typeof e.enunciado !== 'string')
    errores.push(`${archivo}: faltan "id", "titulo" o "enunciado".`)
  if (![1, 2, 3].includes(e.nivel)) errores.push(`${archivo}: "nivel" debe ser 1, 2 o 3.`)
  if (e.id && `${e.id}.json` !== archivo) errores.push(`${archivo}: el "id" (${e.id}) no coincide con el nombre del archivo.`)
  if (ids.has(e.id)) errores.push(`${archivo}: el id "${e.id}" ya se usa en ${ids.get(e.id)}.`)
  ids.set(e.id, archivo)
  for (const [i, ej] of (e.ejemplos ?? []).entries())
    if (typeof ej.entrada !== 'string' || typeof ej.salida !== 'string')
      errores.push(`${archivo}: al ejemplo ${i + 1} le falta "entrada" o "salida".`)
}

if (errores.length) {
  console.error(`Ejercicios con problemas:\n- ${errores.join('\n- ')}`)
  process.exit(1)
}
console.log(`${ids.size} ejercicios válidos.`)
