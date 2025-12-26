-- 🏗️ CREATE ONLY THE 3 REQUESTED TABLES
-- Property → User Groups (UG) → Users
-- Run this in your Supabase SQL Editor

-- ===== CLEAN SLATE =====
-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS api.users CASCADE;
DROP TABLE IF EXISTS api.ug CASCADE;
DROP TABLE IF EXISTS api.property CASCADE;

-- ===== CREATE THE 3 TABLES =====

-- 1. PROPERTY TABLE (Top level - contains properties)
CREATE TABLE api.property (
    prop_id TEXT PRIMARY KEY, -- Primary key for property
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
    prop_id TEXT REFERENCES api.property(prop_id) ON DELETE CASCADE,
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

-- ===== CREATE INDEXES FOR PERFORMANCE =====
CREATE INDEX idx_property_region ON api.property(region);
CREATE INDEX idx_ug_prop_id ON api.ug(prop_id);
CREATE INDEX idx_ug_ug ON api.ug(ug);
CREATE INDEX idx_users_ug_id ON api.users(ug_id);

-- ===== SET UP ROW LEVEL SECURITY (RLS) =====
-- Disable RLS to avoid permission issues during development
ALTER TABLE api.property DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.ug DISABLE ROW LEVEL SECURITY;
ALTER TABLE api.users DISABLE ROW LEVEL SECURITY;

-- ===== GRANT PERMISSIONS =====
GRANT ALL ON api.property TO anon;
GRANT ALL ON api.property TO authenticated;
GRANT ALL ON api.ug TO anon;
GRANT ALL ON api.ug TO authenticated;
GRANT ALL ON api.users TO anon;
GRANT ALL ON api.users TO authenticated;

-- ===== INSERT SAMPLE DATA =====
-- Create sample properties
INSERT INTO api.property (prop_id, region, property_name) VALUES
('PROP001', 'Dubai', 'Marriott Palm Jumeirah'),
('PROP002', 'London', 'Hilton London Tower Bridge'),
('PROP003', 'Tokyo', 'Hyatt Regency Tokyo'),
('PROP004', 'New York', 'InterContinental Times Square');

-- Create sample user groups
INSERT INTO api.ug (id, ug, prop_id) VALUES
('UG001_PROP001', 'UG001', 'PROP001'),
('UG002_PROP001', 'UG002', 'PROP001'),
('UG001_PROP002', 'UG001', 'PROP002'),
('UG001_PROP003', 'UG001', 'PROP003'),
('UG001_PROP004', 'UG001', 'PROP004');

-- Create sample users
INSERT INTO api.users (email, ug_id) VALUES
('admin@marriott.com', 'UG001_PROP001'),
('manager@marriott.com', 'UG002_PROP001'),
('admin@hilton.com', 'UG001_PROP002'),
('admin@hyatt.com', 'UG001_PROP003'),
('admin@ihg.com', 'UG001_PROP004');

-- ===== CREATE VIEW FOR EASY QUERYING =====
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
LEFT JOIN api.property p ON api.ug.prop_id = p.prop_id
WHERE u.is_active = true;

-- ===== VERIFY SETUP =====
SELECT '3 tables setup complete!' as status;
SELECT COUNT(*) as property_count FROM api.property;
SELECT COUNT(*) as ug_count FROM api.ug;
SELECT COUNT(*) as user_count FROM api.users;

-- Show the hierarchy
SELECT 'Sample hierarchy:' as info;
SELECT 
    u.email,
    ug.ug as user_group,
    p.property_name,
    p.region
FROM api.users u
JOIN api.ug ON u.ug_id = api.ug.id
JOIN api.property p ON api.ug.prop_id = p.prop_id
ORDER BY p.region, ug.ug, u.email;
