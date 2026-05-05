import fs from 'fs'
import path from 'path'
import { pool } from './db'

async function migrate() {
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
