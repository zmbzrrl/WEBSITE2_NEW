-- 🏗️ NEW DATABASE STRUCTURE FOR PANEL CUSTOMIZER
-- Updated hierarchy: Property → User Groups → Users
-- Run this in your Supabase SQL Editor to create the new structure

-- ===== CLEAN SLATE =====
-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS api.user_designs CASCADE;
DROP TABLE IF EXISTS api.user_projects CASCADE;
DROP TABLE IF EXISTS api.panel_configurations CASCADE;
DROP TABLE IF EXISTS api.design_versions CASCADE;
DROP TABLE IF EXISTS api.users CASCADE;
DROP TABLE IF EXISTS api.ug CASCADE;
DROP TABLE IF EXISTS api.property CASCADE;

-- ===== CREATE NEW TABLES =====

-- 1. PROPERTY TABLE (Top level - contains properties)
CREATE TABLE api.property (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region TEXT NOT NULL,
    property_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- 2. UG TABLE (User Groups - belongs to properties)
CREATE TABLE api.ug (
    id TEXT PRIMARY KEY, -- Composite key: UG + Property ID (e.g., "UG001_Prop123")
    ug TEXT NOT NULL, -- User Group ID (e.g., "UG001")
    prop_id UUID REFERENCES api.property(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- 3. USERS TABLE (Users - belong to user groups)
CREATE TABLE api.users (
    email TEXT PRIMARY KEY, -- User's email as primary key
    ug_id TEXT REFERENCES api.ug(id) ON DELETE CASCADE, -- References the composite 'id' field
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- 4. USER PROJECTS TABLE (Projects belong to users)
CREATE TABLE api.user_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT REFERENCES api.users(email) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    project_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- 5. USER DESIGNS TABLE (Designs belong to projects)
CREATE TABLE api.user_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES api.user_projects(id) ON DELETE CASCADE,
    user_email TEXT REFERENCES api.users(email) ON DELETE CASCADE,
    design_name TEXT NOT NULL,
    panel_type TEXT NOT NULL, -- SP, DP, X1, X2, etc.
    design_data JSONB NOT NULL, -- Complete design configuration
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true
);

-- 6. PANEL CONFIGURATIONS TABLE (Panel specs belong to designs)
CREATE TABLE api.panel_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_id UUID REFERENCES api.user_designs(id) ON DELETE CASCADE,
    panel_index INTEGER NOT NULL, -- Position in layout
    room_type TEXT,
    panel_data JSONB NOT NULL, -- Panel-specific configuration
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. DESIGN VERSIONS TABLE (Version history for designs)
CREATE TABLE api.design_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_id UUID REFERENCES api.user_designs(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    design_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by TEXT REFERENCES api.users(email) ON DELETE CASCADE
);

-- ===== CREATE INDEXES FOR PERFORMANCE =====
CREATE INDEX idx_property_region ON api.property(region);
CREATE INDEX idx_ug_prop_id ON api.ug(prop_id);
CREATE INDEX idx_ug_ug ON api.ug(ug);
CREATE INDEX idx_users_ug_id ON api.users(ug_id);
CREATE INDEX idx_user_projects_email ON api.user_projects(user_email);
CREATE INDEX idx_user_designs_project_id ON api.user_designs(project_id);
CREATE INDEX idx_user_designs_email ON api.user_designs(user_email);
CREATE INDEX idx_panel_configurations_design_id ON api.panel_configurations(design_id);
CREATE INDEX idx_design_versions_design_id ON api.design_versions(design_id);

-- ===== SET UP ROW LEVEL SECURITY (RLS) =====
-- For now, disable RLS to avoid permission issues during development
ALTER TABLE api.property DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.ug DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.user_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.user_designs DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.panel_configurations DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.design_versions DISABLE ROW LEVEL SECURITY;

-- ===== GRANT PERMISSIONS =====
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

-- ===== INSERT SAMPLE DATA =====
-- Create sample properties
INSERT INTO api.property (region, property_name) VALUES
('Dubai', 'Marriott Palm Jumeirah'),
('London', 'Hilton London Tower Bridge'),
('Tokyo', 'Hyatt Regency Tokyo'),
('New York', 'InterContinental Times Square');

-- Create sample user groups
INSERT INTO api.ug (id, ug, prop_id) VALUES
('UG001_Dubai', 'UG001', (SELECT id FROM api.property WHERE property_name = 'Marriott Palm Jumeirah')),
('UG002_Dubai', 'UG002', (SELECT id FROM api.property WHERE property_name = 'Marriott Palm Jumeirah')),
('UG001_London', 'UG001', (SELECT id FROM api.property WHERE property_name = 'Hilton London Tower Bridge')),
('UG001_Tokyo', 'UG001', (SELECT id FROM api.property WHERE property_name = 'Hyatt Regency Tokyo')),
('UG001_NY', 'UG001', (SELECT id FROM api.property WHERE property_name = 'InterContinental Times Square'));

-- Create sample users
INSERT INTO api.users (email, ug_id) VALUES
('admin@marriott.com', 'UG001_Dubai'),
('manager@marriott.com', 'UG002_Dubai'),
('admin@hilton.com', 'UG001_London'),
('admin@hyatt.com', 'UG001_Tokyo'),
('admin@ihg.com', 'UG001_NY');

-- Create sample projects
INSERT INTO api.user_projects (user_email, project_name, project_description) VALUES
('admin@marriott.com', 'Palm Jumeirah Lobby Lighting', 'Main lobby lighting control system'),
('admin@hilton.com', 'Tower Bridge Guest Rooms', 'Guest room lighting automation'),
('admin@hyatt.com', 'Tokyo Conference Center', 'Conference room lighting system');

-- ===== CREATE VIEWS FOR EASY QUERYING =====
-- View to get users with their user group and property information
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

-- View to get designs with full hierarchy information
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

-- ===== VERIFY SETUP =====
SELECT 'New database structure setup complete!' as status;
SELECT COUNT(*) as property_count FROM api.property;
SELECT COUNT(*) as ug_count FROM api.ug;
SELECT COUNT(*) as user_count FROM api.users;
SELECT COUNT(*) as project_count FROM api.user_projects;
SELECT COUNT(*) as design_count FROM api.user_designs;
