import { Router } from 'express'
import { pool } from '../db'
import { requireAdmin } from '../middleware/auth'

const router = Router()

// GET /jobs
router.get('/', requireAdmin, async (req, res) => {
  const { status } = req.query
  try {
    const result = await pool.query(
      `SELECT j.*,
              json_agg(json_build_object(
                'id', ja.id,
                'driver_id', ja.driver_id,
                'driver_name', d.name,
                'truck_type', t.truck_type,
                'status', ja.status
              )) FILTER (WHERE ja.id IS NOT NULL) AS assignments
       FROM jobs j
       LEFT JOIN job_assignments ja ON ja.job_id = j.id
       LEFT JOIN drivers d ON d.id = ja.driver_id
       LEFT JOIN trucks t ON t.id = ja.truck_id
       ${status ? 'WHERE j.status = $1' : ''}
       GROUP BY j.id
       ORDER BY j.created_at DESC`,
      status ? [status] : []
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /jobs — create job
router.post('/', requireAdmin, async (req, res) => {
  const {
    client_name, client_phone, origin, destination,
    origin_lat, origin_lng, dest_lat, dest_lng,
    cargo_description, cargo_weight, scheduled_at, notes,
  } = req.body as Record<string, string>

  if (!client_name || !origin || !destination) {
    res.status(400).json({ error: 'client_name, origin, destination required' })
    return
  }

  try {
    const result = await pool.query(
      `INSERT INTO jobs
         (client_name, client_phone, origin, destination,
          origin_lat, origin_lng, dest_lat, dest_lng,
          cargo_description, cargo_weight, scheduled_at, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        client_name, client_phone || null,
        origin, destination,
        origin_lat || null, origin_lng || null,
        dest_lat || null, dest_lng || null,
        cargo_description || null, cargo_weight || null,
        scheduled_at || null, notes || null,
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// PATCH /jobs/:id
router.patch('/:id', requireAdmin, async (req, res) => {
  const allowed = ['status', 'client_phone', 'cargo_description', 'cargo_weight', 'scheduled_at', 'notes']
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

  if (updates.length === 0) { res.status(400).json({ error: 'No valid fields' }); return }
  updates.push(`updated_at = NOW()`)
  values.push(req.params.id)

  try {
    const result = await pool.query(
      `UPDATE jobs SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )
    if (!result.rows[0]) { res.status(404).json({ error: 'Job not found' }); return }
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /jobs/:id/assign — assign driver to job
router.post('/:id/assign', requireAdmin, async (req, res) => {
  const { driver_id, truck_id } = req.body as { driver_id: number; truck_id?: number }
  if (!driver_id) { res.status(400).json({ error: 'driver_id required' }); return }

  try {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const assign = await client.query(
        `INSERT INTO job_assignments (job_id, driver_id, truck_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (job_id, driver_id) DO UPDATE SET status = 'assigned', truck_id = $3
         RETURNING *`,
        [req.params.id, driver_id, truck_id || null]
      )
      await client.query(
        `UPDATE jobs SET status = 'assigned', updated_at = NOW() WHERE id = $1`,
        [req.params.id]
      )
      await client.query('COMMIT')
      res.json(assign.rows[0])
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

export default router
