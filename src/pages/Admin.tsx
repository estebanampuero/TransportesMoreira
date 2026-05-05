import { useState, useEffect, useRef } from 'react'
import {
  collection, query, orderBy, doc, updateDoc,
  onSnapshot, Timestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
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
  id: string
  name: string; phone: string; email: string
  truckType: string; truckPlate: string; capacity: string; description: string
  location: { lat: number; lng: number } | null
  lastLocationUpdate: Timestamp | null
  status: 'pending' | 'active' | 'inactive'
  isPublic: boolean
  showInFleet: boolean
  coverImage?: string
  coverVideo?: string
  features?: string[]
}
interface ClientLead {
  id: string
  name: string; company: string; phone: string; email: string
  transportType: string; origin: string; destination: string
  date: string; length: string; width: string; height: string; weight: string
  notes: string; photoUrls: string[]
  status: 'new' | 'contacted' | 'closed' | 'lost'
  createdAt: Timestamp | null
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
  const [tab, setTab] = useState<Tab>('erp')
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [leads, setLeads] = useState<ClientLead[]>([])

  // Real-time subscriptions
  useEffect(() => {
    const unsub1 = onSnapshot(query(collection(db, 'drivers'), orderBy('createdAt', 'desc')),
      (s) => setDrivers(s.docs.map((d) => ({ id: d.id, ...d.data() } as Driver))))
    const unsub2 = onSnapshot(query(collection(db, 'client_leads'), orderBy('createdAt', 'desc')),
      (s) => setLeads(s.docs.map((d) => ({ id: d.id, ...d.data() } as ClientLead))))
    return () => { unsub1(); unsub2() }
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
          {/* Live indicator */}
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
  const [selected, setSelected] = useState<Driver | null>(null)
  const [locModal, setLocModal] = useState<Driver | null>(null)
  const [mediaModal, setMediaModal] = useState<Driver | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map())

  const togglePublic = (d: Driver) =>
    updateDoc(doc(db, 'drivers', d.id), { isPublic: !d.isPublic, updatedAt: new Date() })

  const toggleStatus = (d: Driver) =>
    updateDoc(doc(db, 'drivers', d.id), {
      status: d.status === 'active' ? 'inactive' : 'active',
      updatedAt: new Date(),
    })

  const toggleShowInFleet = (d: Driver) =>
    updateDoc(doc(db, 'drivers', d.id), { showInFleet: !d.showInFleet, updatedAt: new Date() })

  const saveMedia = (d: Driver, data: { coverImage: string; coverVideo: string; features: string[] }) =>
    updateDoc(doc(db, 'drivers', d.id), { ...data, updatedAt: new Date() })

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  // Admin map — all drivers with location
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

  // Sync markers real-time
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const ids = new Set(drivers.filter((d) => d.location).map((d) => d.id))
    markersRef.current.forEach((m, id) => { if (!ids.has(id)) { m.remove(); markersRef.current.delete(id) } })

    drivers.forEach((d) => {
      if (!d.location) return
      const color = d.isPublic && d.status === 'active' ? '#22c55e' : d.status === 'active' ? '#3b82f6' : '#64748b'
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="font-family:Inter,sans-serif">
          <strong style="color:#f1f5f9">${esc(d.name)}</strong><br/>
          <span style="color:#94a3b8;font-size:11px">${esc(d.truckType)}</span><br/>
          <span style="color:${color};font-size:11px;font-weight:600">${esc(d.status)} ${d.isPublic ? '· visible en web' : ''}</span>
        </div>
      `)

      if (markersRef.current.has(d.id)) {
        markersRef.current.get(d.id)!.setLngLat([d.location.lng, d.location.lat])
      } else {
        const m = new mapboxgl.Marker({ color }).setLngLat([d.location.lng, d.location.lat]).setPopup(popup).addTo(map)
        markersRef.current.set(d.id, m)
      }
    })
  }, [drivers])

  // Stats
  const active = drivers.filter((d) => d.status === 'active').length
  const publicCount = drivers.filter((d) => d.isPublic && d.status === 'active').length
  const inFleetCount = drivers.filter((d) => d.showInFleet).length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total registrados', val: drivers.length, color: 'text-gradient' },
          { label: 'Activos', val: active, color: 'text-green-400' },
          { label: 'En mapa web', val: publicCount, color: 'text-blue-400' },
          { label: 'En flota web', val: inFleetCount, color: 'text-cyan-400' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-5 text-center">
            <p className={`font-display text-2xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-slate-400 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Map + legend */}
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

      {/* Table */}
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
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">{d.truckType}</td>
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
                    <button
                      onClick={() => togglePublic(d)}
                      title={d.isPublic ? 'Visible en mapa web — clic para ocultar' : 'Oculto en mapa web — clic para mostrar'}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${d.isPublic && d.status === 'active' ? 'bg-blue-600' : 'bg-slate-700'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${d.isPublic && d.status === 'active' ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleShowInFleet(d)}
                      title={d.showInFleet ? 'Visible en sección Flota — clic para quitar' : 'No aparece en sección Flota — clic para agregar'}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${d.showInFleet ? 'bg-cyan-600' : 'bg-slate-700'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${d.showInFleet ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => copyText(d.id, d.id)}
                      title="Copiar Driver ID para integración GPS"
                      className="text-xs px-2 py-1 glass-card hover:border-blue-500/30 transition flex items-center gap-1"
                    >
                      {copied === d.id ? '✓ copiado' : '📡 ID GPS'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setSelected(d)}
                        className="text-xs px-2.5 py-1 glass-card hover:border-blue-500/30 transition">
                        Ver
                      </button>
                      <button onClick={() => setLocModal(d)}
                        className="text-xs px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition whitespace-nowrap">
                        📍 Ubicar
                      </button>
                      <button onClick={() => setMediaModal(d)}
                        className="text-xs px-2.5 py-1 bg-purple-500/10 border border-purple-500/25 text-purple-300 rounded-lg hover:bg-purple-500/20 transition whitespace-nowrap">
                        🖼 Ficha
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GPS Integration guide */}
      <GPSIntegrationGuide drivers={drivers} onCopy={copyText} copied={copied} />

      {selected && <DriverDetail driver={selected} onClose={() => setSelected(null)} onTogglePublic={togglePublic} onToggleStatus={toggleStatus} onToggleShowInFleet={toggleShowInFleet} />}
      {locModal && <LocationUpdateModal driver={locModal} onClose={() => setLocModal(null)} />}
      {mediaModal && <MediaFichaModal driver={mediaModal} onClose={() => setMediaModal(null)} onSave={(data: { coverImage: string; coverVideo: string; features: string[] }) => { saveMedia(mediaModal, data); setMediaModal(null) }} />}
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
  const PROJECT_ID = 'transportesmoreira'
  const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY as string

  const restEndpoint = (driverId: string) =>
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/drivers/${driverId}?key=${API_KEY}&updateMask.fieldPaths=location&updateMask.fieldPaths=lastLocationUpdate`

  const sampleBody = `{
  "fields": {
    "location": {
      "mapValue": {
        "fields": {
          "lat": { "doubleValue": -41.4693 },
          "lng": { "doubleValue": -72.9424 }
        }
      }
    },
    "lastLocationUpdate": {
      "timestampValue": "${new Date().toISOString()}"
    }
  }
}`

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
            Cada GPS dispositivo actualiza la ubicación del transportista enviando un <strong className="text-white">PATCH HTTP</strong> al endpoint de Firestore REST API. No se requiere SDK de Firebase en el dispositivo.
          </p>

          {/* Method 1: REST API */}
          <div>
            <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">Método 1 — REST API directa (Cualquier GPS con HTTP callback)</h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Método HTTP: <code className="text-blue-300">PATCH</code></p>
                <div className="bg-slate-950 rounded-lg p-3 text-xs font-mono text-green-300 break-all">
                  {drivers.length > 0
                    ? restEndpoint(drivers[0].id)
                    : `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/drivers/{DRIVER_ID}?key=${API_KEY}&updateMask.fieldPaths=location&updateMask.fieldPaths=lastLocationUpdate`}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Body (JSON):</p>
                <div className="bg-slate-950 rounded-lg p-3 text-xs font-mono text-green-300 relative">
                  <pre className="whitespace-pre-wrap">{sampleBody}</pre>
                  <button onClick={() => onCopy(sampleBody, 'body')}
                    className="absolute top-2 right-2 text-xs px-2 py-0.5 bg-slate-800 rounded hover:bg-slate-700 transition text-slate-300">
                    {copied === 'body' ? '✓' : 'copiar'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Method 2: Traccar */}
          <div>
            <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">Método 2 — Traccar (plataforma GPS open source)</h4>
            <p className="text-xs text-slate-400 mb-2">Si usas Traccar, configura un "Action HTTP Request" en el servidor Traccar para llamar al endpoint de arriba cuando hay nueva posición.</p>
            <div className="bg-slate-950 rounded-lg p-3 text-xs font-mono text-yellow-300">
              {`# En traccar.xml — Event Forward\n<entry key='event.forward.url'>https://us-central1-${PROJECT_ID}.cloudfunctions.net/gpsUpdate</entry>`}
            </div>
          </div>

          {/* Driver IDs */}
          {drivers.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">IDs de transportistas para configurar en cada GPS</h4>
              <div className="space-y-2">
                {drivers.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 bg-slate-950 rounded-lg px-3 py-2">
                    <span className="text-sm text-white w-40 truncate flex-shrink-0">{d.name}</span>
                    <code className="text-xs text-blue-300 flex-1 truncate">{d.id}</code>
                    <button onClick={() => onCopy(d.id, `gps_${d.id}`)}
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
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(driver.location)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: driver.location ? [driver.location.lng, driver.location.lat] : [-72.9424, -41.4693],
      zoom: driver.location ? 12 : 9,
    })
    map.addControl(new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true } }), 'top-right')

