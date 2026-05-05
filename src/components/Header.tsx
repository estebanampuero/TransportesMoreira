import { useState, useEffect } from 'react'
import { SITE } from '../lib/seo'
import { trackPhoneClick } from '../lib/analytics'

const navLinks = [
  { href: '#servicios', label: 'Servicios' },
  { href: '#flota', label: 'Flota' },
  { href: '#testimonios', label: 'Testimonios' },
  { href: '#contacto', label: 'Contacto' },
]

interface HeaderProps {
  onDriverClick: () => void
}

export default function Header({ onDriverClick }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-slate-900/90 backdrop-blur-xl border-b border-white/8 shadow-glass'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <a href="/" aria-label="Transportes Moreira — inicio" className="flex items-center gap-2">
          <span className="text-xl font-display font-bold text-white">
            Transportes<span className="text-gradient">Moreira</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onDriverClick}
            className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors border border-white/15 px-4 py-2 rounded-lg hover:border-cyan-400/40"
          >
            Trabaja con nosotros
          </button>
          <a
            href={`tel:${SITE.phone}`}
            onClick={() => trackPhoneClick('header')}
            className="text-sm text-slate-300 hover:text-white transition-colors"
          >
            {SITE.phoneDisplay}
          </a>
          <a href="#contacto" className="btn-primary text-sm px-5 py-2.5">
            Solicitar atención
          </a>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden text-white p-2"
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-white/8 px-6 py-5 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-slate-200 font-medium hover:text-cyan-400 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => { setOpen(false); onDriverClick() }}
            className="text-left text-cyan-400 font-medium"
          >
            Trabaja con nosotros
          </button>
          <a
            href="#contacto"
            onClick={() => setOpen(false)}
            className="btn-primary text-center"
          >
            Solicitar atención
          </a>
        </div>
      )}
    </header>
  )
}
