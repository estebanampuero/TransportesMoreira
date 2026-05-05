import { useState } from 'react'
import { useInView } from '../hooks/useInView'

const faqs = [
  { q: '¿Qué tipo de carga transportan?', a: 'Transportamos carga pesada en general: maquinaria industrial, estructuras metálicas, equipos forestales, materiales de construcción a granel, equipos acuícolas y carga general. Nuestro tracto camión maneja hasta 28.000 kg. Si tienes una carga fuera de lo común, consúltanos.' },
  { q: '¿Trabajan fuera de Puerto Montt?', a: 'Sí. Operamos en toda la Región de Los Lagos, incluyendo Puerto Varas, Osorno, Chiloé y zonas insulares. También realizamos servicios hacia Los Ríos, La Araucanía y el resto del país. Tenemos experiencia en rutas de acceso difícil y traslados que requieren combinación con ferry o barcaza.' },
  { q: '¿Cómo coordino un servicio de transporte?', a: 'Contáctanos por el formulario, por teléfono (+56 9 1234 5678) o por WhatsApp. Respondemos en menos de 2 horas hábiles. Para coordinar necesitamos: tipo de carga, peso y dimensiones aproximadas, origen y destino, y fecha tentativa.' },
  { q: '¿Cuánto demora en coordinarse un servicio?', a: 'En servicios estándar coordinamos en 24 a 48 horas hábiles. Para operaciones urgentes, evaluamos disponibilidad según complejidad. También ofrecemos acuerdos de servicio continuos para empresas con necesidades regulares.' },
  { q: '¿Tienen seguro para la carga transportada?', a: 'Sí. Contamos con póliza de seguro de responsabilidad civil para el transporte. Para mercancías de alto valor recomendamos contratar seguro adicional específico para la carga, lo que podemos asesorarte a gestionar.' },
  { q: '¿Qué información necesito para solicitar un servicio?', a: 'Descripción de la carga (qué es, peso, dimensiones), origen y destino exactos, fecha y horario tentativo, y cualquier condición especial (acceso restringido, necesidad de grúa pluma). No es necesario tener todo definido para contactarnos.' },
  { q: '¿Realizan traslados de maquinaria agrícola o forestal?', a: 'Sí, es parte de nuestra especialidad en el sur de Chile. Transportamos tractores, cosechadoras, equipos de riego, procesadoras forestales y skidders. Conocemos los requerimientos de amarre y protección para cada tipo de maquinaria.' },
  { q: '¿Trabajan con empresas constructoras?', a: 'Sí, el sector construcción es uno de nuestros principales segmentos. Trabajamos con constructoras de distintos tamaños para el transporte de prefabricados, acero estructural, equipos de faena y maquinaria pesada. También prestamos servicio de grúa pluma para montaje en obra.' },
]

export default function FAQ() {
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <section id="faq" className="section-alt" aria-labelledby="faq-title">
      <div className="container mx-auto px-6 max-w-3xl relative z-10">
        <div ref={ref} className={`text-center mb-12 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <p className="text-cyan-400 font-semibold text-sm uppercase tracking-widest mb-3">Preguntas frecuentes</p>
          <h2 id="faq-title" className="font-display text-3xl md:text-4xl font-bold mb-4">
            Todo lo que necesitas <span className="text-gradient">saber</span>
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => <FAQItem key={i} question={faq.q} answer={faq.a} index={i} />)}
        </div>
        <div className="mt-12 glass-card p-8 text-center">
          <p className="font-display text-lg font-bold text-white mb-2">¿No encontraste respuesta?</p>
          <p className="text-slate-400 mb-6 text-sm">Escríbenos y te respondemos en menos de 2 horas hábiles.</p>
          <a href="#contacto" className="btn-primary">Hacer una consulta</a>
        </div>
      </div>
    </section>
  )
}

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`glass-card overflow-hidden transition-all duration-300 ${open ? 'border-blue-500/30' : ''}`}>
      <button
        type="button"
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-white pr-4 text-sm">{question}</span>
        <svg className={`w-4 h-4 text-blue-400 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div id={`faq-${index}`} className="px-5 pb-5">
          <p className="text-slate-400 leading-relaxed text-sm">{answer}</p>
        </div>
      )}
    </div>
  )
}
