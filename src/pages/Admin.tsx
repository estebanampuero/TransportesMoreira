import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

const ADMIN_USER = 'admin'
const ADMIN_PASS = 'moreira2025'
const SESSION_KEY = 'tm_admin_auth'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Driver {
  id: number
  name: string; phone: string; email: string
  truckType: string; truckPlate: string; capacity: string; description: string
  lat: number | null; lng: number | null
  lastLocationUpdate: string | null
  status: 'pending' | 'active' | 'inactive'
  isPublic: boolean
  showInFleet: boolean
  coverImage: string; coverVideo: string
  features: string[]
}

interface Lead {
  id: number
  name: string; company: string; phone: string; email: string
  cargoType: string; origin: string; destination: string
  weight: string; message: string; photos: string[]
  status: 'new' | 'contacted' | 'closed' | 'lost'
  createdAt: string | null
}

function mapDriver(d: any): Driver {
  const truck = Array.isArray(d.trucks) ? d.trucks[0] : d.trucks
  const loc   = Array.isArray(d.locations_current) ? d.locations_current[0] : d.locations_current
  return {
    id:   d.id,
    name: d.name,
    phone:  d.phone  ?? '',
    email:  d.email  ?? '',
    truckType:  truck?.truck_type  ?? '',
    truckPlate: truck?.truck_plate ?? '',
    capacity:   truck?.capacity    ?? '',
    description: truck?.description ?? '',
    lat: loc?.lat ?? null,
    lng: loc?.lng ?? null,
    lastLocationUpdate: loc?.updated_at ?? null,
    status:      d.status,
    isPublic:    d.is_public,
    showInFleet: d.show_in_fleet,
    coverImage:  d.cover_image ?? '',
    coverVideo:  d.cover_video ?? '',
    features:    d.features    ?? [],
  }
}

