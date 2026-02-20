-- Phase 1 Rework: Security fixes (M4 + M5)

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

-- M5: Granular RLS policies
-- Phase 1 Rework M5: Granular RLS policies

-- floor_plans
CREATE POLICY "floor_plans_select" ON floor_plans FOR SELECT USING (EXISTS (
    SELECT 1 FROM events e
    JOIN user_profiles up ON up.org_id = e.org_id
    WHERE e.id = floor_plans.event_id
    AND up.id = auth.uid()
  ));
CREATE POLICY "floor_plans_insert" ON floor_plans FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM events e
    JOIN user_profiles up ON up.org_id = e.org_id
    WHERE e.id = floor_plans.event_id
    AND up.id = auth.uid()
    AND up.role IN ('owner', 'admin', 'editor')
  ));
CREATE POLICY "floor_plans_update" ON floor_plans FOR UPDATE USING (EXISTS (
    SELECT 1 FROM events e
    JOIN user_profiles up ON up.org_id = e.org_id
    WHERE e.id = floor_plans.event_id
    AND up.id = auth.uid()
    AND up.role IN ('owner', 'admin', 'editor')
  ));
CREATE POLICY "floor_plans_delete" ON floor_plans FOR DELETE USING (EXISTS (
    SELECT 1 FROM events e
    JOIN user_profiles up ON up.org_id = e.org_id
    WHERE e.id = floor_plans.event_id
    AND up.id = auth.uid()
    AND up.role IN ('owner', 'admin')
  ));

-- floors
CREATE POLICY "floors_select" ON floors FOR SELECT USING (EXISTS (
    SELECT 1 FROM floor_plans fp
    JOIN events e ON e.id = fp.event_id
    JOIN user_profiles up ON up.org_id = e.org_id
    WHERE fp.id = floors.plan_id
    AND up.id = auth.uid()
  ));
CREATE POLICY "floors_insert" ON floors FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM floor_plans fp
    JOIN events e ON e.id = fp.event_id
    JOIN user_profiles up ON up.org_id = e.org_id
    WHERE fp.id = floors.plan_id
    AND up.id = auth.uid()
    AND up.role IN ('owner', 'admin', 'editor')
  ));
CREATE POLICY "floors_update" ON floors FOR UPDATE USING (EXISTS (
    SELECT 1 FROM floor_plans fp
    JOIN events e ON e.id = fp.event_id
    JOIN user_profiles up ON up.org_id = e.org_id
    WHERE fp.id = floors.plan_id
    AND up.id = auth.uid()
    AND up.role IN ('owner', 'admin', 'editor')
  ));
CREATE POLICY "floors_delete" ON floors FOR DELETE USING (EXISTS (
    SELECT 1 FROM floor_plans fp
    JOIN events e ON e.id = fp.event_id
    JOIN user_profiles up ON up.org_id = e.org_id
    WHERE fp.id = floors.plan_id
    AND up.id = auth.uid()
    AND up.role IN ('owner', 'admin')
  ));

-- objects
CREATE POLICY "objects_select" ON objects FOR SELECT USING (EXISTS (
    SELECT 1 FROM floors f
    JOIN floor_plans fp ON fp.id = f.plan_id
    JOIN events e ON e.id = fp.event_id
    JOIN user_profiles up ON up.org_id = e.org_id
    WHERE f.id = objects.floor_id
    AND up.id = auth.uid()
  ));
CREATE POLICY "objects_insert" ON objects FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM floors f
    JOIN floor_plans fp ON fp.id = f.plan_id
    JOIN events e ON e.id = fp.event_id
    JOIN user_profiles up ON up.org_id = e.org_id
    WHERE f.id = objects.floor_id
    AND up.id = auth.uid()
    AND up.role IN ('owner', 'admin', 'editor')
  ));
CREATE POLICY "objects_update" ON objects FOR UPDATE USING (EXISTS (
    SELECT 1 FROM floors f
    JOIN floor_plans fp ON fp.id = f.plan_id
    JOIN events e ON e.id = fp.event_id
    JOIN user_profiles up ON up.org_id = e.org_id
    WHERE f.id = objects.floor_id
    AND up.id = auth.uid()
    AND up.role IN ('owner', 'admin', 'editor')
  ));
CREATE POLICY "objects_delete" ON objects FOR DELETE USING (EXISTS (
    SELECT 1 FROM floors f
    JOIN floor_plans fp ON fp.id = f.plan_id
    JOIN events e ON e.id = fp.event_id
    JOIN user_profiles up ON up.org_id = e.org_id
    WHERE f.id = objects.floor_id
    AND up.id = auth.uid()
    AND up.role IN ('owner', 'admin')
  ));

-- booths
CREATE POLICY "booths_select" ON booths FOR SELECT USING (EXISTS (
    SELECT 1 FROM events e
    JOIN user_profiles up ON up.org_id = e.org_id
    WHERE e.id = booths.event_id
    AND up.id = auth.uid()
  ));
CREATE POLICY "booths_insert" ON booths FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM events e
    JOIN user_profiles up ON up.org_id = e.org_id
    WHERE e.id = booths.event_id
    AND up.id = auth.uid()
    AND up.role IN ('owner', 'admin', 'editor')
  ));
CREATE POLICY "booths_update" ON booths FOR UPDATE USING (EXISTS (
    SELECT 1 FROM events e
    JOIN user_profiles up ON up.org_id = e.org_id
    WHERE e.id = booths.event_id
    AND up.id = auth.uid()
    AND up.role IN ('owner', 'admin', 'editor')
  ));
CREATE POLICY "booths_delete" ON booths FOR DELETE USING (EXISTS (
    SELECT 1 FROM events e
    JOIN user_profiles up ON up.org_id = e.org_id
    WHERE e.id = booths.event_id
    AND up.id = auth.uid()
    AND up.role IN ('owner', 'admin')
  ));

-- exhibitors
CREATE POLICY "exhibitors_select" ON exhibitors FOR SELECT USING (EXISTS (
    SELECT 1 FROM events e
    JOIN user_profiles up ON up.org_id = e.org_id
    WHERE e.id = exhibitors.event_id
    AND up.id = auth.uid()
  ));
CREATE POLICY "exhibitors_insert" ON exhibitors FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM events e
    JOIN user_profiles up ON up.org_id = e.org_id
    WHERE e.id = exhibitors.event_id
    AND up.id = auth.uid()
    AND up.role IN ('owner', 'admin', 'editor')
  ));
CREATE POLICY "exhibitors_update" ON exhibitors FOR UPDATE USING (EXISTS (
    SELECT 1 FROM events e
    JOIN user_profiles up ON up.org_id = e.org_id
    WHERE e.id = exhibitors.event_id
    AND up.id = auth.uid()
    AND up.role IN ('owner', 'admin', 'editor')
  ));
CREATE POLICY "exhibitors_delete" ON exhibitors FOR DELETE USING (EXISTS (
    SELECT 1 FROM events e
    JOIN user_profiles up ON up.org_id = e.org_id
    WHERE e.id = exhibitors.event_id
    AND up.id = auth.uid()
    AND up.role IN ('owner', 'admin')
  ));

