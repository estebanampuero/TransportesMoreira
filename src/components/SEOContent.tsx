export default function SEOContent() {
  return (
    <section id="seo-content" className="section-dark" aria-labelledby="seo-content-title">
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <header className="mb-16 text-center">
          <p className="text-cyan-400 font-semibold text-sm uppercase tracking-widest mb-3">Guía logística</p>
          <h2 id="seo-content-title" className="font-display text-3xl md:text-4xl font-bold mb-4">
            Todo sobre transporte de carga en el{' '}
            <span className="text-gradient">sur de Chile</span>
          </h2>
        </header>

        <div className="space-y-12">
          {[
            {
              h2: 'Transporte de carga en Puerto Montt',
              h3: '¿Por qué la logística en Puerto Montt tiene características únicas?',
              body: `Puerto Montt es el principal hub logístico del sur de Chile. Su posición geográfica la convierte en punto de entrada y salida para la industria salmonera, forestal, ganadera y de construcción que opera en la Región de Los Lagos y zonas australes. Las empresas que operan aquí enfrentan desafíos que no existen en otras regiones: vías secundarias con pendientes pronunciadas, condiciones climáticas variables y la necesidad frecuente de coordinar traslados hacia zonas con acceso por ferry o barcaza.\n\nUna empresa de transporte local con experiencia real en estos territorios hace la diferencia entre una operación exitosa y un retraso que afecta toda la cadena productiva. En Transportes Moreira llevamos más de 15 años operando rutas en Puerto Montt, Puerto Varas, Osorno, Chiloé y las rutas interiores de la región.`,
            },
            {
              h2: 'Logística en el sur de Chile',
              h3: '¿Qué sectores industriales mueven más carga en la región?',
              body: `El sur de Chile concentra una actividad económica diversa. La industria salmonera requiere traslados frecuentes de equipos de buceo, jaulas metálicas y generadores hacia zonas de difícil acceso. El sector forestal necesita movilizar maquinaria pesada entre faenas que cambian de ubicación cada pocos meses. La industria de la construcción, en pleno crecimiento en Puerto Montt y Puerto Varas, demanda traslados de prefabricados, grúas y materiales a granel de manera continua.\n\nPara todos estos sectores, la variable crítica no es solo el precio del servicio: es la confiabilidad, la disponibilidad y la capacidad de respuesta ante imprevistos. Una máquina inmovilizada en faena puede costar diez veces más que el transporte en sí.`,
            },
            {
              h2: 'Servicios de grúa pluma en Puerto Montt',
              h3: '¿Cuándo necesito contratar una grúa pluma?',
              body: `La grúa pluma es la solución específica para situaciones donde la carga no puede ser movida por medios convencionales. Los casos más comunes incluyen: instalación de equipos en plantas de proceso donde no hay espacio para maniobrar, montaje de estructuras metálicas en naves industriales, posicionamiento de maquinaria en niveles superiores de edificios sin ascensor de carga, y descarga en recintos con acceso restringido.\n\nPara decidir si necesita grúa pluma, lo más eficiente es contactarnos con detalles de la operación: peso de la carga, dimensiones, altura de izaje requerida y tipo de acceso al lugar.`,
            },
            {
              h2: 'Cómo elegir una empresa de transporte de carga en Chile',
              h3: 'Factores que determinan la calidad de un servicio logístico',
              body: `Elegir un proveedor de transporte de carga es una decisión que impacta directamente la continuidad operacional. Los factores realmente importantes son: antigüedad y estado de la flota, experiencia en el tipo de carga específico, cobertura geográfica real en tu zona, capacidad de respuesta ante imprevistos, y nivel de comunicación durante el servicio.\n\nUna empresa seria te dirá claramente qué puede y qué no puede hacer. Verifica también que cuente con seguros de carga vigentes, permisos de circulación al día y conductores con licencias profesionales. Pedir estos antecedentes antes de contratar es una práctica profesional estándar.`,
            },
          ].map((sec) => (
            <article key={sec.h2} className="glass-card p-8">
              <h2 className="font-display text-xl font-bold text-white mb-2">{sec.h2}</h2>
              <h3 className="text-cyan-400 font-semibold text-sm mb-4">{sec.h3}</h3>
              <p className="text-slate-400 leading-relaxed whitespace-pre-line text-sm">{sec.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
