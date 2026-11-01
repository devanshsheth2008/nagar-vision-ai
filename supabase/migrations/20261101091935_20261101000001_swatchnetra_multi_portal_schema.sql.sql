/*
# SWATCHNETRA — Multi-Portal Role-Based Schema

## Overview
Transforms the single-tenant Nagar Vision AI schema into a multi-portal
role-based system with three portals: Admin, Citizen, and Cleaning Crew.

## New Tables
1. profiles — User role (admin/citizen/crew), full_name, phone
2. complaints — Citizen-reported garbage complaints with workflow status
3. complaint_photos — Photos attached to complaints
4. crew_tasks — Tasks assigned to crew members
5. task_photos — Before/after evidence photos

## Security
- RLS on all new tables with role-based policies
- is_admin() helper function (SECURITY DEFINER)
- Auto-create profile on signup via trigger
- Existing tables: policies changed to admin-only (authenticated)

## Notes
1. profiles created first, then is_admin() function, then all policies
2. Complaint workflow: submitted → verified → assigned → in-progress → evidence-uploaded → resolved (or rejected)
3. All existing data preserved; only access policies change
*/

-- ============================================================
-- 1. PROFILES TABLE (no policies yet — created after is_admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'citizen'
    CHECK (role IN ('admin', 'citizen', 'crew')),
  full_name text NOT NULL DEFAULT '',
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. COMPLAINTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'other'
    CHECK (category IN ('garbage-pile', 'plastic-waste', 'construction-debris', 'mixed-waste', 'drainage-overflow', 'other')),
  description text NOT NULL DEFAULT '',
  location_text text NOT NULL DEFAULT '',
  lat double precision NOT NULL DEFAULT 23.7337,
  lng double precision NOT NULL DEFAULT 70.1319,
  status text NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'verified', 'assigned', 'in-progress', 'evidence-uploaded', 'resolved', 'rejected')),
  severity text DEFAULT NULL
    CHECK (severity IS NULL OR severity IN ('low', 'medium', 'high', 'critical')),
  assigned_crew_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. COMPLAINT_PHOTOS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS complaint_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  caption text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE complaint_photos ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. CREW_TASKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS crew_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  crew_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'assigned'
    CHECK (status IN ('assigned', 'in-progress', 'completed', 'verified')),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  verified_at timestamptz,
  admin_notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crew_tasks ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. TASK_PHOTOS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS task_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES crew_tasks(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  photo_type text NOT NULL DEFAULT 'before'
    CHECK (photo_type IN ('before', 'after')),
  caption text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE task_photos ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. HELPER FUNCTION: is_admin()
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ============================================================
-- 7. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (NEW.id, 'citizen', COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''));
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 8. GRANTS
-- ============================================================
GRANT SELECT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON complaints TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON complaints TO service_role;

GRANT SELECT, INSERT, DELETE ON complaint_photos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON complaint_photos TO service_role;

GRANT SELECT, INSERT, UPDATE ON crew_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON crew_tasks TO service_role;

GRANT SELECT, INSERT ON task_photos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON task_photos TO service_role;

-- ============================================================
-- 9. PROFILES POLICIES
-- ============================================================
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON profiles;
CREATE POLICY "profiles_select_own_or_admin" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- 10. COMPLAINTS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "complaints_select_role" ON complaints;
CREATE POLICY "complaints_select_role" ON complaints FOR SELECT
  TO authenticated USING (
    auth.uid() = citizen_id
    OR public.is_admin()
    OR auth.uid() = assigned_crew_id
  );

DROP POLICY IF EXISTS "complaints_insert_own" ON complaints;
CREATE POLICY "complaints_insert_own" ON complaints FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = citizen_id);

DROP POLICY IF EXISTS "complaints_update_role" ON complaints;
CREATE POLICY "complaints_update_role" ON complaints FOR UPDATE
  TO authenticated
  USING (auth.uid() = citizen_id OR public.is_admin())
  WITH CHECK (auth.uid() = citizen_id OR public.is_admin());

DROP POLICY IF EXISTS "complaints_delete_admin" ON complaints;
CREATE POLICY "complaints_delete_admin" ON complaints FOR DELETE
  TO authenticated USING (public.is_admin());

