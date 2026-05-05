import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Admin from './pages/Admin'
import TruckDriverModal from './components/TruckDriverModal'
import { initScrollDepthTracking } from './lib/analytics'
import { buildWhatsAppUrl } from './lib/seo'
import { trackWhatsAppClick } from './lib/analytics'

const WHATSAPP_MSG = 'Hola, necesito información sobre servicios de transporte de carga.'

function Layout() {
  const [driverOpen, setDriverOpen] = useState(false)

  useEffect(() => {
    const cleanup = initScrollDepthTracking()
    return cleanup
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Header onDriverClick={() => setDriverOpen(true)} />
      <Home />
      <Footer />

      {/* Driver registration modal */}
      <TruckDriverModal open={driverOpen} onClose={() => setDriverOpen(false)} />

      {/* Floating WhatsApp button */}
      <a
        href={buildWhatsAppUrl(WHATSAPP_MSG, 'floating_button')}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsAppClick('floating')}
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#22c35e] text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 group"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.553 4.118 1.522 5.855L.057 23.882l6.196-1.424A11.937 11.937 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.808 9.808 0 01-5.032-1.383l-.36-.214-3.733.857.887-3.65-.234-.374A9.786 9.786 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z" />
        </svg>
        <span className="absolute right-16 bg-slate-900 border border-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-glass">
          WhatsApp
        </span>
      </a>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  )
}
