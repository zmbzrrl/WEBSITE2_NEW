-- 🧹 IDEMPOTENT API SCHEMA SETUP
-- Hierarchy: api.property → api.ug → api.users → api.user_projects → api.user_designs → api.panel_configurations/api.design_versions
-- Also includes optional many-to-many helpers: api.user_ug_membership, api.ug_property_access
-- Safe to re-run: uses DROP IF EXISTS, CREATE IF NOT EXISTS, and ON CONFLICT DO NOTHING

-- ===== 0) ENSURE SCHEMA =====
CREATE SCHEMA IF NOT EXISTS api;

-- ===== 1) DROP VIEWS FIRST (IF EXIST) =====
DROP VIEW IF EXISTS api.users_with_hierarchy CASCADE;
DROP VIEW IF EXISTS api.designs_with_hierarchy CASCADE;

-- ===== 2) DROP TABLES (REVERSE DEP ORDER) =====
DROP TABLE IF EXISTS api.design_versions CASCADE;
DROP TABLE IF EXISTS api.panel_configurations CASCADE;
DROP TABLE IF EXISTS api.user_designs CASCADE;
DROP TABLE IF EXISTS api.user_projects CASCADE;
DROP TABLE IF EXISTS api.user_ug_membership CASCADE;
DROP TABLE IF EXISTS api.ug_property_access CASCADE;
DROP TABLE IF EXISTS api.users CASCADE;
DROP TABLE IF EXISTS api.ug CASCADE;
DROP TABLE IF EXISTS api.property CASCADE;

-- ===== 3) CREATE TABLES (IF NOT EXISTS) =====

