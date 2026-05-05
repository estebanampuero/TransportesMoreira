import { useInView } from '../hooks/useInView'
import { TESTIMONIAL_AVATARS } from '../lib/assets'

const testimonials = [
  { quote: 'Llevamos tres años trabajando con Transportes Moreira para el traslado de maquinaria entre nuestras faenas. La puntualidad y el cuidado en la carga son consistentes en cada servicio.', author: 'Juan Pérez', role: 'Jefe de Operaciones', company: 'Constructora Sur S.A.', avatar: TESTIMONIAL_AVATARS.juanPerez, delay: 0 },
  { quote: 'Cuando necesitamos montar equipos en zonas de difícil acceso, la grúa pluma de Moreira es la solución. Su operador conoce bien los ángulos de trabajo y el equipo siempre llega preparado.', author: 'Ana González', role: 'Gerente de Proyectos', company: 'Agro-Austral Ltda.', avatar: TESTIMONIAL_AVATARS.anaGonzalez, delay: 150 },
  { quote: 'Necesitábamos un transportista confiable para traslados de equipos acuícolas hacia Chiloé. Transportes Moreira conoce esas rutas y los tiempos reales. Sin sorpresas, sin retrasos injustificados.', author: 'Carlos Muñoz', role: 'Coordinador Logístico', company: 'Salmon del Sur SpA', avatar: TESTIMONIAL_AVATARS.carlosMunoz, delay: 300 },
  { quote: 'Lo que más valoro es la comunicación directa. Cuando hay algún imprevisto en ruta, me avisan de inmediato. Esa transparencia marca la diferencia cuando tienes una faena esperando el equipo.', author: 'Patricia Soto', role: 'Administradora de Obras', company: 'Inmobiliaria Los Lagos', avatar: TESTIMONIAL_AVATARS.patriciaSoto, delay: 450 },
]

const stats = [
  { val: '+15', label: 'Años de experiencia' },
  { val: '+2.000', label: 'Servicios completados' },
  { val: '+130', label: 'Clientes activos' },
  { val: '98%', label: 'Satisfacción' },
]

export default function Testimonials() {
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <section id="testimonios" className="section-dark" aria-labelledby="testimonios-title">
      <div className="orb w-96 h-96 bg-blue-500/10 -bottom-20 -right-20" />
      <div className="container mx-auto px-6 relative z-10">
        {/* Stats */}
        <div ref={ref} className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {stats.map((s) => (
            <div key={s.label} className="glass-card p-6 text-center shadow-glass">
              <p className="font-display text-3xl font-extrabold text-gradient mb-1">{s.val}</p>
              <p className="text-slate-400 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="text-center mb-12">
          <p className="text-cyan-400 font-semibold text-sm uppercase tracking-widest mb-3">Testimonios</p>
          <h2 id="testimonios-title" className="font-display text-3xl md:text-4xl font-bold">
            Lo que dicen nuestros <span className="text-gradient">clientes</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t) => <TestimonialCard key={t.author} {...t} />)}
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ quote, author, role, company, avatar, delay }: {
  quote: string; author: string; role: string; company: string
  avatar: { src: string; alt: string }; delay: number
}) {
  const { ref, inView } = useInView<HTMLQuoteElement>()
  return (
    <blockquote
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`glass-card p-8 border-l-2 border-blue-500 shadow-glass transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <svg className="w-7 h-7 text-blue-500/40 mb-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
      <p className="text-slate-300 leading-relaxed mb-6 italic">"{quote}"</p>
      <footer className="flex items-center gap-3">
        <img src={avatar.src} alt={avatar.alt} loading="lazy" className="w-10 h-10 rounded-full" width={40} height={40} />
        <div>
          <cite className="font-bold text-white not-italic text-sm">{author}</cite>
          <p className="text-slate-500 text-xs">{role} · {company}</p>
        </div>
      </footer>
    </blockquote>
  )
}