    if (driver.location) {
      markerRef.current = new mapboxgl.Marker({ color: '#3b82f6', draggable: true })
        .setLngLat([driver.location.lng, driver.location.lat])
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
  }, [driver.location])

  const save = async () => {
    if (!coords) return
    setSaving(true)
    await updateDoc(doc(db, 'drivers', driver.id), {
      location: coords,
      lastLocationUpdate: new Date(),
      updatedAt: new Date(),
    })
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
          {coords ? (
            <p className="text-xs text-cyan-400">{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</p>
          ) : (
            <p className="text-xs text-slate-500">Ninguna ubicación seleccionada</p>
          )}
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
    if (!mapRef.current || !d.location) return
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [d.location.lng, d.location.lat], zoom: 12,
    })
    new mapboxgl.Marker({ color: '#3b82f6' }).setLngLat([d.location.lng, d.location.lat]).addTo(map)
    return () => map.remove()
  }, [d.location])

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
        {d.location && <div ref={mapRef} className="w-full h-44 rounded-xl overflow-hidden border border-white/10 mb-4" />}
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
  driver: Driver
  onClose: () => void
  onSave: (data: MediaFichaData) => void
}) {
  const [coverImage, setCoverImage] = useState(driver.coverImage ?? '')
  const [coverVideo, setCoverVideo] = useState(driver.coverVideo ?? '')
  const [featuresRaw, setFeaturesRaw] = useState((driver.features ?? []).join(', '))
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
          {/* Cover image */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              URL imagen de portada
              <span className="text-slate-500 font-normal ml-1">(local: /media/fleet/archivo.jpg · Firebase Storage URL)</span>
            </label>
            <input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="/media/fleet/tracto-camion.jpg"
              className="input-dark text-xs"
            />
          </div>

          {/* Cover video */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              URL video de portada <span className="text-slate-500 font-normal">(opcional — se reproduce al pasar el mouse)</span>
            </label>
            <input
              value={coverVideo}
              onChange={(e) => setCoverVideo(e.target.value)}
              placeholder="/media/fleet/tracto-camion.mp4"
              className="input-dark text-xs"
            />
          </div>

          {/* Features */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Características <span className="text-slate-500 font-normal">(separadas por coma)</span>
            </label>
            <textarea
              value={featuresRaw}
              onChange={(e) => setFeaturesRaw(e.target.value)}
              rows={3}
              placeholder="Carrocería plana, Amarres industriales, Permiso cargas especiales"
              className="input-dark text-xs resize-none"
            />
            {featuresRaw && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {featuresRaw.split(',').map((f) => f.trim()).filter(Boolean).map((f) => (
                  <span key={f} className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">{f}</span>
                ))}
              </div>
            )}
          </div>

          {/* Preview */}
          {coverImage && (
            <div>
              <button
                onClick={() => setPreview(!preview)}
                className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1"
              >
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

          <div className="pt-2 border-t border-white/10 bg-blue-500/5 -mx-5 px-5 py-3 rounded-b-none text-xs text-slate-500">
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
function CRMPanel({ leads }: { leads: ClientLead[] }) {
  const [selected, setSelected] = useState<ClientLead | null>(null)

  const updateStatus = (id: string, status: string) =>
    updateDoc(doc(db, 'client_leads', id), { status, updatedAt: new Date() })

  const statusStyle: Record<string, string> = {
    new:       'bg-blue-500/15 border-blue-500/30 text-blue-300',
    contacted: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300',
    closed:    'bg-green-500/15 border-green-500/30 text-green-400',
    lost:      'bg-red-500/10 border-red-500/20 text-red-400',
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', val: leads.length, c: 'text-gradient' },
          { label: 'Nuevas', val: leads.filter((l) => l.status === 'new').length, c: 'text-blue-400' },
          { label: 'Contactadas', val: leads.filter((l) => l.status === 'contacted').length, c: 'text-yellow-400' },
          { label: 'Cerradas', val: leads.filter((l) => l.status === 'closed').length, c: 'text-green-400' },
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
                {['Nombre', 'Empresa', 'Teléfono', 'Origen → Destino', 'Tipo', 'Fecha', 'Estado', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-500 text-sm">Sin solicitudes aún.</td></tr>
              ) : leads.map((l) => (
                <tr key={l.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{l.name}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{l.company || '—'}</td>
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                    <a href={`tel:${l.phone}`} className="hover:text-blue-400 transition">{l.phone}</a>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{l.origin} → {l.destination}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{l.transportType || '—'}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{l.date || '—'}</td>
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
  lead: ClientLead; onClose: () => void; onStatusChange: (s: string) => void
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
          {([['Empresa', l.company], ['Teléfono', l.phone], ['Email', l.email], ['Tipo', l.transportType], ['Origen', l.origin], ['Destino', l.destination], ['Fecha', l.date], ['Dimensiones', [l.length, l.width, l.height].filter(Boolean).join(' × ') + (l.weight ? ` · ${l.weight} kg` : '')]] as [string, string][])
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="text-slate-500 w-24 flex-shrink-0">{k}:</span>
                <span className="text-white">{v}</span>
              </div>
            ))}
          {l.notes && <p className="text-slate-400 bg-white/5 p-3 rounded-lg text-xs mt-2">{l.notes}</p>}
        </div>
        {l.photoUrls?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-2">Fotos ({l.photoUrls.length}):</p>
            <div className="flex gap-2 flex-wrap">
              {l.photoUrls.map((url, i) => (
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