-- ============================================================
-- 11. COMPLAINT_PHOTOS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "complaint_photos_select_role" ON complaint_photos;
CREATE POLICY "complaint_photos_select_role" ON complaint_photos FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM complaints c
      WHERE c.id = complaint_photos.complaint_id
      AND (c.citizen_id = auth.uid() OR public.is_admin() OR c.assigned_crew_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "complaint_photos_insert_own" ON complaint_photos;
CREATE POLICY "complaint_photos_insert_own" ON complaint_photos FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM complaints c
      WHERE c.id = complaint_photos.complaint_id AND c.citizen_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "complaint_photos_delete_role" ON complaint_photos;
CREATE POLICY "complaint_photos_delete_role" ON complaint_photos FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM complaints c
      WHERE c.id = complaint_photos.complaint_id
      AND (c.citizen_id = auth.uid() OR public.is_admin())
    )
  );

-- ============================================================
-- 12. CREW_TASKS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "crew_tasks_select_role" ON crew_tasks;
CREATE POLICY "crew_tasks_select_role" ON crew_tasks FOR SELECT
  TO authenticated USING (auth.uid() = crew_id OR public.is_admin());

DROP POLICY IF EXISTS "crew_tasks_insert_admin" ON crew_tasks;
CREATE POLICY "crew_tasks_insert_admin" ON crew_tasks FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "crew_tasks_update_role" ON crew_tasks;
CREATE POLICY "crew_tasks_update_role" ON crew_tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = crew_id OR public.is_admin())
  WITH CHECK (auth.uid() = crew_id OR public.is_admin());

-- ============================================================
-- 13. TASK_PHOTOS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "task_photos_select_role" ON task_photos;
CREATE POLICY "task_photos_select_role" ON task_photos FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM crew_tasks t
      WHERE t.id = task_photos.task_id
      AND (t.crew_id = auth.uid() OR public.is_admin())
    )
  );

DROP POLICY IF EXISTS "task_photos_insert_own" ON task_photos;
CREATE POLICY "task_photos_insert_own" ON task_photos FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM crew_tasks t
      WHERE t.id = task_photos.task_id AND t.crew_id = auth.uid()
    )
  );

