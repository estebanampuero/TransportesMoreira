import { lazy, Suspense } from 'react'
import HeroSection from '../sections/HeroSection'

const ServicesSection  = lazy(() => import('../sections/ServicesSection'))
const Testimonials     = lazy(() => import('../components/Testimonials'))
const ClientLeadForm   = lazy(() => import('../components/ClientLeadForm'))
const SEOSection       = lazy(() => import('../sections/SEOSection'))
const ContactSection   = lazy(() => import('../sections/ContactSection'))

function SectionLoader() {
  return (
    <div className="py-24 flex justify-center bg-slate-950" aria-hidden="true">
      <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function Home() {
  return (
    <main>
      <HeroSection />
      <Suspense fallback={<SectionLoader />}>
        <ServicesSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <Testimonials />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <ClientLeadForm />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <SEOSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <ContactSection />
      </Suspense>
    </main>
  )
}
