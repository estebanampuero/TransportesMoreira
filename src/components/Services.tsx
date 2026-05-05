import { useInView } from '../hooks/useInView'

const services = [
  {
    id: 'carga-pesada',
    icon: '🚛',
    title: 'Transporte de Carga Pesada',
    summary: 'Hasta 28.000 kg',
    body: `El transporte de carga pesada requiere planificación, equipos certificados y conductores con experiencia en rutas del sur de Chile. Contamos con tracto camiones de hasta 28.000 kg de capacidad neta para movilizar maquinaria industrial, estructuras metálicas, equipos forestales y materiales de construcción a granel.\n\nCada operación incluye evaluación de ruta previa, documentación de traslado, amarres certificados y seguimiento en tiempo real. La planificación logística es parte de nuestro servicio, no un costo adicional.`,
    color: 'from-blue-500 to-blue-600',
    delay: 0,
  },
  {
    id: 'grua-pluma',
    icon: '🏗️',
    title: 'Servicios de Grúa Pluma',
    summary: 'Izaje hasta 1.700 kg',
    body: `La grúa pluma es la solución cuando la carga necesita posicionarse en altura, espacios confinados o zonas de difícil acceso. Nuestro equipo permite izajes de hasta 1.700 kg con precisión milimétrica.\n\nCasos reales: montaje de estructuras industriales, instalación de equipos en plantas de proceso, descarga de maquinaria en patios con acceso restringido, posicionamiento de prefabricados en obra gruesa. El operador coordina directamente con el encargado de obra para cumplir tiempos de proyecto.`,
    color: 'from-cyan-500 to-cyan-600',
    delay: 150,
  },
  {
    id: 'logistica-industrial',
    icon: '📦',
    title: 'Logística Industrial',
    summary: 'Distribución regular y programada',
    body: `La logística industrial no se trata solo de mover carga: se trata de que los materiales estén en el lugar correcto, en el momento correcto, sin interrumpir la cadena de producción. Ofrecemos distribución regular para empresas con retiros y entregas periódicas.\n\nCamiones rígidos con capacidad de 6.200 kg para distribución de materiales de construcción, insumos industriales y carga general. También servicios de urgencia con menos de 24 horas de anticipación.`,
    color: 'from-indigo-500 to-blue-500',
    delay: 300,
  },
]

export default function Services() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.1 })

  return (
    <section id="servicios" className="section-dark" aria-labelledby="servicios-title">
      {/* Orbs */}
      <div className="orb w-96 h-96 bg-blue-600/10 -top-20 right-0" />

      <div className="container mx-auto px-6 relative z-10">
        <div ref={ref} className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="text-cyan-400 font-semibold text-sm uppercase tracking-widest mb-3">Lo que hacemos</p>
          <h2 id="servicios-title" className="font-display text-3xl md:text-4xl font-bold mb-4">
            Soluciones logísticas para el{' '}
            <span className="text-gradient">sur de Chile</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Servicios de transporte diseñados para empresas que no pueden permitirse demoras ni improvisaciones.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {services.map((s) => <ServiceCard key={s.id} {...s} />)}
        </div>

        <div className="mt-12 text-center">
          <a href="#contacto" className="btn-primary inline-flex items-center gap-2">
            Consultar disponibilidad
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
        </div>
      </div>
    </section>
  )
}

function ServiceCard({ icon, title, summary, body, delay }: {
  icon: string; title: string; summary: string; body: string; color: string; delay: number
}) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.1 })
  return (
    <article
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`glass-card-hover p-8 shadow-glass group transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="text-4xl mb-5">{icon}</div>
      <h3 className="font-display text-xl font-bold text-white mb-1">{title}</h3>
      <p className="text-cyan-400 text-sm font-medium mb-4">{summary}</p>
      <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{body}</p>
    </article>
  )
}
