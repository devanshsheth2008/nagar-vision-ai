/*
# NAGAR VISION AI — Complete Database Schema

## Overview
Creates the full database schema for the Nagar Vision AI smart-city waste
detection and monitoring system for Gandhidham Municipal Corporation.

## New Tables

1. **cameras** — CCTV camera registry
   - id (text PK, e.g. 'CAM-001')
   - name, location, lat/lng, status (online/offline/maintenance)
   - zone, resolution, last_heartbeat, created_at

2. **officers** — Municipal field officers
   - id (text PK, e.g. 'OFC-001')
   - name, badge, role, zone, status (on-duty/off-duty/on-leave)
   - phone, incidents_resolved, active_assignments, joined_at

3. **incidents** — Waste detection incidents
   - id (text PK, e.g. 'INC-2026-1042')
   - category, severity, status, location, lat/lng
   - detected_at, camera_id (FK → cameras), confidence, description
   - assigned_officer_id (FK → officers, nullable)

4. **vehicle_records** — ANPR vehicle detection records
   - id (text PK, e.g. 'VEH-5042')
   - plate_number, vehicle_type, ocr_confidence
   - incident_id (FK → incidents), detected_at, location
   - verified, verified_by

5. **cleanup_operations** — Field cleanup operations
   - id (text PK, e.g. 'CLN-3201')
   - incident_id (FK → incidents), officer_id (FK → officers)
   - location, crew_size, status, scheduled_at, completed_at
   - waste_collected, truck_id

6. **hotspots** — Waste accumulation hotspot zones
   - id (text PK, e.g. 'HS-001')
   - location, lat/lng, incident_count, trend, severity
   - last_incident, radius

7. **notifications** — System notification alerts
   - id (text PK)
   - title, message, type (alert/info/success)
   - timestamp, read

8. **detection_sessions** — AI image analysis sessions
   - id (uuid PK)
   - image_url, results (jsonb array of detection objects)
   - processed_at, processing_time, model_version, status

## Security
- RLS enabled on ALL tables.
- This is a single-tenant municipal app with NO sign-in screen.
- All policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`
  because all data is intentionally shared across municipal operators.
- Grants: CRUD to `anon, authenticated` on all tables.
- service_role granted CRUD for edge function access.

## Indexes
- incidents: camera_id, assigned_officer_id, status, severity, detected_at
- vehicle_records: incident_id, verified
- cleanup_operations: incident_id, officer_id, status
- hotspots: severity, trend
- notifications: read, timestamp

## Notes
1. Text primary keys are used for human-readable entity IDs (CAM-001, INC-2026-1042, etc.)
   to maintain compatibility with the existing frontend code.
2. All foreign keys use ON DELETE SET NULL for nullable references to preserve
   historical data when a referenced entity is removed.
3. detection_sessions uses uuid PK + jsonb for flexible detection result storage.
4. Timestamps use timestamptz with sensible defaults.
*/