function mapLead(l: any): Lead {
  return {
    id:          l.id,
    name:        l.name        ?? '',
    company:     l.company     ?? '',
    phone:       l.phone       ?? '',
    email:       l.email       ?? '',
    cargoType:   l.cargo_type  ?? '',
    origin:      l.origin      ?? '',
    destination: l.destination ?? '',
    weight:      l.weight      ?? '',
    message:     l.message     ?? '',
    photos:      l.photos      ?? [],
    status:      l.status,
    createdAt:   l.created_at  ?? null,
  }
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(() => localStorage.getItem(SESSION_KEY) === '1')
  if (!authed) return <LoginPage onLogin={() => { localStorage.setItem(SESSION_KEY, '1'); setAuthed(true) }} />
  return <Dashboard onLogout={() => { localStorage.removeItem(SESSION_KEY); setAuthed(false) }} />
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [err, setErr] = useState('')
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-white mb-1">Transportes<span className="text-gradient">Moreira</span></h1>
          <p className="text-slate-500 text-sm">Panel de administración</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); u === ADMIN_USER && p === ADMIN_PASS ? onLogin() : setErr('Credenciales incorrectas.') }}
          className="glass-card p-8 shadow-glass space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Usuario</label>
            <input value={u} onChange={(e) => setU(e.target.value)} className="input-dark" placeholder="admin" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Contraseña</label>
            <input type="password" value={p} onChange={(e) => setP(e.target.value)} className="input-dark" placeholder="••••••••" required />
          </div>
          {err && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg">{err}</p>}
          <button type="submit" className="w-full btn-primary py-3">Ingresar</button>
        </form>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
type Tab = 'erp' | 'crm'
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab]         = useState<Tab>('erp')
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [leads, setLeads]     = useState<Lead[]>([])

  useEffect(() => {
    async function loadDrivers() {
      const { data } = await supabase
        .from('drivers')
        .select('id, name, phone, email, status, is_public, show_in_fleet, cover_image, cover_video, features, trucks(truck_type, truck_plate, capacity, description), locations_current(lat, lng, updated_at)')
        .order('created_at', { ascending: false })
      if (data) setDrivers(data.map(mapDriver))
    }

    async function loadLeads() {
      const { data } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setLeads(data.map(mapLead))
    }

    loadDrivers()
    loadLeads()

    const ch1 = supabase.channel('admin-drivers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' },         loadDrivers)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trucks' },          loadDrivers)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'locations_current' }, loadDrivers)
      .subscribe()

    const ch2 = supabase.channel('admin-leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, loadLeads)
      .subscribe()

    return () => { supabase.removeChannel(ch1); supabase.removeChannel(ch2) }
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="bg-slate-900/95 backdrop-blur-xl border-b border-white/10 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-display font-bold text-white text-sm">
            Transportes<span className="text-gradient">Moreira</span>
            <span className="text-slate-500 font-sans font-normal text-xs ml-2">Admin</span>
          </span>
          <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
            {([['erp', `🚛 ERP (${drivers.length})`], ['crm', `📋 CRM (${leads.length})`]] as [Tab, string][]).map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${tab === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-slate-400">Tiempo real</span>
          </div>
        </div>
        <button onClick={onLogout} className="text-slate-400 hover:text-white text-xs transition flex items-center gap-1.5 ml-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Salir
        </button>
      </header>
      <main className="p-6">
        {tab === 'erp' ? <ERPPanel drivers={drivers} /> : <CRMPanel leads={leads} />}
      </main>
    </div>
  )
}

// ─── ERP ──────────────────────────────────────────────────────────────────────
function ERPPanel({ drivers }: { drivers: Driver[] }) {
  const [selected, setSelected]   = useState<Driver | null>(null)
  const [locModal, setLocModal]   = useState<Driver | null>(null)
  const [mediaModal, setMediaModal] = useState<Driver | null>(null)
  const [copied, setCopied]       = useState<string | null>(null)
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<mapboxgl.Map | null>(null)
  const markersRef   = useRef<Map<number, mapboxgl.Marker>>(new Map())

  const togglePublic = (d: Driver) =>
    supabase.from('drivers').update({ is_public: !d.isPublic }).eq('id', d.id)

  const toggleStatus = (d: Driver) =>
    supabase.from('drivers').update({ status: d.status === 'active' ? 'inactive' : 'active' }).eq('id', d.id)

  const toggleShowInFleet = (d: Driver) =>
    supabase.from('drivers').update({ show_in_fleet: !d.showInFleet }).eq('id', d.id)

  const saveMedia = (d: Driver, data: { coverImage: string; coverVideo: string; features: string[] }) =>
    supabase.from('drivers').update({ cover_image: data.coverImage, cover_video: data.coverVideo, features: data.features }).eq('id', d.id)

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-72.9424, -41.4693],
      zoom: 7,
      attributionControl: false,
    })
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const ids = new Set(drivers.filter((d) => d.lat).map((d) => d.id))
    markersRef.current.forEach((m, id) => { if (!ids.has(id)) { m.remove(); markersRef.current.delete(id) } })

    drivers.forEach((d) => {
      if (!d.lat || !d.lng) return
      const color = d.isPublic && d.status === 'active' ? '#22c55e' : d.status === 'active' ? '#3b82f6' : '#64748b'
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="font-family:Inter,sans-serif">
          <strong style="color:#f1f5f9">${esc(d.name)}</strong><br/>
          <span style="color:#94a3b8;font-size:11px">${esc(d.truckType)}</span><br/>
          <span style="color:${color};font-size:11px;font-weight:600">${esc(d.status)} ${d.isPublic ? '· visible en web' : ''}</span>
        </div>
      `)

      if (markersRef.current.has(d.id)) {
        markersRef.current.get(d.id)!.setLngLat([d.lng, d.lat])
      } else {
        const m = new mapboxgl.Marker({ color }).setLngLat([d.lng, d.lat]).setPopup(popup).addTo(map)
        markersRef.current.set(d.id, m)
      }
    })
  }, [drivers])

  const active       = drivers.filter((d) => d.status === 'active').length
  const publicCount  = drivers.filter((d) => d.isPublic && d.status === 'active').length
  const inFleetCount = drivers.filter((d) => d.showInFleet).length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total registrados', val: drivers.length, color: 'text-gradient' },
          { label: 'Activos',           val: active,          color: 'text-green-400' },
          { label: 'En mapa web',       val: publicCount,     color: 'text-blue-400'  },
          { label: 'En flota web',      val: inFleetCount,    color: 'text-cyan-400'  },
        ].map((s) => (
          <div key={s.label} className="glass-card p-5 text-center">
            <p className={`font-display text-2xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-slate-400 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            <span className="text-sm font-semibold">Mapa de flota — tiempo real</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />Activo + visible en web</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />Activo (privado)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block" />Inactivo</span>
          </div>
        </div>
        <div ref={mapContainer} style={{ height: '360px' }} />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold">Transportistas registrados</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            <span className="text-blue-400">Mapa web</span> — aparece en el mapa en tiempo real del sitio &nbsp;·&nbsp;
            <span className="text-cyan-400">Flota web</span> — aparece en la sección "Flota moderna y certificada"
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-500 text-xs uppercase">
                {['Nombre', 'Teléfono', 'Tipo', 'Patente', 'Estado', 'Mapa web', 'Flota web', 'GPS', 'Acciones'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {drivers.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-10 text-slate-500 text-sm">Sin transportistas aún.</td></tr>
              ) : drivers.map((d) => (
                <tr key={d.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{d.name}</td>
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                    <a href={`tel:${d.phone}`} className="hover:text-blue-400 transition">{d.phone}</a>
                  </td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">{d.truckType || '—'}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{d.truckPlate || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStatus(d)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition ${
                        d.status === 'active'
                          ? 'bg-green-500/15 border-green-500/30 text-green-400 hover:bg-green-500/25'
                          : d.status === 'pending'
                          ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/25'
                          : 'bg-slate-700/50 border-slate-600/50 text-slate-400 hover:bg-slate-700'
                      }`}>
                      {d.status}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => togglePublic(d)}
                      title={d.isPublic ? 'Visible en mapa web — clic para ocultar' : 'Oculto en mapa web — clic para mostrar'}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${d.isPublic && d.status === 'active' ? 'bg-blue-600' : 'bg-slate-700'}`}>
                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${d.isPublic && d.status === 'active' ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleShowInFleet(d)}
                      title={d.showInFleet ? 'Visible en sección Flota — clic para quitar' : 'No aparece en sección Flota — clic para agregar'}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${d.showInFleet ? 'bg-cyan-600' : 'bg-slate-700'}`}>
                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${d.showInFleet ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => copyText(String(d.id), String(d.id))}
                      title="Copiar Driver ID para integración GPS"
                      className="text-xs px-2 py-1 glass-card hover:border-blue-500/30 transition flex items-center gap-1">
                      {copied === String(d.id) ? '✓ copiado' : '📡 ID GPS'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setSelected(d)} className="text-xs px-2.5 py-1 glass-card hover:border-blue-500/30 transition">Ver</button>
                      <button onClick={() => setLocModal(d)} className="text-xs px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition whitespace-nowrap">📍 Ubicar</button>
                      <button onClick={() => setMediaModal(d)} className="text-xs px-2.5 py-1 bg-purple-500/10 border border-purple-500/25 text-purple-300 rounded-lg hover:bg-purple-500/20 transition whitespace-nowrap">🖼 Ficha</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <GPSIntegrationGuide drivers={drivers} onCopy={copyText} copied={copied} />

      {selected   && <DriverDetail driver={selected} onClose={() => setSelected(null)} onTogglePublic={togglePublic} onToggleStatus={toggleStatus} onToggleShowInFleet={toggleShowInFleet} />}
      {locModal   && <LocationUpdateModal driver={locModal} onClose={() => setLocModal(null)} />}
      {mediaModal && <MediaFichaModal driver={mediaModal} onClose={() => setMediaModal(null)} onSave={(data) => { saveMedia(mediaModal, data); setMediaModal(null) }} />}
    </div>
  )
}

// ─── GPS Integration Guide ────────────────────────────────────────────────────
function GPSIntegrationGuide({ drivers, onCopy, copied }: {
  drivers: Driver[]
  onCopy: (text: string, key: string) => void
  copied: string | null
}) {
  const [open, setOpen] = useState(false)
  const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  as string
  const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY as string
  const endpoint = `${SUPABASE_URL}/rest/v1/locations_current`

  const sampleBody = (driverId: number | string) => `{
  "driver_id": ${driverId},
  "lat": -41.4693,
  "lng": -72.9424
}`

  const sampleHeaders = `apikey: ${SUPABASE_KEY}
Authorization: Bearer ${SUPABASE_KEY}
Content-Type: application/json
Prefer: resolution=merge-duplicates`

  return (
    <div className="glass-card overflow-hidden">
      <button className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          <span className="text-lg">📡</span>
          <div className="text-left">
            <p className="text-sm font-semibold">Integración GPS en tiempo real</p>
            <p className="text-xs text-slate-500">Conecta dispositivos GPS físicos o plataformas de tracking</p>
          </div>
        </div>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>

      {open && (
        <div className="border-t border-white/10 p-5 space-y-6">
          <p className="text-sm text-slate-400">
            Cada GPS envía un <strong className="text-white">POST HTTP</strong> al endpoint de Supabase REST API con la posición del transportista. No se requiere SDK en el dispositivo.
          </p>

          <div>
            <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">Endpoint — POST (upsert)</h4>
            <div className="bg-slate-950 rounded-lg p-3 text-xs font-mono text-green-300 break-all">{endpoint}</div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">Headers</h4>
            <div className="bg-slate-950 rounded-lg p-3 text-xs font-mono text-yellow-300 relative">
              <pre className="whitespace-pre-wrap break-all">{sampleHeaders}</pre>
              <button onClick={() => onCopy(sampleHeaders, 'headers')}
                className="absolute top-2 right-2 text-xs px-2 py-0.5 bg-slate-800 rounded hover:bg-slate-700 transition text-slate-300">
                {copied === 'headers' ? '✓' : 'copiar'}
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">Body (JSON)</h4>
            <div className="bg-slate-950 rounded-lg p-3 text-xs font-mono text-green-300 relative">
              <pre className="whitespace-pre-wrap">{sampleBody(drivers[0]?.id ?? 1)}</pre>
              <button onClick={() => onCopy(sampleBody(drivers[0]?.id ?? 1), 'body')}
                className="absolute top-2 right-2 text-xs px-2 py-0.5 bg-slate-800 rounded hover:bg-slate-700 transition text-slate-300">
                {copied === 'body' ? '✓' : 'copiar'}
              </button>
            </div>
          </div>

          {drivers.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">IDs de transportistas</h4>
              <div className="space-y-2">
                {drivers.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 bg-slate-950 rounded-lg px-3 py-2">
                    <span className="text-sm text-white w-40 truncate flex-shrink-0">{d.name}</span>
                    <code className="text-xs text-blue-300 flex-1">{d.id}</code>
                    <button onClick={() => onCopy(String(d.id), `gps_${d.id}`)}
                      className="text-xs px-2 py-0.5 bg-slate-800 rounded hover:bg-slate-700 transition text-slate-300 flex-shrink-0">
                      {copied === `gps_${d.id}` ? '✓' : 'copiar'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-slate-600 border-t border-white/10 pt-4">
            La ubicación aparece en el mapa público solo si el transportista tiene <strong className="text-slate-400">estado Activo</strong> y el toggle <strong className="text-slate-400">Ver en web</strong> está encendido.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Location Update Modal ─────────────────────────────────────────────────────
function LocationUpdateModal({ driver, onClose }: { driver: Driver; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<mapboxgl.Map | null>(null)
  const markerRef    = useRef<mapboxgl.Marker | null>(null)
  const initLoc = driver.lat && driver.lng ? { lat: driver.lat, lng: driver.lng } : null
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(initLoc)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: initLoc ? [initLoc.lng, initLoc.lat] : [-72.9424, -41.4693],
      zoom: initLoc ? 12 : 9,
    })
    map.addControl(new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true } }), 'top-right')

    if (initLoc) {
      markerRef.current = new mapboxgl.Marker({ color: '#3b82f6', draggable: true })
        .setLngLat([initLoc.lng, initLoc.lat])
        .addTo(map)
      markerRef.current.on('dragend', () => {
        const { lng, lat } = markerRef.current!.getLngLat()
        setCoords({ lat, lng })
      })
    }

    map.on('click', (e) => {
      const { lng, lat } = e.lngLat
      setCoords({ lat, lng })
      if (markerRef.current) { markerRef.current.setLngLat([lng, lat]) }
      else {
        markerRef.current = new mapboxgl.Marker({ color: '#3b82f6', draggable: true })
          .setLngLat([lng, lat]).addTo(map)
        markerRef.current.on('dragend', () => {
          const ll = markerRef.current!.getLngLat()
          setCoords({ lat: ll.lat, lng: ll.lng })
        })
      }
    })

    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const save = async () => {
    if (!coords) return
    setSaving(true)
    await supabase.from('locations_current').upsert({
      driver_id:  driver.id,
      lat:        coords.lat,
      lng:        coords.lng,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'driver_id' })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card shadow-glass w-full max-w-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-white text-sm">Actualizar ubicación — {driver.name}</h3>
            <p className="text-slate-500 text-xs mt-0.5">Haz clic en el mapa o arrastra el marcador</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div ref={containerRef} style={{ height: '340px' }} />
        <div className="px-5 py-4 border-t border-white/10 flex items-center justify-between">
          {coords
            ? <p className="text-xs text-cyan-400">{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</p>
            : <p className="text-xs text-slate-500">Ninguna ubicación seleccionada</p>}
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-glass text-xs px-4 py-2">Cancelar</button>
            <button onClick={save} disabled={!coords || saving} className="btn-primary text-xs px-4 py-2 disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar ubicación'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Driver Detail ────────────────────────────────────────────────────────────
function DriverDetail({ driver: d, onClose, onTogglePublic, onToggleStatus, onToggleShowInFleet }: {
  driver: Driver; onClose: () => void
  onTogglePublic: (d: Driver) => void
  onToggleStatus: (d: Driver) => void
  onToggleShowInFleet: (d: Driver) => void
}) {
  const mapRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!mapRef.current || !d.lat || !d.lng) return
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [d.lng, d.lat], zoom: 12,
    })
    new mapboxgl.Marker({ color: '#3b82f6' }).setLngLat([d.lng, d.lat]).addTo(map)
    return () => map.remove()
  }, [d.lat, d.lng])

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card shadow-glass p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-white">{d.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="space-y-1.5 text-sm mb-4">
          {([['Teléfono', d.phone], ['Email', d.email], ['Tipo', d.truckType], ['Patente', d.truckPlate], ['Cap.', d.capacity ? `${d.capacity} kg` : '']] as [string, string][])
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="text-slate-500 w-20 flex-shrink-0">{k}:</span>
                <span className="text-white">{v}</span>
              </div>
            ))}
          {d.description && <p className="text-slate-400 bg-white/5 p-3 rounded-lg text-xs mt-2">{d.description}</p>}
        </div>
        {d.lat && d.lng && <div ref={mapRef} className="w-full h-44 rounded-xl overflow-hidden border border-white/10 mb-4" />}
        <div className="flex gap-2 flex-wrap">
          <a href={`tel:${d.phone}`} className="btn-primary text-sm px-4 py-2">Llamar</a>
          <button onClick={() => onToggleStatus(d)}
            className={`text-sm px-4 py-2 rounded-xl border transition ${d.status === 'active' ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}`}>
            {d.status === 'active' ? 'Desactivar' : 'Activar'}
          </button>
          <button onClick={() => onTogglePublic(d)}
            className={`text-sm px-4 py-2 rounded-xl border transition ${d.isPublic ? 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10' : 'border-slate-600 text-slate-400 hover:bg-white/5'}`}>
            {d.isPublic ? 'Ocultar del mapa' : 'Mostrar en mapa web'}
          </button>
          <button onClick={() => onToggleShowInFleet(d)}
            className={`text-sm px-4 py-2 rounded-xl border transition ${d.showInFleet ? 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10' : 'border-slate-600 text-slate-400 hover:bg-white/5'}`}>
            {d.showInFleet ? 'Quitar de sección Flota' : 'Mostrar en sección Flota'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Media Ficha Modal ────────────────────────────────────────────────────────
interface MediaFichaData { coverImage: string; coverVideo: string; features: string[] }

function MediaFichaModal({ driver, onClose, onSave }: {
  driver: Driver; onClose: () => void; onSave: (data: MediaFichaData) => void
}) {
  const [coverImage, setCoverImage] = useState(driver.coverImage)
  const [coverVideo, setCoverVideo] = useState(driver.coverVideo)
  const [featuresRaw, setFeaturesRaw] = useState(driver.features.join(', '))
  const [preview, setPreview] = useState(false)

  const handleSave = () => {
    const features = featuresRaw.split(',').map((f) => f.trim()).filter(Boolean)
    onSave({ coverImage, coverVideo, features })
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card shadow-glass w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-white text-sm">Ficha de flota — {driver.name}</h3>
            <p className="text-slate-500 text-xs mt-0.5">{driver.truckType}{driver.truckPlate ? ` · ${driver.truckPlate}` : ''}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              URL imagen de portada
              <span className="text-slate-500 font-normal ml-1">(local: /media/fleet/archivo.jpg · Firebase Storage URL)</span>
            </label>
            <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="/media/fleet/tracto-camion.jpg" className="input-dark text-xs" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              URL video de portada <span className="text-slate-500 font-normal">(opcional — se reproduce al pasar el mouse)</span>
            </label>
            <input value={coverVideo} onChange={(e) => setCoverVideo(e.target.value)} placeholder="/media/fleet/tracto-camion.mp4" className="input-dark text-xs" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Características <span className="text-slate-500 font-normal">(separadas por coma)</span>
            </label>
            <textarea value={featuresRaw} onChange={(e) => setFeaturesRaw(e.target.value)} rows={3}
              placeholder="Carrocería plana, Amarres industriales, Permiso cargas especiales"
              className="input-dark text-xs resize-none" />
            {featuresRaw && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {featuresRaw.split(',').map((f) => f.trim()).filter(Boolean).map((f) => (
                  <span key={f} className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">{f}</span>
                ))}
              </div>
            )}
          </div>

          {coverImage && (
            <div>
              <button onClick={() => setPreview(!preview)} className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1">
                <svg className={`w-3.5 h-3.5 transition-transform ${preview ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                {preview ? 'Ocultar' : 'Ver'} previsualización
              </button>
              {preview && (
                <div className="mt-2 rounded-xl overflow-hidden border border-white/10" style={{ aspectRatio: '16/9' }}>
                  <img src={coverImage} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-white/10 bg-blue-500/5 -mx-5 px-5 py-3 text-xs text-slate-500">
            <strong className="text-slate-400">Opciones para subir imágenes:</strong>
            <ul className="mt-1 space-y-0.5 list-disc list-inside">
              <li>Coloca el archivo en <code className="text-blue-300">/public/media/fleet/</code> y usa <code className="text-blue-300">/media/fleet/nombre.jpg</code></li>
              <li>Sube a Firebase Storage y pega la URL de descarga</li>
            </ul>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-white/10 flex justify-end gap-2">
          <button onClick={onClose} className="btn-glass text-xs px-4 py-2">Cancelar</button>
          <button onClick={handleSave} className="btn-primary text-xs px-4 py-2">Guardar ficha</button>
        </div>
      </div>
    </div>
  )
}

// ─── CRM ──────────────────────────────────────────────────────────────────────
function CRMPanel({ leads }: { leads: Lead[] }) {
  const [selected, setSelected] = useState<Lead | null>(null)

  const updateStatus = (id: number, status: string) =>
    supabase.from('leads').update({ status }).eq('id', id)

  const statusStyle: Record<string, string> = {
    new:       'bg-blue-500/15 border-blue-500/30 text-blue-300',
    contacted: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300',
    closed:    'bg-green-500/15 border-green-500/30 text-green-400',
    lost:      'bg-red-500/10 border-red-500/20 text-red-400',
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total',        val: leads.length,                                       c: 'text-gradient'  },
          { label: 'Nuevas',       val: leads.filter((l) => l.status === 'new').length,      c: 'text-blue-400'  },
          { label: 'Contactadas',  val: leads.filter((l) => l.status === 'contacted').length, c: 'text-yellow-400' },
          { label: 'Cerradas',     val: leads.filter((l) => l.status === 'closed').length,   c: 'text-green-400' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-5 text-center">
            <p className={`font-display text-2xl font-bold ${s.c}`}>{s.val}</p>
            <p className="text-slate-400 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold">Solicitudes de clientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-500 text-xs uppercase">
                {['Nombre', 'Empresa', 'Teléfono', 'Origen → Destino', 'Tipo de carga', 'Estado', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-slate-500 text-sm">Sin solicitudes aún.</td></tr>
              ) : leads.map((l) => (
                <tr key={l.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{l.name}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{l.company || '—'}</td>
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                    <a href={`tel:${l.phone}`} className="hover:text-blue-400 transition">{l.phone}</a>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{l.origin || '—'}{l.destination ? ` → ${l.destination}` : ''}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{l.cargoType || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusStyle[l.status] ?? 'bg-white/5 border-white/15 text-slate-300'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setSelected(l)} className="text-xs px-2.5 py-1 glass-card hover:border-blue-500/30 transition whitespace-nowrap">Ver</button>
                      {l.status === 'new' && (
                        <button onClick={() => updateStatus(l.id, 'contacted')} className="text-xs px-2.5 py-1 bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 rounded-lg hover:bg-yellow-500/25 transition whitespace-nowrap">Contactar</button>
                      )}
                      {l.status === 'contacted' && (
                        <button onClick={() => updateStatus(l.id, 'closed')} className="text-xs px-2.5 py-1 bg-green-500/15 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/25 transition whitespace-nowrap">Cerrar</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <LeadDetail
          lead={selected}
          onClose={() => setSelected(null)}
          onStatusChange={(s) => { updateStatus(selected.id, s); setSelected(null) }}
        />
      )}
    </div>
  )
}

function LeadDetail({ lead: l, onClose, onStatusChange }: {
  lead: Lead; onClose: () => void; onStatusChange: (s: string) => void
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card shadow-glass p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-white">{l.name}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="space-y-1.5 text-sm mb-4">
          {([['Empresa', l.company], ['Teléfono', l.phone], ['Email', l.email], ['Tipo de carga', l.cargoType], ['Origen', l.origin], ['Destino', l.destination], ['Peso', l.weight ? `${l.weight} kg` : '']] as [string, string][])
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="text-slate-500 w-28 flex-shrink-0">{k}:</span>
                <span className="text-white">{v}</span>
              </div>
            ))}
          {l.message && <p className="text-slate-400 bg-white/5 p-3 rounded-lg text-xs mt-2 whitespace-pre-line">{l.message}</p>}
        </div>
        {l.photos?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-2">Fotos ({l.photos.length}):</p>
            <div className="flex gap-2 flex-wrap">
              {l.photos.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  <img src={url} alt={`Foto ${i + 1}`} className="w-24 h-24 object-cover rounded-lg border border-white/15 hover:border-blue-500/50 transition" />
                </a>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          <a href={`tel:${l.phone}`} className="btn-primary text-sm px-4 py-2">Llamar</a>
          {l.status !== 'closed' && (
            <button onClick={() => onStatusChange('closed')} className="btn-glass text-sm px-4 py-2 text-green-400">Cerrar</button>
          )}
          {l.status !== 'lost' && (
            <button onClick={() => onStatusChange('lost')} className="btn-glass text-sm px-4 py-2 text-red-400">Perdido</button>
          )}
          <button onClick={onClose} className="btn-glass text-sm px-4 py-2 ml-auto">Cerrar</button>
        </div>
      </div>
    </div>
  )
}
