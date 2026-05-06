import fs from 'fs'
import path from 'path'
import { pool } from './db'

async function waitForDb(retries = 20, delayMs = 3000): Promise<void> {
  for (let i = 1; i <= retries; i++) {
    try {
      await pool.query('SELECT 1')
      console.log('✓ DB reachable, running migrations...')
      return
    } catch (err) {
      console.log(`  DB not ready (attempt ${i}/${retries}): ${(err as Error).message}`)
      if (i === retries) throw new Error('DB unreachable after all retries')
      await new Promise((r) => setTimeout(r, delayMs))
    }
  }
}

async function migrate() {
  await waitForDb()

  const migDir = path.join(__dirname, '..', 'migrations')
  const files = fs.readdirSync(migDir).filter((f) => f.endsWith('.sql')).sort()

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migDir, file), 'utf8')
    console.log(`Running migration: ${file}`)
    await pool.query(sql)
    console.log(`  ✓ ${file}`)
  }

  await pool.end()
  console.log('All migrations complete.')
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
