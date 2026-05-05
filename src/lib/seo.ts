export const SITE = {
  name: 'Transportes Moreira',
  url: 'https://transportesmoreira.cl',
  phone: '+56912345678',
  phoneDisplay: '+56 9 1234 5678',
  whatsapp: '56912345678',
  email: 'contacto@transportesmoreira.cl',
  address: 'Puerto Montt, Región de Los Lagos, Chile',
  city: 'Puerto Montt',
  region: 'Los Lagos',
  country: 'Chile',
} as const

export function buildWhatsAppUrl(message: string, source: string): string {
  const text = encodeURIComponent(`${message} (${source})`)
  return `https://wa.me/${SITE.whatsapp}?text=${text}`
}

export const DEFAULT_WHATSAPP_MESSAGE =
  'Hola, necesito información sobre servicios de transporte de carga.'