-- ============================================================
-- 14. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_complaints_citizen_id ON complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_crew ON complaints(assigned_crew_id);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaint_photos_complaint_id ON complaint_photos(complaint_id);
CREATE INDEX IF NOT EXISTS idx_crew_tasks_crew_id ON crew_tasks(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_tasks_status ON crew_tasks(status);
CREATE INDEX IF NOT EXISTS idx_crew_tasks_complaint_id ON crew_tasks(complaint_id);
CREATE INDEX IF NOT EXISTS idx_task_photos_task_id ON task_photos(task_id);

-- ============================================================
-- 15. UPDATE EXISTING TABLE POLICIES (admin-only access)
-- ============================================================

-- cameras
DROP POLICY IF EXISTS "cameras_select_all" ON cameras;
DROP POLICY IF EXISTS "cameras_insert_all" ON cameras;
DROP POLICY IF EXISTS "cameras_update_all" ON cameras;
DROP POLICY IF EXISTS "cameras_delete_all" ON cameras;
REVOKE SELECT, INSERT, UPDATE, DELETE ON cameras FROM anon;
CREATE POLICY "cameras_select_admin" ON cameras FOR SELECT
  TO authenticated USING (public.is_admin());
CREATE POLICY "cameras_insert_admin" ON cameras FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "cameras_update_admin" ON cameras FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "cameras_delete_admin" ON cameras FOR DELETE
  TO authenticated USING (public.is_admin());

-- officers
DROP POLICY IF EXISTS "officers_select_all" ON officers;
DROP POLICY IF EXISTS "officers_insert_all" ON officers;
DROP POLICY IF EXISTS "officers_update_all" ON officers;
DROP POLICY IF EXISTS "officers_delete_all" ON officers;
REVOKE SELECT, INSERT, UPDATE, DELETE ON officers FROM anon;
CREATE POLICY "officers_select_admin" ON officers FOR SELECT
  TO authenticated USING (public.is_admin());
CREATE POLICY "officers_insert_admin" ON officers FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "officers_update_admin" ON officers FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "officers_delete_admin" ON officers FOR DELETE
  TO authenticated USING (public.is_admin());

-- incidents
DROP POLICY IF EXISTS "incidents_select_all" ON incidents;
DROP POLICY IF EXISTS "incidents_insert_all" ON incidents;
DROP POLICY IF EXISTS "incidents_update_all" ON incidents;
DROP POLICY IF EXISTS "incidents_delete_all" ON incidents;
REVOKE SELECT, INSERT, UPDATE, DELETE ON incidents FROM anon;
CREATE POLICY "incidents_select_admin" ON incidents FOR SELECT
  TO authenticated USING (public.is_admin());
CREATE POLICY "incidents_insert_admin" ON incidents FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "incidents_update_admin" ON incidents FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "incidents_delete_admin" ON incidents FOR DELETE
  TO authenticated USING (public.is_admin());

-- vehicle_records
DROP POLICY IF EXISTS "vehicle_records_select_all" ON vehicle_records;
DROP POLICY IF EXISTS "vehicle_records_insert_all" ON vehicle_records;
DROP POLICY IF EXISTS "vehicle_records_update_all" ON vehicle_records;
DROP POLICY IF EXISTS "vehicle_records_delete_all" ON vehicle_records;
REVOKE SELECT, INSERT, UPDATE, DELETE ON vehicle_records FROM anon;
CREATE POLICY "vehicle_records_select_admin" ON vehicle_records FOR SELECT
  TO authenticated USING (public.is_admin());
CREATE POLICY "vehicle_records_insert_admin" ON vehicle_records FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "vehicle_records_update_admin" ON vehicle_records FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "vehicle_records_delete_admin" ON vehicle_records FOR DELETE
  TO authenticated USING (public.is_admin());

-- cleanup_operations
DROP POLICY IF EXISTS "cleanup_operations_select_all" ON cleanup_operations;
DROP POLICY IF EXISTS "cleanup_operations_insert_all" ON cleanup_operations;
DROP POLICY IF EXISTS "cleanup_operations_update_all" ON cleanup_operations;
DROP POLICY IF EXISTS "cleanup_operations_delete_all" ON cleanup_operations;
REVOKE SELECT, INSERT, UPDATE, DELETE ON cleanup_operations FROM anon;
CREATE POLICY "cleanup_operations_select_admin" ON cleanup_operations FOR SELECT
  TO authenticated USING (public.is_admin());
CREATE POLICY "cleanup_operations_insert_admin" ON cleanup_operations FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "cleanup_operations_update_admin" ON cleanup_operations FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "cleanup_operations_delete_admin" ON cleanup_operations FOR DELETE
  TO authenticated USING (public.is_admin());

-- hotspots
DROP POLICY IF EXISTS "hotspots_select_all" ON hotspots;
DROP POLICY IF EXISTS "hotspots_insert_all" ON hotspots;
DROP POLICY IF EXISTS "hotspots_update_all" ON hotspots;
DROP POLICY IF EXISTS "hotspots_delete_all" ON hotspots;
REVOKE SELECT, INSERT, UPDATE, DELETE ON hotspots FROM anon;
CREATE POLICY "hotspots_select_admin" ON hotspots FOR SELECT
  TO authenticated USING (public.is_admin());
CREATE POLICY "hotspots_insert_admin" ON hotspots FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "hotspots_update_admin" ON hotspots FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "hotspots_delete_admin" ON hotspots FOR DELETE
  TO authenticated USING (public.is_admin());

-- notifications
DROP POLICY IF EXISTS "notifications_select_all" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_all" ON notifications;
DROP POLICY IF EXISTS "notifications_update_all" ON notifications;
DROP POLICY IF EXISTS "notifications_delete_all" ON notifications;
REVOKE SELECT, INSERT, UPDATE, DELETE ON notifications FROM anon;
CREATE POLICY "notifications_select_admin" ON notifications FOR SELECT
  TO authenticated USING (public.is_admin());
CREATE POLICY "notifications_insert_admin" ON notifications FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "notifications_update_admin" ON notifications FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "notifications_delete_admin" ON notifications FOR DELETE
  TO authenticated USING (public.is_admin());

-- detection_sessions
DROP POLICY IF EXISTS "detection_sessions_select_all" ON detection_sessions;
DROP POLICY IF EXISTS "detection_sessions_insert_all" ON detection_sessions;
DROP POLICY IF EXISTS "detection_sessions_update_all" ON detection_sessions;
DROP POLICY IF EXISTS "detection_sessions_delete_all" ON detection_sessions;
REVOKE SELECT, INSERT, UPDATE, DELETE ON detection_sessions FROM anon;
CREATE POLICY "detection_sessions_select_admin" ON detection_sessions FOR SELECT
  TO authenticated USING (public.is_admin());
CREATE POLICY "detection_sessions_insert_admin" ON detection_sessions FOR INSERT
  TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "detection_sessions_update_admin" ON detection_sessions FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "detection_sessions_delete_admin" ON detection_sessions FOR DELETE
  TO authenticated USING (public.is_admin());
