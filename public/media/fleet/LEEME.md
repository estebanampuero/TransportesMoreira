# Carpeta de medios — Flota

Coloca aquí las imágenes y videos de los camiones.
Los archivos en esta carpeta se acceden desde el sitio con la ruta `/media/fleet/nombre-del-archivo`.

## Archivos recomendados

| Archivo                  | Uso                              | Tamaño sugerido |
|--------------------------|----------------------------------|-----------------|
| `tracto-camion.jpg`      | Foto del Tracto Camión           | 1280×720        |
| `tracto-camion.mp4`      | Video del Tracto Camión (hover)  | máx 5 MB        |
| `grua-pluma.jpg`         | Foto del Camión Grúa Pluma       | 1280×720        |
| `grua-pluma.mp4`         | Video de la Grúa Pluma (hover)   | máx 5 MB        |
| `camion-rigido.jpg`      | Foto del Camión Rígido           | 1280×720        |
| `camion-rigido.mp4`      | Video del Camión Rígido (hover)  | máx 5 MB        |

## Dos opciones para tus medios

### Opción A — Archivos locales (esta carpeta)
Ventaja: gratis, rápido, sin dependencias externas.
Pega la imagen/video aquí y usa la URL `/media/fleet/nombre.jpg` en el campo del admin.

### Opción B — Firebase Storage (subir desde admin)
Ventaja: puedes subir sin tocar el código.
Las URLs de Firebase Storage tienen el formato:
`https://firebasestorage.googleapis.com/v0/b/transportesmoreira.firebasestorage.app/o/...`

Para subir: ve a console.firebase.google.com → Storage → Upload file → copia la URL de descarga.

## Formatos soportados
- Imágenes: `.jpg`, `.jpeg`, `.png`, `.webp`
- Videos: `.mp4` (H.264, AAC) — el video se reproduce al pasar el mouse sobre la card
