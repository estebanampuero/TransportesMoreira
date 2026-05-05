import { logEvent, Analytics } from 'firebase/analytics'
import { analytics } from './firebase'

type EventName =
  | 'form_submit'
  | 'whatsapp_click'
  | 'phone_click'
  | 'deep_scroll'
  | 'cta_click'

interface EventParams {
  label?: string
  section?: string
  value?: number
}

function track(name: EventName, params: EventParams = {}): void {
  if (analytics) {
    logEvent(analytics as Analytics, name, params)
  }
  // Fallback: GA4 via gtag if loaded externally
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as Window & { gtag: (...args: unknown[]) => void }).gtag('event', name, params)
  }
}

export function trackFormSubmit(): void {
  track('form_submit', { label: 'contact_form' })
}

export function trackWhatsAppClick(section: string): void {
  track('whatsapp_click', { label: 'whatsapp', section })
}

export function trackPhoneClick(section: string): void {
  track('phone_click', { label: 'phone', section })
}

export function trackCTAClick(label: string, section: string): void {
  track('cta_click', { label, section })
}

export function initScrollDepthTracking(): () => void {
  const milestones = new Set<number>()
  const thresholds = [25, 50, 75, 90]

  const handleScroll = (): void => {
    const scrolled = window.scrollY
    const total = document.documentElement.scrollHeight - window.innerHeight
    if (total <= 0) return
    const pct = Math.round((scrolled / total) * 100)

    thresholds.forEach((t) => {
      if (pct >= t && !milestones.has(t)) {
        milestones.add(t)
        track('deep_scroll', { value: t, label: `scroll_${t}pct` })
      }
    })
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
  return () => window.removeEventListener('scroll', handleScroll)
}
