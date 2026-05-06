import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useInView } from '../hooks/useInView'
import { buildWhatsAppUrl } from '../lib/seo'

// ─── Types ─────────────────────────────────────────────────────────────────
interface FleetDriver {
  id: number
  name: string
  truckType: string
  truckPlate?: string
  capacity?: string
  description?: string
  coverImage?: string
  coverVideo?: string
  features?: string[]
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function truckIcon(type: string): string {
  const t = type.toLowerCase()
  if (t.includes('grúa') || t.includes('grua') || t.includes('pluma')) return '🏗️'
  if (t.includes('rígido') || t.includes('rigido')) return '🚚'
  return '🚛'
}

// ─── Skeleton card ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="fleet-card animate-pulse">
      <div className="bg-slate-800/60" style={{ aspectRatio: '16/9' }} />
      <div className="p-6 flex flex-col gap-4">
        <div>
          <div className="h-5 w-2/3 bg-slate-700/60 rounded-lg mb-2" />
          <div className="h-3.5 w-1/3 bg-slate-800/60 rounded-lg" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-slate-800/60 rounded" />
          <div className="h-3 w-4/5 bg-slate-800/60 rounded" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3].map((i) => <div key={i} className="h-6 w-24 bg-slate-800/60 rounded-full" />)}
        </div>
        <div className="h-10 w-full bg-slate-800/60 rounded-xl mt-auto" />
      </div>
    </div>
  )
}

// ─── Empty state ────────────────────────────────────────────────────────────
function EmptyFleet() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center mb-6">
        <span className="text-4xl select-none">🚛</span>
      </div>
      <h3 className="font-display text-xl font-bold text-white mb-2">Flota en preparación</h3>
      <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-6">
        Estamos catalogando nuestra flota. Contáctanos para consultar los equipos disponibles.
      </p>
      <a href="#contacto" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm">
        Consultar disponibilidad
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </a>
    </div>
  )
}

// ─── Media area ─────────────────────────────────────────────────────────────
function MediaArea({ coverImage, coverVideo, truckType, capacity }: {
  coverImage?: string; coverVideo?: string; truckType: string; capacity?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hovered, setHovered] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (hovered) { v.play().catch(() => {}) } else { v.pause(); v.currentTime = 0 }
  }, [hovered])

  const icon = truckIcon(truckType)
  const hasImage = !!coverImage && !imgError
  const hasVideo = !!coverVideo

  return (
    <div className="relative overflow-hidden bg-slate-900" style={{ aspectRatio: '16/9' }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {hasVideo ? (
        <video ref={videoRef} src={coverVideo} muted loop playsInline
          poster={hasImage ? coverImage : undefined}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      ) : hasImage ? (
        <img src={coverImage} alt={truckType} onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 gap-3">
          <span className="text-6xl opacity-20 group-hover:opacity-35 transition-opacity duration-500 select-none">{icon}</span>
          <span className="text-xs text-slate-600 tracking-widest uppercase">Sin foto aún</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent pointer-events-none" />
      {capacity && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-blue-400/30 shadow-lg">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
          {capacity} kg
        </div>
      )}
      {hasVideo && !hovered && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Fleet Card ─────────────────────────────────────────────────────────────
function FleetCard({ driver, delay }: { driver: FleetDriver; delay: number }) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.08 })
  const waMsg = `Hola, me interesa conocer más sobre el ${driver.truckType}${driver.truckPlate ? ` (${driver.truckPlate})` : ''}. ¿Me pueden dar información?`

  return (
    <article ref={ref} style={{ transitionDelay: `${delay}ms` }}
      className={`fleet-card group transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <MediaArea coverImage={driver.coverImage} coverVideo={driver.coverVideo}
        truckType={driver.truckType} capacity={driver.capacity} />
      <div className="p-6 flex flex-col gap-4 flex-1">
        <div>
          <h3 className="font-display text-xl font-bold text-white leading-tight">{driver.truckType}</h3>
          {driver.truckPlate && <p className="text-slate-500 text-sm font-mono tracking-wide mt-0.5">{driver.truckPlate}</p>}
        </div>
        {driver.description && (
          <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">{driver.description}</p>
        )}
        {driver.features && driver.features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {driver.features.map((f) => (
              <span key={f} className="inline-flex items-center gap-1 text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
                <svg className="w-2.5 h-2.5 text-cyan-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {f}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto pt-2">
          <a href={buildWhatsAppUrl(waMsg, 'fleet_card')} target="_blank" rel="noopener noreferrer"
            className="fleet-cta group/btn w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.553 4.118 1.522 5.855L.057 23.882l6.196-1.424A11.937 11.937 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 01-5.032-1.383l-.36-.214-3.733.857.887-3.65-.234-.374A9.786 9.786 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z" />
            </svg>
            Consultar disponibilidad
            <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  )
}

// ─── Fleet Section ──────────────────────────────────────────────────────────
export default function Fleet() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.05 })
  const [drivers, setDrivers] = useState<FleetDriver[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('drivers')
        .select('id, name, cover_image, cover_video, features, trucks(truck_type, truck_plate, capacity, description)')
        .eq('show_in_fleet', true)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setDrivers(data.map((d: any) => {
          const truck = Array.isArray(d.trucks) ? d.trucks[0] : d.trucks
          return {
            id: d.id,
            name: d.name,
            truckType:   truck?.truck_type  ?? 'Camión',
            truckPlate:  truck?.truck_plate ?? undefined,
            capacity:    truck?.capacity    ?? undefined,
            description: truck?.description ?? undefined,
            coverImage:  d.cover_image || undefined,
            coverVideo:  d.cover_video || undefined,
            features:    d.features ?? [],
          }
        }))
      }
      setLoading(false)
    }

    load()

    // Realtime: refresh when drivers table changes
    const channel = supabase
      .channel('fleet-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, load)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <section id="flota" className="section-alt" aria-labelledby="flota-title">
      <div className="orb w-96 h-96 bg-cyan-500/8 top-10 -left-24" />
      <div className="orb w-72 h-72 bg-blue-600/8 bottom-10 -right-10" />
      <div className="container mx-auto px-6 relative z-10">
        <div ref={ref} className={`text-center mb-16 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full text-xs text-cyan-300 font-semibold uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Equipamiento de flota
          </div>
          <h2 id="flota-title" className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
            Flota <span className="text-gradient">moderna y certificada</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Vehículos con mantención preventiva, documentación al día y operadores certificados para el sur de Chile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
          {loading
            ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
            : drivers.length === 0
              ? <EmptyFleet />
              : drivers.map((d, i) => <FleetCard key={d.id} driver={d} delay={i * 120} />)
          }
        </div>

        {!loading && drivers.length > 0 && (
          <div className={`mt-14 fleet-cta-strip rounded-2xl p-8 text-center transition-all duration-700 delay-300 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <p className="text-slate-300 text-sm mb-1 font-medium uppercase tracking-widest">¿Necesitas un equipo específico?</p>
            <h3 className="font-display text-xl md:text-2xl font-bold text-white mb-4">Cotiza directamente con nuestro equipo</h3>
            <a href="#contacto" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
              Solicitar cotización
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
