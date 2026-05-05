import { SITE, buildWhatsAppUrl, DEFAULT_WHATSAPP_MESSAGE } from '../lib/seo'
import { trackWhatsAppClick, trackPhoneClick } from '../lib/analytics'

const navLinks = [
  { href: '#servicios', label: 'Servicios' },
  { href: '#flota', label: 'Flota' },
  { href: '#testimonios', label: 'Testimonios' },
  { href: '#faq', label: 'Preguntas frecuentes' },
  { href: '#contacto', label: 'Contacto' },
]

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/8 text-slate-400">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <p className="font-display text-xl font-bold text-white mb-4">
              Transportes<span className="text-gradient">Moreira</span>
            </p>
            <p className="text-sm leading-relaxed mb-4 text-slate-500">
              Empresa de transporte de carga pesada, grúa pluma y logística industrial en Puerto Montt y el sur de Chile.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest">Navegación</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm hover:text-white transition-colors">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest">Contacto directo</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`tel:${SITE.phone}`} onClick={() => trackPhoneClick('footer')} className="flex items-center gap-3 hover:text-white transition-colors">
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} className="flex items-center gap-3 hover:text-white transition-colors">
                  <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="text-slate-500">{SITE.address}</span>
              </li>
              <li>
                <a href={buildWhatsAppUrl(DEFAULT_WHATSAPP_MESSAGE, 'footer')} target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsAppClick('footer')} className="flex items-center gap-3 hover:text-white transition-colors">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.553 4.118 1.522 5.855L.057 23.882l6.196-1.424A11.937 11.937 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 01-5.032-1.383l-.36-.214-3.733.857.887-3.65-.234-.374A9.786 9.786 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z"/></svg>
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
          <p>&copy; {new Date().getFullYear()} Transportes Moreira. Todos los derechos reservados.</p>
          <div className="flex items-center gap-5">
            {['facebook', 'instagram', 'linkedin'].map((net) => (
              <a key={net} href={`https://www.${net}.com/transportesmoreira`} target="_blank" rel="noopener noreferrer" aria-label={net} className="hover:text-white transition-colors capitalize">{net.charAt(0).toUpperCase() + net.slice(1)}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
