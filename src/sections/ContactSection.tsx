import ContactForm from '../components/ContactForm'
import { SITE } from '../lib/seo'

export default function ContactSection() {
  return (
    <section id="contacto" className="section-alt" aria-labelledby="contacto-title">
      <div className="orb w-80 h-80 bg-blue-600/10 -top-10 right-0" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-cyan-400 font-semibold text-sm uppercase tracking-widest mb-3">Contacto</p>
            <h2 id="contacto-title" className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              ¿Listo para coordinar tu{' '}
              <span className="text-gradient">próximo traslado?</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Cuéntanos qué necesitas y nuestro equipo te contactará a la brevedad. Sin cotización automática, con atención personalizada.
            </p>
            <ul className="space-y-5">
              {[
                { icon: '⏱', title: 'Respuesta rápida', desc: 'Respondemos en menos de 2 horas hábiles, lun–vie 8:00–18:00' },
                { icon: '🛡', title: 'Sin compromiso inicial', desc: 'Solo te contactaremos para asesorarte. Sin presión, sin automatismos.' },
                { icon: '📍', title: SITE.address, desc: 'Operaciones en toda la Región de Los Lagos y sur de Chile' },
              ].map((i) => (
                <li key={i.title} className="flex items-start gap-4">
                  <span className="text-2xl">{i.icon}</span>
                  <div>
                    <p className="font-semibold text-white text-sm">{i.title}</p>
                    <p className="text-slate-500 text-sm">{i.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
