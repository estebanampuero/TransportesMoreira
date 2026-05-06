import { useState, FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { trackFormSubmit, trackWhatsAppClick, trackPhoneClick } from '../lib/analytics'
import { SITE, buildWhatsAppUrl } from '../lib/seo'

interface FormState { name: string; phone: string; email: string; message: string }
const INITIAL: FormState = { name: '', phone: '', email: '', message: '' }
type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL)
  const [status, setStatus] = useState<Status>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone) return
    setStatus('loading')
    try {
      const { error } = await supabase.from('leads').insert({
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        message: form.message || null,
        status: 'new',
        source: 'web_form',
      })
      if (error) throw error
      trackFormSubmit()
      setStatus('success')
      setForm(INITIAL)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="glass-card shadow-glass p-8 md:p-10">
      {status === 'success' ? (
        <SuccessMessage onReset={() => setStatus('idle')} />
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <h3 className="font-display text-xl font-bold text-white mb-1">Solicitar atención</h3>
          <p className="text-slate-500 text-sm mb-6">Completa el formulario y te contactaremos a la brevedad.</p>

          <div className="space-y-4">
            <Field label="Nombre o empresa *" name="name" type="text" value={form.name} onChange={handleChange} placeholder="Ej: Juan Pérez / Constructora Sur" required />
            <Field label="Teléfono *" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+56 9 XXXX XXXX" required />
            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="correo@empresa.cl" />
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-1">¿Qué necesitas transportar?</label>
              <textarea id="message" name="message" value={form.message} onChange={handleChange} rows={4}
                placeholder="Describe la carga, origen, destino y fecha estimada..."
                className="input-dark resize-none" />
            </div>
          </div>

          {status === 'error' && (
            <p className="mt-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
              Error al enviar. Intenta de nuevo o contáctanos por WhatsApp.
            </p>
          )}

          <button type="submit" disabled={status === 'loading'}
            className="mt-5 w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {status === 'loading' ? (
              <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Enviando...</>
            ) : 'Enviar solicitud'}
          </button>
          <p className="mt-2 text-center text-xs text-slate-600">Sin cotización automática. Atención personalizada.</p>
        </form>
      )}

      <div className="mt-6 pt-6 border-t border-white/8">
        <p className="text-xs text-slate-500 text-center mb-4">O contáctanos directamente</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a href={buildWhatsAppUrl('Hola, necesito información sobre un servicio de transporte.', 'contact_form')}
            target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsAppClick('contact')}
            className="flex-1 flex items-center justify-center gap-2 bg-[#25D366]/15 border border-[#25D366]/30 text-white font-semibold py-3 rounded-xl hover:bg-[#25D366]/25 transition text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.553 4.118 1.522 5.855L.057 23.882l6.196-1.424A11.937 11.937 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 01-5.032-1.383l-.36-.214-3.733.857.887-3.65-.234-.374A9.786 9.786 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z"/></svg>
            WhatsApp
          </a>
          <a href={`tel:${SITE.phone}`} onClick={() => trackPhoneClick('contact')}
            className="flex-1 flex items-center justify-center gap-2 btn-outline text-sm py-3">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            {SITE.phoneDisplay}
          </a>
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

function SuccessMessage({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-500/15 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      </div>
      <h3 className="font-display text-xl font-bold text-white mb-2">¡Mensaje recibido!</h3>
      <p className="text-slate-400 mb-6 text-sm">Te contactaremos a la brevedad, en menos de 2 horas hábiles.</p>
      <button onClick={onReset} className="text-blue-400 font-medium text-sm hover:underline">Enviar otra consulta</button>
    </div>
  )
}
