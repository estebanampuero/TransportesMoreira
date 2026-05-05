-- ─────────────────────────────────────────────────────────────────────────────
-- Transportes Moreira — PostgreSQL schema v1
-- ─────────────────────────────────────────────────────────────────────────────

-- Users (admin + driver accounts)
CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  email        TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'driver', -- 'admin' | 'driver'
  name         TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Drivers (truck operators — mirrors Firestore collection)
CREATE TABLE IF NOT EXISTS drivers (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  phone          TEXT NOT NULL,
  email          TEXT,
  status         TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'active' | 'inactive'
  is_public      BOOLEAN DEFAULT FALSE,
  show_in_fleet  BOOLEAN DEFAULT FALSE,
  cover_image    TEXT DEFAULT '',
  cover_video    TEXT DEFAULT '',
  features       TEXT[] DEFAULT '{}',
  firebase_id    TEXT UNIQUE,               -- legacy Firestore doc id
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Trucks (one driver can have multiple trucks)
CREATE TABLE IF NOT EXISTS trucks (
  id           SERIAL PRIMARY KEY,
  driver_id    INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
  truck_type   TEXT NOT NULL,
  truck_plate  TEXT,
  capacity     TEXT,
  description  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- GPS devices — maps device_id (IMEI or custom) → driver
CREATE TABLE IF NOT EXISTS gps_devices (
  id         SERIAL PRIMARY KEY,
  device_id  TEXT UNIQUE NOT NULL,
  driver_id  INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
  imei       TEXT,
  model      TEXT,  -- 'Sinotrack ST-901', 'Teltonika FMB920', etc.
  active     BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GPS location history (append-only)
CREATE TABLE IF NOT EXISTS locations (
  id          BIGSERIAL PRIMARY KEY,
  driver_id   INTEGER NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  device_id   TEXT,
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  speed       REAL,
  heading     REAL,
  accuracy    REAL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Current location cache — one row per driver (upserted on every GPS ping)
CREATE TABLE IF NOT EXISTS locations_current (
  driver_id  INTEGER PRIMARY KEY REFERENCES drivers(id) ON DELETE CASCADE,
  device_id  TEXT,
  lat        DOUBLE PRECISION NOT NULL,
  lng        DOUBLE PRECISION NOT NULL,
  speed      REAL,
  heading    REAL,
  accuracy   REAL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs (service requests)
CREATE TABLE IF NOT EXISTS jobs (
  id                  SERIAL PRIMARY KEY,
  client_name         TEXT NOT NULL,
  client_phone        TEXT,
  origin              TEXT NOT NULL,
  destination         TEXT NOT NULL,
  origin_lat          DOUBLE PRECISION,
  origin_lng          DOUBLE PRECISION,
  dest_lat            DOUBLE PRECISION,
  dest_lng            DOUBLE PRECISION,
  cargo_description   TEXT,
  cargo_weight        TEXT,
  status              TEXT NOT NULL DEFAULT 'pending',
  -- 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  scheduled_at        TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Job assignments (job → driver + truck)
CREATE TABLE IF NOT EXISTS job_assignments (
  id          SERIAL PRIMARY KEY,
  job_id      INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  driver_id   INTEGER NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  truck_id    INTEGER REFERENCES trucks(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  status      TEXT NOT NULL DEFAULT 'assigned',
  -- 'assigned' | 'accepted' | 'rejected' | 'completed'
  UNIQUE(job_id, driver_id)
);

-- Client leads (mirrors Firestore client_leads)
CREATE TABLE IF NOT EXISTS leads (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  phone        TEXT,
  email        TEXT,
  company      TEXT,
  origin       TEXT,
  destination  TEXT,
  cargo_type   TEXT,
  weight       TEXT,
  message      TEXT,
  photos       TEXT[] DEFAULT '{}',
  status       TEXT DEFAULT 'new',  -- 'new' | 'contacted' | 'closed' | 'lost'
  source       TEXT DEFAULT 'website',
  firebase_id  TEXT UNIQUE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_locations_driver_id   ON locations(driver_id);
CREATE INDEX IF NOT EXISTS idx_locations_recorded_at ON locations(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_drivers_status        ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_fleet         ON drivers(show_in_fleet) WHERE show_in_fleet = TRUE;
CREATE INDEX IF NOT EXISTS idx_jobs_status           ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_gps_devices_driver    ON gps_devices(driver_id);

-- ─── Seed admin user ─────────────────────────────────────────────────────────
-- Password 'moreira2025' hashed with bcrypt rounds=12
-- Replace hash if you change the password
INSERT INTO users (email, password_hash, role, name)
VALUES (
  'admin@transportesmoreira.cl',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJbekRSmKkjfjrsmgGMBDp8.',
  'admin',
  'Administrador Moreira'
) ON CONFLICT (email) DO NOTHING;
