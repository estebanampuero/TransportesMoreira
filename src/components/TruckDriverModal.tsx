import { useState, useEffect, useRef, FormEvent } from 'react'
import mapboxgl from 'mapbox-gl'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string

const TRUCK_TYPES = [
  'Tracto Camión',
  'Camión Rígido',
  'Camión con Grúa Pluma',
  'Camión Tolva',
  'Camión Plataforma',
  'Furgón de Carga',
  'Otro',
]

interface DriverForm {
  name: string
  phone: string
  email: string
  truckType: string
  truckPlate: string
  capacity: string
  description: string
  lat: number | null
  lng: number | null
}

const INITIAL: DriverForm = {
  name: '', phone: '', email: '', truckType: '', truckPlate: '',
  capacity: '', description: '', lat: null, lng: null,
}

type Status = 'idle' | 'loading' | 'success' | 'error'

interface Props {
  open: boolean
  onClose: () => void
}

export default function TruckDriverModal({ open, onClose }: Props) {
  const [form, setForm] = useState<DriverForm>(INITIAL)
  const [status, setStatus] = useState<Status>('idle')
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Init map when modal opens
  useEffect(() => {
    if (!open || !containerRef.current) return
    if (mapRef.current) return

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-72.9424, -41.4693], // Puerto Montt
      zoom: 10,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.addControl(new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: false }), 'top-right')

    map.on('click', (e) => {
      const { lng, lat } = e.lngLat
      setForm((prev) => ({ ...prev, lat, lng }))

      if (markerRef.current) markerRef.current.remove()
      markerRef.current = new mapboxgl.Marker({ color: '#3b82f6' })
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('Ubicación de tu camión'))
        .addTo(map)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.truckType) return
    setStatus('loading')
    try {
      await addDoc(collection(db, 'drivers'), {
        name: form.name,
        phone: form.phone,
        email: form.email,
        truckType: form.truckType,
        truckPlate: form.truckPlate,
        capacity: form.capacity,
        description: form.description,
        location: form.lat && form.lng ? { lat: form.lat, lng: form.lng } : null,
        status: 'pending',
        isPublic: false,
        showInFleet: false,
        coverImage: '',
        coverVideo: '',
        features: [],
        createdAt: serverTimestamp(),
      })
      setStatus('success')
      setForm(INITIAL)
    } catch {
      setStatus('error')
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="driver-modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card shadow-glass border-white/15 rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-white/8 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 id="driver-modal-title" className="font-display text-lg font-bold text-white">
              Trabaja con nosotros 🚛
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">Registra tu camión en nuestra red de transportistas</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/8 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6">
          {status === 'success' ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-green-500/15 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">¡Registro recibido!</h3>
              <p className="text-slate-400 text-sm mb-6">Revisaremos tu información y te contactaremos a la brevedad para coordinar el primer servicio.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setStatus('idle')} className="btn-glass text-sm px-5 py-2.5">Registrar otro camión</button>
                <button onClick={onClose} className="btn-primary text-sm px-5 py-2.5">Cerrar</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Datos personales */}
              <fieldset>
                <legend className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-3">Datos de contacto</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Nombre completo *" name="name" type="text" value={form.name} onChange={handleChange} placeholder="Tu nombre" required />
                  <Field label="Teléfono *" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+56 9 XXXX XXXX" required />
                  <div className="sm:col-span-2">
                    <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="correo@ejemplo.cl" />
                  </div>
                </div>
              </fieldset>

              {/* Datos del camión */}
              <fieldset>
                <legend className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-3">Información del camión</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="truckType" className="block text-sm font-medium text-slate-300 mb-1">Tipo de camión *</label>
                    <select id="truckType" name="truckType" value={form.truckType} onChange={handleChange} required
                      className="input-dark appearance-none cursor-pointer">
                      <option value="">Seleccionar...</option>
                      {TRUCK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <Field label="Patente" name="truckPlate" type="text" value={form.truckPlate} onChange={handleChange} placeholder="BBBB-00" />
                  <div className="sm:col-span-2">
                    <Field label="Capacidad de carga (kg)" name="capacity" type="text" value={form.capacity} onChange={handleChange} placeholder="Ej: 6200" />
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">Descripción del camión / servicios que ofreces</label>
                  <textarea id="description" name="description" value={form.description} onChange={handleChange}
                    rows={3} placeholder="Describe tu camión, disponibilidad, zonas donde trabajas..."
                    className="input-dark resize-none" />
                </div>
              </fieldset>

              {/* Mapa */}
              <fieldset>
                <legend className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-2">
                  Ubicación actual del camión
                </legend>
                <p className="text-slate-500 text-xs mb-3">Haz clic en el mapa para marcar dónde está tu camión actualmente.</p>
                <div ref={containerRef} className="w-full h-64 rounded-xl overflow-hidden border border-white/10" />
                {form.lat && form.lng ? (
                  <p className="mt-2 text-xs text-cyan-400 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Ubicación marcada: {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-slate-600">Ninguna ubicación seleccionada aún.</p>
                )}
              </fieldset>

              {status === 'error' && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                  Error al enviar. Intenta de nuevo.
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 btn-glass py-3">Cancelar</button>
                <button type="submit" disabled={status === 'loading'}
                  className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50">
                  {status === 'loading'
                    ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Enviando...</>
                    : 'Registrarme'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, name, type, value, onChange, placeholder, required }: {
  label: string; name: string; type: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string; required?: boolean
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
      <input id={name} name={name} type={type} value={value} onChange={onChange}
        placeholder={placeholder} required={required} className="input-dark" />
    </div>
  )
}
