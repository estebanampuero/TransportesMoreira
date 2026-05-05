import { SITE, buildWhatsAppUrl, DEFAULT_WHATSAPP_MESSAGE } from '../lib/seo'
import { trackWhatsAppClick, trackPhoneClick, trackCTAClick } from '../lib/analytics'
import { HERO_VIDEO } from '../lib/assets'

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center text-white overflow-hidden"
      aria-label="Inicio"
    >
      {/* Background video */}
      <video
        autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster={HERO_VIDEO.poster}
        aria-hidden="true"
      >
        <source src={HERO_VIDEO.src} type="video/mp4" />
      </video>

      {/* Dark overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/70 to-slate-950/90" />

      {/* Decorative orbs */}
      <div className="orb w-96 h-96 bg-blue-600/20 top-1/4 -left-20 animate-pulse-slow" />
      <div className="orb w-80 h-80 bg-cyan-500/15 bottom-1/4 -right-10 animate-pulse-slow" style={{ animationDelay: '2s' }} />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full text-sm text-cyan-300 font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Puerto Montt · Sur de Chile · +15 años
        </div>

        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
          Transporte de carga en{' '}
          <span className="text-gradient">Puerto Montt</span>
          <br />y sur de Chile
        </h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Soluciones de logística industrial, carga pesada y grúa pluma para empresas de la Región de Los Lagos. Respuesta en menos de 2 horas hábiles.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#contacto"
            onClick={() => trackCTAClick('hero_contact', 'hero')}
            className="btn-primary text-base px-8 py-4"
          >
            Solicitar atención
          </a>
          <a
            href={buildWhatsAppUrl(DEFAULT_WHATSAPP_MESSAGE, 'hero')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick('hero')}
            className="flex items-center justify-center gap-2 bg-[#25D366]/20 border border-[#25D366]/40 text-white font-semibold px-8 py-4 rounded-xl hover:bg-[#25D366]/30 transition-all hover:scale-105"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.553 4.118 1.522 5.855L.057 23.882l6.196-1.424A11.937 11.937 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 01-5.032-1.383l-.36-.214-3.733.857.887-3.65-.234-.374A9.786 9.786 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z"/></svg>
            WhatsApp
          </a>
          <a
            href={`tel:${SITE.phone}`}
            onClick={() => trackPhoneClick('hero')}
            className="btn-glass text-base px-8 py-4 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            Llamar ahora
          </a>
        </div>

        {/* Trust metrics */}
        <div className="mt-20 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { val: '+15', label: 'Años' },
            { val: '+2.000', label: 'Servicios' },
            { val: '98%', label: 'Satisfacción' },
          ].map((m) => (
            <div key={m.label} className="glass-card p-4 text-center">
              <p className="font-display text-2xl font-bold text-gradient">{m.val}</p>
              <p className="text-slate-400 text-xs mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 text-xs animate-float">
        <span>Explorar</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
    </section>
  )
}
