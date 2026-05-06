import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import http from 'http'
import { pool } from './db'
import { initWebSocket } from './websocket'

import authRoutes    from './routes/auth'
import driverRoutes  from './routes/drivers'
import jobRoutes     from './routes/jobs'
import gpsRoutes     from './routes/gps'
import leadRoutes    from './routes/leads'

const app = express()

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, GPS devices)
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      cb(null, true)
    } else {
      cb(new Error(`CORS: origin ${origin} not allowed`))
    }
  },
  credentials: true,
}))

app.use(express.json({ limit: '2mb' }))

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true, db: 'connected', ts: new Date().toISOString() })
  } catch {
    res.status(503).json({ ok: false, db: 'disconnected' })
  }
})

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth',    authRoutes)
app.use('/drivers', driverRoutes)
app.use('/jobs',    jobRoutes)
app.use('/gps',     gpsRoutes)
app.use('/leads',   leadRoutes)

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 4000

let dbReady = false

async function waitForDb(retries = 20, delayMs = 3000): Promise<void> {
  for (let i = 1; i <= retries; i++) {
    try {
      await pool.query('SELECT 1')
      dbReady = true
      console.log('✓ PostgreSQL connected')
      return
    } catch (err) {
      console.log(`  DB not ready (attempt ${i}/${retries}): ${(err as Error).message}`)
      if (i === retries) {
        console.error('✗ Could not connect to PostgreSQL after all retries — DB calls will fail')
        return
      }
      await new Promise((r) => setTimeout(r, delayMs))
    }
  }
}

// Override health to reflect DB state
app.get('/ready', (_req, res) => {
  if (dbReady) res.json({ ok: true, db: 'connected' })
  else res.status(503).json({ ok: false, db: 'connecting' })
})

async function start() {
  // Start HTTP server immediately so Traefik can route traffic
  const server = http.createServer(app)
  initWebSocket(server)

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ API listening on port ${PORT}`)
  })

  // Connect to DB in background — routes will return 503 if called before ready
  waitForDb()
}

start()
