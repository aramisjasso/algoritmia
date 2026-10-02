# Algoritmia · Práctica cronometrada

Página estática para practicar Algoritmia y Programación con tiempo límite: al presionar **Comenzar** te tocan tres ejercicios (niveles 1, 2 y 3) y corre una cuenta regresiva de 25 minutos. Con 15 % de probabilidad la ronda es "pesada" y el de nivel 2 se cambia por otro de nivel 3.

Cada navegador recuerda qué ejercicios ya le tocaron (en `localStorage`) y prefiere los que no han salido.

## Desarrollo

```bash
npm install
npm run dev      # servidor local
npm run build    # compila a dist/
```

La música de fondo es opcional: coloca un archivo en `public/audio/musica.mp3`. Si no existe, la página funciona igual, sin música.

## Cómo añadir ejercicios

Los ejercicios están en [`src/data/ejercicios.json`](src/data/ejercicios.json). Se puede editar directo desde GitHub (botón del lápiz) y, al guardar en `main`, la página se vuelve a publicar sola.

Cada ejercicio tiene esta forma:

| Campo       | Obligatorio | Descripción                                                     |
| ----------- | ----------- | --------------------------------------------------------------- |
| `id`        | sí          | Texto único, sin espacios. Ej.: `n2-busqueda-binaria`.          |
| `nivel`     | sí          | `1` (directo), `2` (técnica clásica) o `3` (diseño).            |
| `titulo`    | sí          | Título corto.                                                   |
| `enunciado` | sí          | Texto en Markdown. Admite fórmulas con `$...$` y bloques de código. |
| `ejemplos`  | no          | Lista de `{ "entrada", "salida", "explicacion" }` (la explicación es opcional). |

Como todo va dentro de un string JSON, hay que escapar algunas cosas:

- Salto de línea → `\n` (un párrafo nuevo en Markdown es `\n\n`).
- Comillas dobles → `\"`.
- Barra invertida → `\\` (importante en LaTeX: `$\\log n$`, `$\\le$`).
- Bloque de código → tres acentos graves con el lenguaje (`python`, `c`, `cpp`, `java`, `javascript`) y `\n` en cada línea.

Ejemplo completo (agrégalo dentro de los corchetes `[ ]`, separado del anterior con una coma):

````json
{
  "id": "n1-contar-vocales",
  "nivel": 1,
  "titulo": "Contar vocales",
  "enunciado": "Dada una cadena $s$, cuenta cuántas vocales tiene.\n\nResuélvelo en $O(n)$ y sin usar `count`:\n\n```python\ndef contar_vocales(s: str) -> int:\n    ...\n```\n\nConsidera la cadena \"Hola\" como ejemplo.",
  "ejemplos": [
    {
      "entrada": "murcielago",
      "salida": "5",
      "explicacion": "u, i, e, a, o."
    },
    {
      "entrada": "3\nabc\nxyz\naei",
      "salida": "1\n0\n3"
    }
  ]
}
````

Antes de guardar, revisa que no falte ni sobre una coma: si el JSON queda mal, la compilación falla y la página no se actualiza (lo verás en la pestaña **Actions** del repo).

## Despliegue

El workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) compila con Vite y publica en GitHub Pages en cada push a `main`. En el repo hay que tener **Settings → Pages → Source: GitHub Actions**.
