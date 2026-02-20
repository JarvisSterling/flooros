-- Phase 1 Rework: Security fixes
-- M4: Limit org creation to one per user

CREATE OR REPLACE FUNCTION check_single_org()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND org_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'User already belongs to an organization';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_single_org ON organizations;
CREATE TRIGGER enforce_single_org
  BEFORE INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION check_single_org();


-- M5: Granular RLS policies for floor_plans, floors, objects, booths, exhibitors

-- Drop existing policies on floor_plans
DO $$ 
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'floor_plans'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON floor_plans';
  END LOOP;
END $$;

CREATE POLICY "floor_plans_select" ON floor_plans
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND org_id = floor_plans.org_id)
  );

CREATE POLICY "floor_plans_insert" ON floor_plans
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND org_id = floor_plans.org_id AND role IN ('owner', 'admin', 'editor'))
  );

CREATE POLICY "floor_plans_update" ON floor_plans
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND org_id = floor_plans.org_id AND role IN ('owner', 'admin', 'editor'))
  );

CREATE POLICY "floor_plans_delete" ON floor_plans
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND org_id = floor_plans.org_id AND role IN ('owner', 'admin'))
  );


-- Drop existing policies on floors
DO $$ 
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'floors'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON floors';
  END LOOP;
END $$;

CREATE POLICY "floors_select" ON floors
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND org_id = floors.org_id)
  );

CREATE POLICY "floors_insert" ON floors
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND org_id = floors.org_id AND role IN ('owner', 'admin', 'editor'))
  );

CREATE POLICY "floors_update" ON floors
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND org_id = floors.org_id AND role IN ('owner', 'admin', 'editor'))
  );

CREATE POLICY "floors_delete" ON floors
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND org_id = floors.org_id AND role IN ('owner', 'admin'))
  );


-- Drop existing policies on objects
DO $$ 
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'objects'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON objects';
  END LOOP;
END $$;

CREATE POLICY "objects_select" ON objects
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND org_id = objects.org_id)
  );

CREATE POLICY "objects_insert" ON objects
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND org_id = objects.org_id AND role IN ('owner', 'admin', 'editor'))
  );

CREATE POLICY "objects_update" ON objects
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND org_id = objects.org_id AND role IN ('owner', 'admin', 'editor'))
  );

CREATE POLICY "objects_delete" ON objects
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND org_id = objects.org_id AND role IN ('owner', 'admin'))
  );


-- Drop existing policies on booths
DO $$ 
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'booths'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON booths';
  END LOOP;
END $$;

CREATE POLICY "booths_select" ON booths
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND org_id = booths.org_id)
  );

CREATE POLICY "booths_insert" ON booths
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND org_id = booths.org_id AND role IN ('owner', 'admin', 'editor'))
  );

CREATE POLICY "booths_update" ON booths
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND org_id = booths.org_id AND role IN ('owner', 'admin', 'editor'))
  );

CREATE POLICY "booths_delete" ON booths
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND org_id = booths.org_id AND role IN ('owner', 'admin'))
  );


-- Drop existing policies on exhibitors
DO $$ 
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'exhibitors'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON exhibitors';
  END LOOP;
END $$;

CREATE POLICY "exhibitors_select" ON exhibitors
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND org_id = exhibitors.org_id)
  );

CREATE POLICY "exhibitors_insert" ON exhibitors
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND org_id = exhibitors.org_id AND role IN ('owner', 'admin', 'editor'))
  );

CREATE POLICY "exhibitors_update" ON exhibitors
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND org_id = exhibitors.org_id AND role IN ('owner', 'admin', 'editor'))
  );

CREATE POLICY "exhibitors_delete" ON exhibitors
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND org_id = exhibitors.org_id AND role IN ('owner', 'admin'))
  );

