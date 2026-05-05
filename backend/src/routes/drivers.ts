import { Router } from 'express'
import { pool } from '../db'
import { requireAdmin, requireAuth } from '../middleware/auth'

const router = Router()

// GET /drivers — public fleet (show_in_fleet = true)
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.id, d.name, d.status, d.is_public, d.show_in_fleet,
              d.cover_image, d.cover_video, d.features,
              t.truck_type, t.truck_plate, t.capacity, t.description,
              lc.lat, lc.lng, lc.updated_at AS last_location_update
       FROM drivers d
       LEFT JOIN trucks t ON t.driver_id = d.id
       LEFT JOIN locations_current lc ON lc.driver_id = d.id
       WHERE d.show_in_fleet = TRUE
       ORDER BY d.created_at DESC`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /drivers/active — active + public drivers for live map
router.get('/active', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.id, d.name, d.status,
              t.truck_type, t.capacity,
              lc.lat, lc.lng, lc.speed, lc.heading, lc.updated_at AS last_location_update
       FROM drivers d
       LEFT JOIN trucks t ON t.driver_id = d.id
       LEFT JOIN locations_current lc ON lc.driver_id = d.id
       WHERE d.is_public = TRUE AND d.status = 'active'
       ORDER BY d.name`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /drivers/all — admin: all drivers with full data
router.get('/all', requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, t.truck_type, t.truck_plate, t.capacity, t.description,
              lc.lat, lc.lng, lc.speed, lc.updated_at AS last_location_update
       FROM drivers d
       LEFT JOIN trucks t ON t.driver_id = d.id
       LEFT JOIN locations_current lc ON lc.driver_id = d.id
       ORDER BY d.created_at DESC`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /drivers/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, t.truck_type, t.truck_plate, t.capacity, t.description,
              lc.lat, lc.lng, lc.updated_at AS last_location_update
       FROM drivers d
       LEFT JOIN trucks t ON t.driver_id = d.id
       LEFT JOIN locations_current lc ON lc.driver_id = d.id
       WHERE d.id = $1`,
      [req.params.id]
    )
    if (!result.rows[0]) { res.status(404).json({ error: 'Driver not found' }); return }
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /drivers — self-registration (public)
router.post('/', async (req, res) => {
  const { name, phone, email, truckType, truckPlate, capacity, description } = req.body as Record<string, string>
  if (!name || !phone || !truckType) {
    res.status(400).json({ error: 'name, phone, truckType required' })
    return
  }
  try {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const drv = await client.query(
        `INSERT INTO drivers (name, phone, email, status)
         VALUES ($1, $2, $3, 'pending') RETURNING id`,
        [name, phone, email || null]
      )
      const driverId = drv.rows[0].id
      await client.query(
        `INSERT INTO trucks (driver_id, truck_type, truck_plate, capacity, description)
         VALUES ($1, $2, $3, $4, $5)`,
        [driverId, truckType, truckPlate || null, capacity || null, description || null]
      )
      await client.query('COMMIT')
      res.status(201).json({ id: driverId, message: 'Registration received' })
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// PATCH /drivers/:id — admin update (status, visibility, media, features)
router.patch('/:id', requireAdmin, async (req, res) => {
  const allowed = ['status', 'is_public', 'show_in_fleet', 'cover_image', 'cover_video', 'features']
  const updates: string[] = []
  const values: unknown[] = []
  let idx = 1

  for (const key of allowed) {
    if (key in req.body) {
      updates.push(`${key} = $${idx}`)
      values.push(req.body[key])
      idx++
    }
  }

  if (updates.length === 0) { res.status(400).json({ error: 'No valid fields to update' }); return }

  updates.push(`updated_at = NOW()`)
  values.push(req.params.id)

  try {
    const result = await pool.query(
      `UPDATE drivers SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )
    if (!result.rows[0]) { res.status(404).json({ error: 'Driver not found' }); return }
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// DELETE /drivers/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM drivers WHERE id = $1', [req.params.id])
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
