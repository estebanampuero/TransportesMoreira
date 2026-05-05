import { Router } from 'express'
import { pool } from '../db'
import { broadcast } from '../websocket'

const router = Router()

// POST /gps/update — called by GPS hardware (Sinotrack, Teltonika, etc.)
// Body: { deviceId, lat, lng, speed?, heading?, accuracy?, timestamp? }
// Auth: device API key in header X-GPS-Key
router.post('/update', async (req, res) => {
  const apiKey = req.headers['x-gps-key']
  if (apiKey !== process.env.GPS_API_KEY) {
    res.status(401).json({ error: 'Invalid GPS key' })
    return
  }

  const { deviceId, lat, lng, speed, heading, accuracy, timestamp } = req.body as {
    deviceId: string
    lat: number; lng: number
    speed?: number; heading?: number; accuracy?: number
    timestamp?: string
  }

  if (!deviceId || lat == null || lng == null) {
    res.status(400).json({ error: 'deviceId, lat, lng required' })
    return
  }

  try {
    // Resolve device → driver
    const devResult = await pool.query(
      `SELECT driver_id FROM gps_devices WHERE device_id = $1 AND active = TRUE`,
      [deviceId]
    )
    if (!devResult.rows[0]) {
      res.status(404).json({ error: `Unknown device: ${deviceId}` })
      return
    }

    const driverId: number = devResult.rows[0].driver_id
    const recordedAt = timestamp ? new Date(timestamp) : new Date()

    // 1. Append to history
    await pool.query(
      `INSERT INTO locations (driver_id, device_id, lat, lng, speed, heading, accuracy, recorded_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [driverId, deviceId, lat, lng, speed ?? null, heading ?? null, accuracy ?? null, recordedAt]
    )

    // 2. Upsert current location
    await pool.query(
      `INSERT INTO locations_current (driver_id, device_id, lat, lng, speed, heading, accuracy, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
       ON CONFLICT (driver_id) DO UPDATE SET
         device_id = $2, lat = $3, lng = $4,
         speed = $5, heading = $6, accuracy = $7,
         updated_at = NOW()`,
      [driverId, deviceId, lat, lng, speed ?? null, heading ?? null, accuracy ?? null]
    )

    // 3. Mark driver as active
    await pool.query(
      `UPDATE drivers SET status = 'active', updated_at = NOW() WHERE id = $1`,
      [driverId]
    )

    // 4. Broadcast over WebSocket to all connected admin clients
    broadcast({ type: 'gps', driverId, lat, lng, speed, heading, updatedAt: new Date().toISOString() })

    res.json({ ok: true, driverId })
  } catch (err) {
    console.error('/gps/update error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /gps/history/:driverId?limit=100
router.get('/history/:driverId', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 1000)
  try {
    const result = await pool.query(
      `SELECT lat, lng, speed, heading, recorded_at
       FROM locations
       WHERE driver_id = $1
       ORDER BY recorded_at DESC
       LIMIT $2`,
      [req.params.driverId, limit]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /gps/devices — list registered GPS devices
router.get('/devices', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT gd.*, d.name AS driver_name
       FROM gps_devices gd
       LEFT JOIN drivers d ON d.id = gd.driver_id
       ORDER BY gd.created_at DESC`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /gps/devices — register a new GPS device
router.post('/devices', async (req, res) => {
  const { device_id, driver_id, imei, model } = req.body as {
    device_id: string; driver_id?: number; imei?: string; model?: string
  }
  if (!device_id) { res.status(400).json({ error: 'device_id required' }); return }

  try {
    const result = await pool.query(
      `INSERT INTO gps_devices (device_id, driver_id, imei, model)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (device_id) DO UPDATE SET driver_id = $2, imei = $3, model = $4
       RETURNING *`,
      [device_id, driver_id || null, imei || null, model || null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
