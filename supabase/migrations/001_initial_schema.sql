-- FloorOS Database Schema
-- Phase 1 Task 1: Initial schema

-- Reset public schema
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Organizations
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  plan text DEFAULT 'free',
  created_by uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now()
);

-- User profiles
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  org_id uuid REFERENCES organizations ON DELETE SET NULL,
  role text DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at timestamptz DEFAULT now()
);

-- Events
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  start_date date,
  end_date date,
  venue text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'live', 'archived')),
  settings jsonb DEFAULT '{}',
  logo_url text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(org_id, slug)
);

-- Floor plans
CREATE TABLE floor_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  "order" int DEFAULT 0,
  width int DEFAULT 1200,
  height int DEFAULT 800,
  background_url text,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Floors
CREATE TABLE floors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES floor_plans ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  level int DEFAULT 0,
  "order" int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Objects (canvas elements)
CREATE TABLE objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  floor_id uuid REFERENCES floors ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  x float DEFAULT 0,
  y float DEFAULT 0,
  width float DEFAULT 100,
  height float DEFAULT 100,
  rotation float DEFAULT 0,
  properties jsonb DEFAULT '{}',
  layer text DEFAULT 'default',
  locked boolean DEFAULT false,
  visible boolean DEFAULT true,
  z_index int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Exhibitors
CREATE TABLE exhibitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  company_name text NOT NULL,
  description text,
  logo_url text,
  website text,
  contact_email text,
  contact_phone text,
  social_links jsonb DEFAULT '{}',
  category text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Booths
CREATE TABLE booths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id uuid REFERENCES objects ON DELETE SET NULL,
  floor_id uuid REFERENCES floors ON DELETE CASCADE NOT NULL,
  event_id uuid REFERENCES events ON DELETE CASCADE NOT NULL,
  number text,
  name text,
  size_category text CHECK (size_category IN ('small', 'medium', 'large', 'xl')),
  status text DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'blocked')),
  price decimal(10,2),
  exhibitor_id uuid REFERENCES exhibitors ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Booth reservations
CREATE TABLE booth_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booth_id uuid REFERENCES booths ON DELETE CASCADE NOT NULL,
  exhibitor_id uuid REFERENCES exhibitors ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  reserved_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  payment_id text
);

-- Event categories
CREATE TABLE event_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text DEFAULT '#3b82f6',
  icon text
);

