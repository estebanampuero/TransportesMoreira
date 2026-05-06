import { createClient } from '@supabase/supabase-js'

const url  = import.meta.env.VITE_SUPABASE_URL  as string
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, anon)

// ─── Row types (mirrors PostgreSQL schema) ────────────────────────────────────
export interface DriverRow {
  id: number
  name: string
  phone: string
  email: string | null
  status: string
  is_public: boolean
  show_in_fleet: boolean
  cover_image: string
  cover_video: string
  features: string[]
  firebase_id: string | null
  created_at: string
  updated_at: string
}

export interface TruckRow {
  id: number
  driver_id: number
  truck_type: string
  truck_plate: string | null
  capacity: string | null
  description: string | null
}

export interface LeadRow {
  id: number
  name: string
  phone: string | null
  email: string | null
  company: string | null
  origin: string | null
  destination: string | null
  cargo_type: string | null
  weight: string | null
  message: string | null
  photos: string[]
  status: string
  source: string
  created_at: string
  updated_at: string
}

export interface LocationCurrentRow {
  driver_id: number
  lat: number
  lng: number
  speed: number | null
  heading: number | null
  updated_at: string
}
