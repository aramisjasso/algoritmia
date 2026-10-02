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

Cada ejercicio es un archivo JSON en [`src/data/ejercicios/`](src/data/ejercicios/), con el nombre `<id>.json`. Al llegar un archivo nuevo a `main`, la página se vuelve a publicar sola.

### Con el formulario (recomendado)

La página **Agregar ejercicio** (enlace al pie de la página principal, o `/agregar.html`) tiene un formulario con vista previa en vivo. El JSON se arma y se escapa solo. Al terminar hay dos caminos:

- **Enviar a GitHub**: abre GitHub con el archivo ya escrito en la carpeta correcta. Si eres colaborador del repo, solo confirma el commit. Si no, GitHub te ofrece hacer un fork y abrir un pull request, que alguien con acceso revisa y acepta.
- **Copiar JSON / Descargar .json**: para quien no tiene cuenta de GitHub. Se manda el archivo a quien administra el repo.

El borrador se guarda en el navegador, así que no se pierde al recargar.

### Agregar un JSON que te mandaron

En GitHub, entra a `src/data/ejercicios/` y usa **Add file → Upload files** para subir el `.json`, o **Add file → Create new file** si te lo pegaron como texto (llámalo `<id>.json`). Si el `id` ya existe, cámbialo antes de guardar.

### A mano

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

Ejemplo completo de un archivo (`src/data/ejercicios/n1-contar-vocales.json`):

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

Si un archivo queda con JSON mal formado (una coma de más, comillas sin escapar), la compilación falla y la página no se actualiza; lo verás en la pestaña **Actions** del repo. Un archivo con JSON válido pero sin los campos obligatorios se ignora con un aviso en la consola.

## Despliegue

El workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) compila con Vite y publica en GitHub Pages en cada push a `main`. En el repo hay que tener **Settings → Pages → Source: GitHub Actions**.