-- ============================================================
-- 1. CAMERAS
-- ============================================================
CREATE TABLE IF NOT EXISTS cameras (
  id text PRIMARY KEY,
  name text NOT NULL,
  location text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  status text NOT NULL DEFAULT 'online'
    CHECK (status IN ('online', 'offline', 'maintenance')),
  zone text NOT NULL,
  resolution text NOT NULL DEFAULT '1080p',
  last_heartbeat timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cameras ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON cameras TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cameras TO service_role;

DROP POLICY IF EXISTS "cameras_select_all" ON cameras;
CREATE POLICY "cameras_select_all" ON cameras FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "cameras_insert_all" ON cameras;
CREATE POLICY "cameras_insert_all" ON cameras FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "cameras_update_all" ON cameras;
CREATE POLICY "cameras_update_all" ON cameras FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cameras_delete_all" ON cameras;
CREATE POLICY "cameras_delete_all" ON cameras FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 2. OFFICERS
-- ============================================================
CREATE TABLE IF NOT EXISTS officers (
  id text PRIMARY KEY,
  name text NOT NULL,
  badge text NOT NULL,
  role text NOT NULL
    CHECK (role IN ('Inspector', 'Supervisor', 'Field Officer', 'Operator')),
  zone text NOT NULL,
  status text NOT NULL DEFAULT 'on-duty'
    CHECK (status IN ('on-duty', 'off-duty', 'on-leave')),
  phone text NOT NULL,
  incidents_resolved integer NOT NULL DEFAULT 0,
  active_assignments integer NOT NULL DEFAULT 0,
  joined_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE officers ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON officers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON officers TO service_role;

DROP POLICY IF EXISTS "officers_select_all" ON officers;
CREATE POLICY "officers_select_all" ON officers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "officers_insert_all" ON officers;
CREATE POLICY "officers_insert_all" ON officers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "officers_update_all" ON officers;
CREATE POLICY "officers_update_all" ON officers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "officers_delete_all" ON officers;
CREATE POLICY "officers_delete_all" ON officers FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- 3. INCIDENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS incidents (
  id text PRIMARY KEY,
  category text NOT NULL
    CHECK (category IN ('Garbage Pile', 'Plastic Waste', 'Construction Debris', 'Timber Scrap', 'Mixed Solid Waste')),
  severity text NOT NULL
    CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'assigned', 'in-progress', 'resolved')),
  location text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  detected_at timestamptz NOT NULL DEFAULT now(),
  camera_id text REFERENCES cameras(id) ON DELETE SET NULL,
  confidence double precision NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  assigned_officer_id text REFERENCES officers(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON incidents TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON incidents TO service_role;

DROP POLICY IF EXISTS "incidents_select_all" ON incidents;
CREATE POLICY "incidents_select_all" ON incidents FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "incidents_insert_all" ON incidents;
CREATE POLICY "incidents_insert_all" ON incidents FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "incidents_update_all" ON incidents;
CREATE POLICY "incidents_update_all" ON incidents FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "incidents_delete_all" ON incidents;
CREATE POLICY "incidents_delete_all" ON incidents FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_incidents_camera_id ON incidents(camera_id);
CREATE INDEX IF NOT EXISTS idx_incidents_officer_id ON incidents(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_detected_at ON incidents(detected_at DESC);

-- ============================================================
-- 4. VEHICLE_RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicle_records (
  id text PRIMARY KEY,
  plate_number text NOT NULL,
  vehicle_type text NOT NULL
    CHECK (vehicle_type IN ('Truck', 'Car', 'Van', 'Auto-rickshaw', 'Dumper')),
  ocr_confidence double precision NOT NULL DEFAULT 0,
  incident_id text REFERENCES incidents(id) ON DELETE SET NULL,
  detected_at timestamptz NOT NULL DEFAULT now(),
  location text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  verified_by text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vehicle_records ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON vehicle_records TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vehicle_records TO service_role;

DROP POLICY IF EXISTS "vehicle_records_select_all" ON vehicle_records;
CREATE POLICY "vehicle_records_select_all" ON vehicle_records FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "vehicle_records_insert_all" ON vehicle_records;
CREATE POLICY "vehicle_records_insert_all" ON vehicle_records FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "vehicle_records_update_all" ON vehicle_records;
CREATE POLICY "vehicle_records_update_all" ON vehicle_records FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "vehicle_records_delete_all" ON vehicle_records;
CREATE POLICY "vehicle_records_delete_all" ON vehicle_records FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_vehicle_records_incident_id ON vehicle_records(incident_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_records_verified ON vehicle_records(verified);

-- ============================================================
-- 5. CLEANUP_OPERATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS cleanup_operations (
  id text PRIMARY KEY,
  incident_id text REFERENCES incidents(id) ON DELETE SET NULL,
  officer_id text REFERENCES officers(id) ON DELETE SET NULL,
  location text NOT NULL,
  crew_size integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'in-progress', 'completed', 'overdue')),
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  waste_collected double precision NOT NULL DEFAULT 0,
  truck_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cleanup_operations ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON cleanup_operations TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cleanup_operations TO service_role;

DROP POLICY IF EXISTS "cleanup_operations_select_all" ON cleanup_operations;
CREATE POLICY "cleanup_operations_select_all" ON cleanup_operations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "cleanup_operations_insert_all" ON cleanup_operations;
CREATE POLICY "cleanup_operations_insert_all" ON cleanup_operations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "cleanup_operations_update_all" ON cleanup_operations;
CREATE POLICY "cleanup_operations_update_all" ON cleanup_operations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "cleanup_operations_delete_all" ON cleanup_operations;
CREATE POLICY "cleanup_operations_delete_all" ON cleanup_operations FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_cleanup_incident_id ON cleanup_operations(incident_id);
CREATE INDEX IF NOT EXISTS idx_cleanup_officer_id ON cleanup_operations(officer_id);
CREATE INDEX IF NOT EXISTS idx_cleanup_status ON cleanup_operations(status);

-- ============================================================
-- 6. HOTSPOTS
-- ============================================================
CREATE TABLE IF NOT EXISTS hotspots (
  id text PRIMARY KEY,
  location text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  incident_count integer NOT NULL DEFAULT 0,
  trend text NOT NULL DEFAULT 'stable'
    CHECK (trend IN ('rising', 'stable', 'declining')),
  severity text NOT NULL DEFAULT 'medium'
    CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  last_incident timestamptz DEFAULT now(),
  radius integer NOT NULL DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hotspots ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON hotspots TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hotspots TO service_role;

DROP POLICY IF EXISTS "hotspots_select_all" ON hotspots;
CREATE POLICY "hotspots_select_all" ON hotspots FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "hotspots_insert_all" ON hotspots;
CREATE POLICY "hotspots_insert_all" ON hotspots FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "hotspots_update_all" ON hotspots;
CREATE POLICY "hotspots_update_all" ON hotspots FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "hotspots_delete_all" ON hotspots;
CREATE POLICY "hotspots_delete_all" ON hotspots FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_hotspots_severity ON hotspots(severity);
CREATE INDEX IF NOT EXISTS idx_hotspots_trend ON hotspots(trend);

-- ============================================================
-- 7. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id text PRIMARY KEY,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info'
    CHECK (type IN ('alert', 'info', 'success')),
  "timestamp" timestamptz NOT NULL DEFAULT now(),
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO service_role;

DROP POLICY IF EXISTS "notifications_select_all" ON notifications;
CREATE POLICY "notifications_select_all" ON notifications FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "notifications_insert_all" ON notifications;
CREATE POLICY "notifications_insert_all" ON notifications FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "notifications_update_all" ON notifications;
CREATE POLICY "notifications_update_all" ON notifications FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "notifications_delete_all" ON notifications;
CREATE POLICY "notifications_delete_all" ON notifications FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON notifications("timestamp" DESC);

-- ============================================================
-- 8. DETECTION_SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS detection_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  results jsonb NOT NULL DEFAULT '[]'::jsonb,
  processed_at timestamptz DEFAULT now(),
  processing_time double precision NOT NULL DEFAULT 0,
  model_version text NOT NULL DEFAULT 'nagar-vision-v2.3',
  status text NOT NULL DEFAULT 'processing'
    CHECK (status IN ('processing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE detection_sessions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON detection_sessions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON detection_sessions TO service_role;

DROP POLICY IF EXISTS "detection_sessions_select_all" ON detection_sessions;
CREATE POLICY "detection_sessions_select_all" ON detection_sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "detection_sessions_insert_all" ON detection_sessions;
CREATE POLICY "detection_sessions_insert_all" ON detection_sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "detection_sessions_update_all" ON detection_sessions;
CREATE POLICY "detection_sessions_update_all" ON detection_sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "detection_sessions_delete_all" ON detection_sessions;
CREATE POLICY "detection_sessions_delete_all" ON detection_sessions FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_detection_sessions_status ON detection_sessions(status);
CREATE INDEX IF NOT EXISTS idx_detection_sessions_created_at ON detection_sessions(created_at DESC);
