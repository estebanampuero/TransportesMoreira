import { Router } from 'express'
import { pool } from '../db'
import { requireAdmin } from '../middleware/auth'

const router = Router()

// POST /leads — public form submission
router.post('/', async (req, res) => {
  const {
    name, phone, email, company,
    origin, destination, cargo_type, weight, message,
    photos, source,
  } = req.body as Record<string, string | string[]>

  if (!name) { res.status(400).json({ error: 'name required' }); return }

  try {
    const result = await pool.query(
      `INSERT INTO leads
         (name, phone, email, company, origin, destination, cargo_type, weight, message, photos, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id, created_at`,
      [
        name,
        phone || null, email || null, company || null,
        origin || null, destination || null,
        cargo_type || null, weight || null, message || null,
        Array.isArray(photos) ? photos : [],
        source || 'website',
      ]
    )
    res.status(201).json({ ok: true, id: result.rows[0].id })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /leads — admin view with optional status filter
router.get('/', requireAdmin, async (req, res) => {
  const { status } = req.query
  try {
    const result = await pool.query(
      `SELECT * FROM leads
       ${status ? 'WHERE status = $1' : ''}
       ORDER BY created_at DESC`,
      status ? [status] : []
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// PATCH /leads/:id — update status
router.patch('/:id', requireAdmin, async (req, res) => {
  const { status } = req.body as { status?: string }
  const valid = ['new', 'contacted', 'closed', 'lost']
  if (!status || !valid.includes(status)) {
    res.status(400).json({ error: `status must be one of: ${valid.join(', ')}` })
    return
  }
  try {
    const result = await pool.query(
      `UPDATE leads SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    )
    if (!result.rows[0]) { res.status(404).json({ error: 'Lead not found' }); return }
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
