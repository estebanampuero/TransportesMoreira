import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { supabase } from '../lib/supabase'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string

interface ActiveDriver {
  id: number
  name: string
  truck_type: string
  capacity: string | null
  status: string
  lat: number | null
  lng: number | null
  last_location_update: string | null
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function formatAge(ts?: string | null): string {
  if (!ts) return 'Sin datos'
  const mins = Math.round((Date.now() - new Date(ts).getTime()) / 60000)
  if (mins < 2) return 'Ahora'
  if (mins < 60) return `Hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  return hrs < 24 ? `Hace ${hrs}h` : `Hace ${Math.floor(hrs / 24)}d`
}

export default function LiveFleetMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<mapboxgl.Map | null>(null)
  const markersRef   = useRef<Map<number, mapboxgl.Marker>>(new Map())
  const [drivers, setDrivers]   = useState<ActiveDriver[]>([])
  const [selected, setSelected] = useState<ActiveDriver | null>(null)
  const [connected, setConnected] = useState(false)

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-72.9424, -41.4693],
      zoom: 8,
      attributionControl: false,
    })
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // Load active drivers + polling every 15s
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('drivers')
        .select('id, name, status, trucks(truck_type, capacity), locations_current(lat, lng, updated_at)')
        .eq('is_public', true)
        .eq('status', 'active')

      if (!error && data) {
        setConnected(true)
        setDrivers(data.map((d: any) => {
          const truck = Array.isArray(d.trucks) ? d.trucks[0] : d.trucks
          const loc   = Array.isArray(d.locations_current) ? d.locations_current[0] : d.locations_current
          return {
            id:   d.id,
            name: d.name,
            truck_type:           truck?.truck_type ?? 'Camión',
            capacity:             truck?.capacity   ?? null,
            status:               d.status,
            lat:                  loc?.lat          ?? null,
            lng:                  loc?.lng          ?? null,
            last_location_update: loc?.updated_at   ?? null,
          }
        }))
      } else {
        setConnected(false)
      }
    }

    load()
    const interval = setInterval(load, 15_000)
    return () => clearInterval(interval)
  }, [])

  // Sync map markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const currentIds = new Set(drivers.filter((d) => d.lat).map((d) => d.id))

    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) { marker.remove(); markersRef.current.delete(id) }
    })

    drivers.forEach((driver) => {
      if (!driver.lat || !driver.lng) return

      const popup = new mapboxgl.Popup({ offset: 28, closeButton: false, maxWidth: '240px' }).setHTML(`
        <div style="font-family:'Inter',sans-serif">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <span style="font-size:18px">🚛</span>
            <strong style="color:#f1f5f9;font-size:13px">${esc(driver.name)}</strong>
          </div>
          <p style="color:#94a3b8;font-size:12px;margin:2px 0">${esc(driver.truck_type)}${driver.capacity ? ` · ${esc(driver.capacity)} kg` : ''}</p>
          <div style="display:flex;align-items:center;gap:6px;margin-top:8px">
            <span style="width:7px;height:7px;border-radius:50%;background:#22c55e;display:inline-block"></span>
            <span style="color:#4ade80;font-size:11px;font-weight:600">En servicio</span>
            <span style="color:#475569;font-size:11px;margin-left:auto">${formatAge(driver.last_location_update)}</span>
          </div>
        </div>
      `)

      if (markersRef.current.has(driver.id)) {
        markersRef.current.get(driver.id)!.setLngLat([driver.lng, driver.lat])
      } else {
        const el = document.createElement('div')
        el.style.cssText = 'width:40px;height:40px;cursor:pointer;position:relative;'
        el.innerHTML = `
          <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.25);animation:ping 2s cubic-bezier(0,0,0.2,1) infinite"></div>
          <div style="position:absolute;inset:4px;border-radius:50%;background:#2563eb;border:2px solid #60a5fa;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 12px rgba(59,130,246,0.6)">🚛</div>
        `
        if (!document.getElementById('mapbox-ping-style')) {
          const style = document.createElement('style')
          style.id = 'mapbox-ping-style'
          style.textContent = '@keyframes ping { 0%{transform:scale(1);opacity:1} 75%,100%{transform:scale(1.8);opacity:0} }'
          document.head.appendChild(style)
        }
        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat([driver.lng, driver.lat])
          .setPopup(popup)
          .addTo(map)
        el.addEventListener('click', () => setSelected(driver))
        markersRef.current.set(driver.id, marker)
      }
    })
  }, [drivers])

  const flyTo = (driver: ActiveDriver) => {
    if (!driver.lat || !driver.lng || !mapRef.current) return
    mapRef.current.flyTo({ center: [driver.lng, driver.lat], zoom: 13, duration: 1200 })
    markersRef.current.get(driver.id)?.togglePopup()
    setSelected(driver)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-sm font-medium text-slate-300">
            {connected ? 'Conectado en tiempo real' : 'Reconectando...'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span><span className="font-bold text-white">{drivers.filter(d => d.lat).length}</span> camiones con ubicación</span>
          <span><span className="font-bold text-white">{drivers.length}</span> activos total</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="glass-card overflow-hidden relative" style={{ height: '420px' }}>
            <div ref={containerRef} className="absolute inset-0" />
            {drivers.length === 0 && connected && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10">
                <span className="text-4xl mb-3">🗺️</span>
                <p className="text-slate-300 font-medium">No hay camiones activos</p>
                <p className="text-slate-500 text-sm mt-1">Los camiones aparecerán aquí cuando estén en servicio</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card overflow-hidden flex flex-col" style={{ height: '420px' }}>
          <div className="p-4 border-b border-white/10 flex-shrink-0">
            <p className="text-sm font-semibold text-white">Flota activa</p>
            <p className="text-xs text-slate-500 mt-0.5">Haz clic para ver en el mapa</p>
          </div>
          <div className="overflow-y-auto flex-1">
            {drivers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <span className="text-3xl mb-2">🚛</span>
                <p className="text-slate-400 text-sm">Sin unidades activas</p>
              </div>
            ) : (
              <ul>
                {drivers.map((d) => (
                  <li key={d.id}>
                    <button onClick={() => flyTo(d)}
                      className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${selected?.id === d.id ? 'bg-blue-500/10 border-l-2 border-l-blue-500' : ''}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-lg mt-0.5">🚛</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{d.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{d.truck_type}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {d.lat ? (
                              <><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                              <span className="text-xs text-green-400">{formatAge(d.last_location_update)}</span></>
                            ) : <span className="text-xs text-slate-600">Sin ubicación</span>}
                            {d.capacity && <span className="text-xs text-slate-500 ml-auto">{d.capacity} kg</span>}
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-600 text-center">
        Ubicaciones actualizadas cada 15 segundos. Haz clic en un camión para centrarlo.
      </p>
    </div>
  )
}
