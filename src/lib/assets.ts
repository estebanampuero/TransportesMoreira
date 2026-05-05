/**
 * REGISTRO CENTRAL DE IMÁGENES Y RECURSOS
 * =========================================
 * Todas las URLs de medios del sitio viven aquí.
 *
 * CARPETA LOCAL: /public/media/fleet/ → acceso vía /media/fleet/archivo.jpg
 * FIREBASE STORAGE: sube en console.firebase.google.com → Storage → copia la URL de descarga
 */

// ─── Hero ────────────────────────────────────────────────────────────────────
export const HERO_VIDEO = {
  src: 'https://assets.mixkit.co/videos/preview/mixkit-highway-in-the-middle-of-a-mountain-range-4433-large.mp4',
  poster: '/hero-poster.jpg',
  description: 'Video hero: carretera en montaña, sur de Chile — reemplaza con video propio',
}

export const HERO_POSTER = {
  src: '/hero-poster.jpg',
  description: 'Imagen de fallback hero 1920×1080 — coloca el archivo en /public/hero-poster.jpg',
}

// ─── OG / SEO ────────────────────────────────────────────────────────────────
export const OG_IMAGE = {
  src: 'https://transportesmoreira.cl/og-image.jpg',
  description: 'Open Graph 1200×630 — coloca en /public/og-image.jpg o usa URL de Firebase Storage',
}

// ─── Flota — fichas de vehículos ─────────────────────────────────────────────
// coverImage: ruta local (/media/fleet/...) o URL de Firebase Storage
// coverVideo: opcional — se reproduce en hover (máx 5 MB, H.264 mp4)
// features: lista de características que se muestran como chips en la card
export const FLEET_VEHICLES = [
  {
    id: 'tracto-camion',
    type: 'Tracto Camión',
    model: 'Volvo NL12',
    capacity: '28.000',
    coverImage: '/media/fleet/tracto-camion.jpg',
    coverVideo: '/media/fleet/tracto-camion.mp4',
    description: 'Carga pesada de largo recorrido hasta 28.000 kg. Ideal para maquinaria industrial, estructuras metálicas y materiales a granel en rutas del sur de Chile.',
    features: ['Carrocería plana extensible', 'Cama baja disponible', 'Amarres industriales', 'Permiso cargas especiales', 'Seguimiento en tiempo real'],
    alt: 'Tracto Camión Volvo NL12 — Transportes Moreira Puerto Montt',
  },
  {
    id: 'grua-pluma',
    type: 'Camión Grúa Pluma',
    model: 'Chevrolet NQR 911',
    capacity: '1.700',
    coverImage: '/media/fleet/grua-pluma.jpg',
    coverVideo: '/media/fleet/grua-pluma.mp4',
    description: 'Izaje y posicionamiento de hasta 1.700 kg con precisión milimétrica. Zonas confinadas, montaje de equipos industriales y estructuras en altura.',
    features: ['Grúa hidráulica 1.700 kg', 'Radio de acción 6 m', 'Ideal zonas confinadas', 'Operador certificado', 'Coordinación directa en obra'],
    alt: 'Camión Grúa Pluma Chevrolet NQR 911 — Transportes Moreira',
  },
  {
    id: 'camion-rigido',
    type: 'Camión Rígido',
    model: 'Chevrolet NQR 919',
    capacity: '6.200',
    coverImage: '/media/fleet/camion-rigido.jpg',
    coverVideo: '/media/fleet/camion-rigido.mp4',
    description: 'Distribución y carga general hasta 6.200 kg. Múltiples destinos por viaje, rutas urbanas e intercomunales en la Región de Los Lagos.',
    features: ['Carrocería cerrada disponible', 'Múltiples destinos por viaje', 'Ideal zonas urbanas', 'Flexibilidad horaria', 'Servicio de urgencia 24 h'],
    alt: 'Camión Rígido Chevrolet NQR 919 — Transportes Moreira',
  },
]

// ─── Testimonios ────────────────────────────────────────────────────────────
export const TESTIMONIAL_AVATARS = {
  juanPerez: {
    src: 'https://placehold.co/80x80/1e3a8a/ffffff?text=JP',
    description: 'Avatar Juan Pérez — reemplaza con foto real 80×80',
    alt: 'Juan Pérez',
  },
  anaGonzalez: {
    src: 'https://placehold.co/80x80/1e3a8a/ffffff?text=AG',
    description: 'Avatar Ana González — reemplaza con foto real 80×80',
    alt: 'Ana González',
  },
  carlosMunoz: {
    src: 'https://placehold.co/80x80/1e3a8a/ffffff?text=CM',
    description: 'Avatar Carlos Muñoz — reemplaza con foto real 80×80',
    alt: 'Carlos Muñoz',
  },
  patriciaSoto: {
    src: 'https://placehold.co/80x80/1e3a8a/ffffff?text=PS',
    description: 'Avatar Patricia Soto — reemplaza con foto real 80×80',
    alt: 'Patricia Soto',
  },
}

// ─── Logos de clientes ───────────────────────────────────────────────────────
export const CLIENT_LOGOS = [
  { src: 'https://placehold.co/160x48/ffffff/94a3b8?text=Cliente+1', alt: 'Cliente 1', description: 'Logo 160×48 — reemplaza con logos reales' },
  { src: 'https://placehold.co/160x48/ffffff/94a3b8?text=Cliente+2', alt: 'Cliente 2', description: 'Logo 160×48' },
  { src: 'https://placehold.co/160x48/ffffff/94a3b8?text=Cliente+3', alt: 'Cliente 3', description: 'Logo 160×48' },
  { src: 'https://placehold.co/160x48/ffffff/94a3b8?text=Cliente+4', alt: 'Cliente 4', description: 'Logo 160×48' },
  { src: 'https://placehold.co/160x48/ffffff/94a3b8?text=Cliente+5', alt: 'Cliente 5', description: 'Logo 160×48' },
]

// ─── Logo y favicon ──────────────────────────────────────────────────────────
export const LOGO = {
  src: '/logo.png',
  description: 'Logo Transportes Moreira — SVG o PNG transparente 200×60 — coloca en /public/logo.png',
  alt: 'Transportes Moreira',
}

export const FAVICON = {
  src: '/favicon.png',
  description: 'Favicon 32×32 y 180×180 para Apple touch icon',
}

// ─── Firebase Storage paths ───────────────────────────────────────────────────
export const STORAGE_PATHS = {
  leadPhotos:   'leads/photos/',        // fotos de solicitudes de clientes
  driverCovers: 'drivers/covers/',      // imagen/video de portada por camión
  driverDocs:   'drivers/docs/',        // documentos del transportista (futuro)
} as const

// Tipos exportados para uso en componentes
export type FleetVehicle = typeof FLEET_VEHICLES[number]

// FLEET_IMAGES kept for any components that still reference it
export const FLEET_IMAGES = {
  tractoCamion: { src: FLEET_VEHICLES[0].coverImage, alt: FLEET_VEHICLES[0].alt },
  gruaPluma:    { src: FLEET_VEHICLES[1].coverImage, alt: FLEET_VEHICLES[1].alt },
  camionRigido: { src: FLEET_VEHICLES[2].coverImage, alt: FLEET_VEHICLES[2].alt },
}
