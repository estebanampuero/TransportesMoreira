import { useState, useRef, FormEvent } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db } from '../lib/firebase'
import { trackFormSubmit } from '../lib/analytics'
import { STORAGE_PATHS } from '../lib/assets'

const TRANSPORT_TYPES = [
  'Carga general',
  'Maquinaria pesada',
  'Carga frágil / delicada',
  'Materiales de construcción',
  'Equipos industriales',
  'Equipos agrícolas / forestales',
  'Mudanza empresarial',
  'Otro',
]

interface LeadForm {
  name: string
  company: string
  phone: string
  email: string
  transportType: string
  origin: string
  destination: string
  date: string
  length: string
  width: string
  height: string
  weight: string
  notes: string
}

const INITIAL: LeadForm = {
  name: '', company: '', phone: '', email: '',
  transportType: '', origin: '', destination: '', date: '',
  length: '', width: '', height: '', weight: '', notes: '',
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ClientLeadForm() {
  const [form, setForm] = useState<LeadForm>(INITIAL)
  const [photos, setPhotos] = useState<File[]>([])
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [uploadProgress, setUploadProgress] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 3)
    setPhotos(files)
    setPhotosPreviews(files.map((f) => URL.createObjectURL(f)))
  }

  const removePhoto = (i: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i))
    setPhotosPreviews((prev) => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.origin || !form.destination) return
    setStatus('loading')
    setUploadProgress('Guardando datos...')
    try {
      // Upload photos to Firebase Storage
      const photoUrls: string[] = []
      if (photos.length > 0) {
        const storage = getStorage()
        for (let i = 0; i < photos.length; i++) {
          setUploadProgress(`Subiendo foto ${i + 1} de ${photos.length}...`)
          const file = photos[i]
          const ext = file.name.split('.').pop()
          const path = `${STORAGE_PATHS.leadPhotos}${Date.now()}_${i}.${ext}`
          const ref = storageRef(storage, path)
          await uploadBytes(ref, file)
          const url = await getDownloadURL(ref)
          photoUrls.push(url)
        }
      }

      setUploadProgress('Registrando solicitud...')
      await addDoc(collection(db, 'client_leads'), {
        ...form,
        photoUrls,
        status: 'new',
        source: 'web_form_crm',
        createdAt: serverTimestamp(),
      })

      trackFormSubmit()
      setStatus('success')
      setForm(INITIAL)
      setPhotos([])
      setPhotosPreviews([])
      setUploadProgress('')
    } catch (err) {
      console.error(err)
      setStatus('error')
      setUploadProgress('')
    }
  }

  return (
    <section id="solicitud" className="section-dark" aria-labelledby="solicitud-title">
      <div className="orb w-96 h-96 bg-cyan-500/8 top-0 left-0" />
      <div className="container mx-auto px-6 max-w-3xl relative z-10">
        <div className="text-center mb-12">
          <p className="text-cyan-400 font-semibold text-sm uppercase tracking-widest mb-3">Solicitud de servicio</p>
          <h2 id="solicitud-title" className="font-display text-3xl md:text-4xl font-bold mb-4">
            Detalla tu <span className="text-gradient">requerimiento</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Cuéntanos sobre tu carga y te asesoramos con la solución logística más adecuada.
          </p>
        </div>

        <div className="glass-card shadow-glass p-8">
          {status === 'success' ? (
            <SuccessMsg onReset={() => setStatus('idle')} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contacto */}
              <fieldset>
                <legend className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-4">Datos de contacto</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <F label="Nombre *" name="name" type="text" value={form.name} onChange={handleChange} placeholder="Tu nombre" required />
                  <F label="Empresa" name="company" type="text" value={form.company} onChange={handleChange} placeholder="Nombre empresa" />
                  <F label="Teléfono *" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+56 9 XXXX XXXX" required />
                  <F label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="correo@empresa.cl" />
                </div>
              </fieldset>

              {/* Traslado */}
              <fieldset>
                <legend className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-4">Detalle del traslado</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="transportType" className="block text-sm font-medium text-slate-300 mb-1">Tipo de carga</label>
                    <select id="transportType" name="transportType" value={form.transportType} onChange={handleChange}
                      className="input-dark appearance-none cursor-pointer">
                      <option value="">Seleccionar...</option>
                      {TRANSPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <F label="Origen *" name="origin" type="text" value={form.origin} onChange={handleChange} placeholder="Ciudad o dirección" required />
                  <F label="Destino *" name="destination" type="text" value={form.destination} onChange={handleChange} placeholder="Ciudad o dirección" required />
                  <F label="Fecha estimada" name="date" type="date" value={form.date} onChange={handleChange} />
                </div>
              </fieldset>

              {/* Dimensiones */}
              <fieldset>
                <legend className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-4">Dimensiones de la carga</legend>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { name: 'length', label: 'Largo (m)' },
                    { name: 'width',  label: 'Ancho (m)' },
                    { name: 'height', label: 'Alto (m)' },
                    { name: 'weight', label: 'Peso (kg)' },
                  ].map((d) => (
                    <F key={d.name} label={d.label} name={d.name} type="number"
                      value={(form as unknown as Record<string, string>)[d.name]}
                      onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>}
                      placeholder="0" />
                  ))}
                </div>
              </fieldset>

              {/* Fotos */}
              <fieldset>
                <legend className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-2">
                  Fotos de la carga <span className="text-slate-500 normal-case font-normal">(máx. 3)</span>
                </legend>
                <div
                  className="border-2 border-dashed border-white/15 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500/40 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg className="w-8 h-8 text-slate-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-slate-400 text-sm">Haz clic para subir fotos</p>
                  <p className="text-slate-600 text-xs mt-1">JPG, PNG hasta 10 MB cada una</p>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={handlePhotos} disabled={photos.length >= 3} />
                </div>

                {photosPreviews.length > 0 && (
                  <div className="mt-4 flex gap-3 flex-wrap">
                    {photosPreviews.map((src, i) => (
                      <div key={i} className="relative group">
                        <img src={src} alt={`Foto ${i + 1}`} className="w-24 h-24 object-cover rounded-lg border border-white/15" />
                        <button type="button" onClick={() => removePhoto(i)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </fieldset>

              {/* Notas */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-1">Información adicional</label>
                <textarea id="notes" name="notes" value={form.notes} onChange={handleChange} rows={3}
                  placeholder="Condiciones especiales, acceso, horarios, etc."
                  className="input-dark resize-none" />
              </div>

              {status === 'error' && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                  Error al enviar. Intenta de nuevo o contáctanos directamente.
                </p>
              )}

              <button type="submit" disabled={status === 'loading'}
                className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50">
                {status === 'loading' ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{uploadProgress || 'Enviando...'}</>
                ) : 'Enviar requerimiento'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

function F({ label, name, type, value, onChange, placeholder, required }: {
  label: string; name: string; type: string; value: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
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

function SuccessMsg({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-10">
      <div className="w-16 h-16 bg-green-500/15 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      </div>
      <h3 className="font-display text-xl font-bold text-white mb-2">¡Solicitud recibida!</h3>
      <p className="text-slate-400 text-sm mb-6">Revisaremos tu requerimiento y te contactaremos a la brevedad para coordinar el servicio.</p>
      <button onClick={onReset} className="btn-primary px-6 py-2.5">Enviar otra solicitud</button>
    </div>
  )
}
