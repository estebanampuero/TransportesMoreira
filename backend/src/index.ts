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

async function start() {
  // Verify DB before accepting traffic
  try {
    await pool.query('SELECT 1')
    console.log('✓ PostgreSQL connected')
  } catch (err) {
    console.error('✗ PostgreSQL connection failed:', (err as Error).message)
    process.exit(1)
  }

  const server = http.createServer(app)
  initWebSocket(server)

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ API listening on port ${PORT}`)
  })
}

start()