-- Analytics events
CREATE TABLE analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events ON DELETE CASCADE NOT NULL,
  booth_id uuid REFERENCES booths ON DELETE SET NULL,
  visitor_id text,
  event_type text NOT NULL CHECK (event_type IN ('view', 'click', 'direction', 'bookmark')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Team invitations
CREATE TABLE team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  role text DEFAULT 'editor',
  invited_by uuid REFERENCES auth.users ON DELETE SET NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_user_profiles_org ON user_profiles(org_id);
CREATE INDEX idx_events_org ON events(org_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_slug ON events(org_id, slug);
CREATE INDEX idx_floor_plans_event ON floor_plans(event_id);
CREATE INDEX idx_floors_plan ON floors(plan_id);
CREATE INDEX idx_objects_floor ON objects(floor_id);
CREATE INDEX idx_objects_type ON objects(type);
CREATE INDEX idx_booths_floor ON booths(floor_id);
CREATE INDEX idx_booths_event ON booths(event_id);
CREATE INDEX idx_booths_status ON booths(status);
CREATE INDEX idx_booths_exhibitor ON booths(exhibitor_id);
CREATE INDEX idx_exhibitors_event ON exhibitors(event_id);
CREATE INDEX idx_booth_reservations_booth ON booth_reservations(booth_id);
CREATE INDEX idx_booth_reservations_exhibitor ON booth_reservations(exhibitor_id);
CREATE INDEX idx_event_categories_event ON event_categories(event_id);
CREATE INDEX idx_analytics_event ON analytics_events(event_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);
CREATE INDEX idx_team_invitations_org ON team_invitations(org_id);
CREATE INDEX idx_team_invitations_email ON team_invitations(email);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE floor_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE booths ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE booth_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Helper function: get user's org_id
CREATE OR REPLACE FUNCTION auth.user_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT org_id FROM public.user_profiles WHERE id = auth.uid()
$$;

-- Helper function: get user's role
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid()
$$;

-- Organizations policies
CREATE POLICY "Users can view their own org" ON organizations
  FOR SELECT USING (id = auth.user_org_id());

CREATE POLICY "Owners can update their org" ON organizations
  FOR UPDATE USING (id = auth.user_org_id() AND auth.user_role() = 'owner');

CREATE POLICY "Authenticated users can create orgs" ON organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- User profiles policies
CREATE POLICY "Users can view profiles in their org" ON user_profiles
  FOR SELECT USING (org_id = auth.user_org_id() OR id = auth.uid());

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Events policies
CREATE POLICY "Org members can view events" ON events
  FOR SELECT USING (org_id = auth.user_org_id());

CREATE POLICY "Public can view published/live events" ON events
  FOR SELECT USING (status IN ('published', 'live'));

CREATE POLICY "Editors+ can create events" ON events
  FOR INSERT WITH CHECK (
    org_id = auth.user_org_id()
    AND auth.user_role() IN ('owner', 'admin', 'editor')
  );

CREATE POLICY "Editors+ can update events" ON events
  FOR UPDATE USING (
    org_id = auth.user_org_id()
    AND auth.user_role() IN ('owner', 'admin', 'editor')
  );

CREATE POLICY "Admins+ can delete events" ON events
  FOR DELETE USING (
    org_id = auth.user_org_id()
    AND auth.user_role() IN ('owner', 'admin')
  );

-- Floor plans policies
CREATE POLICY "Org members can manage floor plans" ON floor_plans
  FOR ALL USING (
    event_id IN (SELECT id FROM events WHERE org_id = auth.user_org_id())
  );

CREATE POLICY "Public can view published floor plans" ON floor_plans
  FOR SELECT USING (
    event_id IN (SELECT id FROM events WHERE status IN ('published', 'live'))
  );

-- Floors policies
CREATE POLICY "Org members can manage floors" ON floors
  FOR ALL USING (
    plan_id IN (
      SELECT fp.id FROM floor_plans fp
      JOIN events e ON fp.event_id = e.id
      WHERE e.org_id = auth.user_org_id()
    )
  );

CREATE POLICY "Public can view published floors" ON floors
  FOR SELECT USING (
    plan_id IN (
      SELECT fp.id FROM floor_plans fp
      JOIN events e ON fp.event_id = e.id
      WHERE e.status IN ('published', 'live')
    )
  );

-- Objects policies
CREATE POLICY "Org members can manage objects" ON objects
  FOR ALL USING (
    floor_id IN (
      SELECT f.id FROM floors f
      JOIN floor_plans fp ON f.plan_id = fp.id
      JOIN events e ON fp.event_id = e.id
      WHERE e.org_id = auth.user_org_id()
    )
  );

CREATE POLICY "Public can view published objects" ON objects
  FOR SELECT USING (
    floor_id IN (
      SELECT f.id FROM floors f
      JOIN floor_plans fp ON f.plan_id = fp.id
      JOIN events e ON fp.event_id = e.id
      WHERE e.status IN ('published', 'live')
    )
  );

-- Booths policies
CREATE POLICY "Org members can manage booths" ON booths
  FOR ALL USING (
    event_id IN (SELECT id FROM events WHERE org_id = auth.user_org_id())
  );

CREATE POLICY "Public can view published booths" ON booths
  FOR SELECT USING (
    event_id IN (SELECT id FROM events WHERE status IN ('published', 'live'))
  );

-- Exhibitors policies
CREATE POLICY "Org members can manage exhibitors" ON exhibitors
  FOR ALL USING (
    event_id IN (SELECT id FROM events WHERE org_id = auth.user_org_id())
  );

CREATE POLICY "Public can view published exhibitors" ON exhibitors
  FOR SELECT USING (
    event_id IN (SELECT id FROM events WHERE status IN ('published', 'live'))
  );

-- Booth reservations policies
CREATE POLICY "Org members can manage reservations" ON booth_reservations
  FOR ALL USING (
    booth_id IN (
      SELECT b.id FROM booths b
      JOIN events e ON b.event_id = e.id
      WHERE e.org_id = auth.user_org_id()
    )
  );

-- Event categories policies
CREATE POLICY "Org members can manage categories" ON event_categories
  FOR ALL USING (
    event_id IN (SELECT id FROM events WHERE org_id = auth.user_org_id())
  );

-- Analytics policies
CREATE POLICY "Anyone can insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Org members can view analytics" ON analytics_events
  FOR SELECT USING (
    event_id IN (SELECT id FROM events WHERE org_id = auth.user_org_id())
  );

-- Team invitations policies
CREATE POLICY "Org members can view invitations" ON team_invitations
  FOR SELECT USING (org_id = auth.user_org_id());

CREATE POLICY "Admins+ can manage invitations" ON team_invitations
  FOR ALL USING (
    org_id = auth.user_org_id()
    AND auth.user_role() IN ('owner', 'admin')
  );