-- 3.1 PROPERTY (top-level)
CREATE TABLE IF NOT EXISTS api.property (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region TEXT NOT NULL,
    property_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- 3.2 UG (belongs to property)
CREATE TABLE IF NOT EXISTS api.ug (
    id TEXT PRIMARY KEY,
    ug TEXT NOT NULL,
    prop_id UUID REFERENCES api.property(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- 3.3 USERS (belongs to UG)
CREATE TABLE IF NOT EXISTS api.users (
    email TEXT PRIMARY KEY,
    ug_id TEXT REFERENCES api.ug(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- 3.4 USER PROJECTS (belongs to users)
CREATE TABLE IF NOT EXISTS api.user_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT REFERENCES api.users(email) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    project_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- 3.5 USER DESIGNS (belongs to projects)
CREATE TABLE IF NOT EXISTS api.user_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES api.user_projects(id) ON DELETE CASCADE,
    user_email TEXT REFERENCES api.users(email) ON DELETE CASCADE,
    design_name TEXT NOT NULL,
    panel_type TEXT NOT NULL,
    design_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true
);

-- 3.6 PANEL CONFIGURATIONS (belongs to designs)
CREATE TABLE IF NOT EXISTS api.panel_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_id UUID REFERENCES api.user_designs(id) ON DELETE CASCADE,
    panel_index INTEGER NOT NULL,
    room_type TEXT,
    panel_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.7 DESIGN VERSIONS (history per design)
CREATE TABLE IF NOT EXISTS api.design_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_id UUID REFERENCES api.user_designs(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    design_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by TEXT REFERENCES api.users(email) ON DELETE CASCADE
);

-- 3.8 USER ↔ UG (many-to-many, optional)
CREATE TABLE IF NOT EXISTS api.user_ug_membership (
    user_email TEXT NOT NULL,
    ug_id TEXT REFERENCES api.ug(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_email, ug_id)
);

-- 3.9 UG ↔ PROPERTY ACCESS (optional)
CREATE TABLE IF NOT EXISTS api.ug_property_access (
    ug_id TEXT REFERENCES api.ug(id) ON DELETE CASCADE,
    prop_id TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (ug_id, prop_id)
);

-- ===== 4) INDEXES (IF NOT EXISTS) =====
CREATE INDEX IF NOT EXISTS idx_property_region ON api.property(region);
CREATE INDEX IF NOT EXISTS idx_ug_prop_id ON api.ug(prop_id);
CREATE INDEX IF NOT EXISTS idx_ug_ug ON api.ug(ug);
CREATE INDEX IF NOT EXISTS idx_users_ug_id ON api.users(ug_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_email ON api.user_projects(user_email);
CREATE INDEX IF NOT EXISTS idx_user_designs_project_id ON api.user_designs(project_id);
CREATE INDEX IF NOT EXISTS idx_user_designs_email ON api.user_designs(user_email);
CREATE INDEX IF NOT EXISTS idx_panel_configurations_design_id ON api.panel_configurations(design_id);
CREATE INDEX IF NOT EXISTS idx_design_versions_design_id ON api.design_versions(design_id);
CREATE INDEX IF NOT EXISTS idx_user_ug_membership_user ON api.user_ug_membership(user_email);
CREATE INDEX IF NOT EXISTS idx_user_ug_membership_ug ON api.user_ug_membership(ug_id);
CREATE INDEX IF NOT EXISTS idx_ug_property_access_ug ON api.ug_property_access(ug_id);
CREATE INDEX IF NOT EXISTS idx_ug_property_access_prop_id ON api.ug_property_access(prop_id);

-- ===== 5) RLS (DISABLE FOR DEV) =====
ALTER TABLE api.property DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.ug DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.user_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.user_designs DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.panel_configurations DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.design_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.user_ug_membership DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.ug_property_access DISABLE ROW LEVEL SECURITY;

-- ===== 6) GRANTS =====
GRANT ALL ON api.property TO anon;
GRANT ALL ON api.property TO authenticated;
GRANT ALL ON api.ug TO anon;
GRANT ALL ON api.ug TO authenticated;
GRANT ALL ON api.users TO anon;
GRANT ALL ON api.users TO authenticated;
GRANT ALL ON api.user_projects TO anon;
GRANT ALL ON api.user_projects TO authenticated;
GRANT ALL ON api.user_designs TO anon;
GRANT ALL ON api.user_designs TO authenticated;
GRANT ALL ON api.panel_configurations TO anon;
GRANT ALL ON api.panel_configurations TO authenticated;
GRANT ALL ON api.design_versions TO anon;
GRANT ALL ON api.design_versions TO authenticated;
GRANT ALL ON api.user_ug_membership TO anon;
GRANT ALL ON api.user_ug_membership TO authenticated;
GRANT ALL ON api.ug_property_access TO anon;
GRANT ALL ON api.ug_property_access TO authenticated;

-- ===== 7) SEED DATA (ON CONFLICT DO NOTHING) =====
INSERT INTO api.property (region, property_name) VALUES
('Dubai', 'Marriott Palm Jumeirah'),
('London', 'Hilton London Tower Bridge'),
('Tokyo', 'Hyatt Regency Tokyo'),
('New York', 'InterContinental Times Square')
ON CONFLICT DO NOTHING;

-- Map names → IDs to seed UGs
WITH props AS (
  SELECT property_name, id FROM api.property
)
INSERT INTO api.ug (id, ug, prop_id) VALUES
('UG001_Dubai', 'UG001', (SELECT id FROM props WHERE property_name = 'Marriott Palm Jumeirah')),
('UG002_Dubai', 'UG002', (SELECT id FROM props WHERE property_name = 'Marriott Palm Jumeirah')),
('UG001_London', 'UG001', (SELECT id FROM props WHERE property_name = 'Hilton London Tower Bridge')),
('UG001_Tokyo', 'UG001', (SELECT id FROM props WHERE property_name = 'Hyatt Regency Tokyo')),
('UG001_NY', 'UG001', (SELECT id FROM props WHERE property_name = 'InterContinental Times Square'))
ON CONFLICT (id) DO NOTHING;

INSERT INTO api.users (email, ug_id) VALUES
('admin@marriott.com', 'UG001_Dubai'),
('manager@marriott.com', 'UG002_Dubai'),
('admin@hilton.com', 'UG001_London'),
('admin@hyatt.com', 'UG001_Tokyo'),
('admin@ihg.com', 'UG001_NY')
ON CONFLICT (email) DO NOTHING;

INSERT INTO api.user_projects (user_email, project_name, project_description) VALUES
('admin@marriott.com', 'Palm Jumeirah Lobby Lighting', 'Main lobby lighting control system'),
('admin@hilton.com', 'Tower Bridge Guest Rooms', 'Guest room lighting automation'),
('admin@hyatt.com', 'Tokyo Conference Center', 'Conference room lighting system')
ON CONFLICT DO NOTHING;

-- ===== 8) VIEWS (OR REPLACE) =====
CREATE OR REPLACE VIEW api.users_with_hierarchy AS
SELECT 
    u.email,
    u.ug_id,
    ug.ug as user_group,
    p.property_name,
    p.region,
    u.created_at,
    u.is_active
FROM api.users u
LEFT JOIN api.ug ON u.ug_id = api.ug.id
LEFT JOIN api.property p ON api.ug.prop_id = p.id
WHERE u.is_active = true;

CREATE OR REPLACE VIEW api.designs_with_hierarchy AS
SELECT 
    d.id,
    d.design_name,
    d.panel_type,
    d.design_data,
    d.created_at,
    d.last_modified,
    d.user_email,
    p.project_name,
    p.project_description,
    u.ug_id,
    ug.ug as user_group,
    prop.property_name,
    prop.region
FROM api.user_designs d
LEFT JOIN api.user_projects p ON d.project_id = p.id
LEFT JOIN api.users u ON d.user_email = u.email
LEFT JOIN api.ug ON u.ug_id = api.ug.id
LEFT JOIN api.property prop ON api.ug.prop_id = prop.id
WHERE d.is_active = true AND p.is_active = true;

-- ===== 9) VERIFICATION =====
SELECT 'Idempotent API setup complete' as status;
SELECT COUNT(*) as property_count FROM api.property;
SELECT COUNT(*) as ug_count FROM api.ug;
SELECT COUNT(*) as user_count FROM api.users;
SELECT COUNT(*) as project_count FROM api.user_projects;
SELECT COUNT(*) as design_count FROM api.user_designs;

SELECT 'Tables in api schema:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'api' 
ORDER BY table_name;


