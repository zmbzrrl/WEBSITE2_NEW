-- 🧹 CLEAN SLATE DATABASE - 4 Tables Total
-- Property → User Groups (UG) → Users → Layouts
-- This removes all existing tables and creates only what you need

-- ===== REMOVE ALL EXISTING TABLES =====
-- Drop all existing tables (in reverse dependency order)
DROP TABLE IF EXISTS public.layouts CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.ug CASCADE;
DROP TABLE IF EXISTS public.property CASCADE;
DROP TABLE IF EXISTS public.design_versions CASCADE;
DROP TABLE IF EXISTS public.panel_configurations CASCADE;
DROP TABLE IF EXISTS public.user_designs CASCADE;
DROP TABLE IF EXISTS public.user_projects CASCADE;

-- Drop any existing views
DROP VIEW IF EXISTS public.users_with_hierarchy CASCADE;
DROP VIEW IF EXISTS public.designs_with_hierarchy CASCADE;
DROP VIEW IF EXISTS public.designs_with_projects CASCADE;

-- ===== CREATE ONLY THE 4 TABLES YOU WANT =====

-- 1. PROPERTY TABLE (Top level - contains properties)
CREATE TABLE public.property (
    prop_id TEXT PRIMARY KEY, -- Project code in format REGION-NUMBER-NUMBER (e.g., AE-4020-5678)
    region TEXT NOT NULL,
    property_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- 2. UG TABLE (User Groups - belongs to properties)
CREATE TABLE public.ug (
    id TEXT PRIMARY KEY, -- Composite key: UG + Property ID (e.g., "UG001_PROP001")
    ug TEXT NOT NULL, -- User Group ID (e.g., "UG001")
    prop_id TEXT REFERENCES public.property(prop_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- New: Junction table for many-to-many UG ↔ Property access
CREATE TABLE public.ug_property_access (
    ug_id TEXT REFERENCES public.ug(id) ON DELETE CASCADE,
    prop_id TEXT REFERENCES public.property(prop_id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (ug_id, prop_id)
);

-- 3. USERS TABLE (Users - belong to user groups)
CREATE TABLE public.users (
    email TEXT PRIMARY KEY, -- User's email as primary key
    ug_id TEXT REFERENCES public.ug(id) ON DELETE CASCADE, -- References the composite 'id' field
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- 4. LAYOUTS TABLE (Saved layouts - belong to users)
CREATE TABLE public.layouts (
    id TEXT PRIMARY KEY, -- Unique layout ID
    user_email TEXT REFERENCES public.users(email) ON DELETE CASCADE, -- References the user who created it
    prop_id TEXT REFERENCES public.property(prop_id) ON DELETE CASCADE, -- Property context for visibility
    layout_name TEXT NOT NULL, -- Name of the layout (e.g., "Bedroom Layout")
    layout_data JSONB NOT NULL, -- The actual layout data (panels, devices, etc.)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- ===== CREATE INDEXES FOR PERFORMANCE =====
CREATE INDEX idx_property_region ON public.property(region);
CREATE INDEX idx_ug_prop_id ON public.ug(prop_id);
CREATE INDEX idx_ug_ug ON public.ug(ug);
CREATE INDEX idx_users_ug_id ON public.users(ug_id);
CREATE INDEX idx_layouts_user_email ON public.layouts(user_email);
CREATE INDEX idx_layouts_created_at ON public.layouts(created_at);

-- ===== SET UP ROW LEVEL SECURITY (RLS) =====
-- Disable RLS to avoid permission issues during development
ALTER TABLE public.property DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ug DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.layouts DISABLE ROW LEVEL SECURITY;

-- ===== GRANT PERMISSIONS =====
GRANT ALL ON public.property TO anon;
GRANT ALL ON public.property TO authenticated;
GRANT ALL ON public.ug TO anon;
GRANT ALL ON public.ug TO authenticated;
GRANT ALL ON public.users TO anon;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.layouts TO anon;
GRANT ALL ON public.layouts TO authenticated;
GRANT ALL ON public.ug_property_access TO anon;
GRANT ALL ON public.ug_property_access TO authenticated;

-- ===== INSERT SAMPLE DATA =====
-- Create sample properties (prop_id is the project code)
INSERT INTO public.property (prop_id, region, property_name) VALUES
('AE-4020-5678', 'Dubai', 'Marriott Palm Jumeirah'),
('UK-4020-5679', 'London', 'Hilton London Tower Bridge'),
('JP-4020-5680', 'Tokyo', 'Hyatt Regency Tokyo'),
('US-4020-5681', 'New York', 'InterContinental Times Square');

-- Create sample user groups
INSERT INTO public.ug (id, ug, prop_id) VALUES
('UG001_AE-4020-5678', 'UG001', 'AE-4020-5678'),
('UG002_AE-4020-5678', 'UG002', 'AE-4020-5678'),
('UG001_UK-4020-5679', 'UG001', 'UK-4020-5679'),
('UG001_JP-4020-5680', 'UG001', 'JP-4020-5680'),
('UG001_US-4020-5681', 'UG001', 'US-4020-5681');

-- Seed many-to-many access (example: UG001_AE gets access to AE and UK)
INSERT INTO public.ug_property_access (ug_id, prop_id) VALUES
('UG001_AE-4020-5678', 'AE-4020-5678'),
('UG001_AE-4020-5678', 'UK-4020-5679'),
('UG002_AE-4020-5678', 'AE-4020-5678'),
('UG001_UK-4020-5679', 'UK-4020-5679'),
('UG001_JP-4020-5680', 'JP-4020-5680'),
('UG001_US-4020-5681', 'US-4020-5681');

-- Create sample users
INSERT INTO public.users (email, ug_id) VALUES
('admin@marriott.com', 'UG001_AE-4020-5678'),
('manager@marriott.com', 'UG002_AE-4020-5678'),
('admin@hilton.com', 'UG001_UK-4020-5679'),
('admin@hyatt.com', 'UG001_JP-4020-5680'),
('admin@ihg.com', 'UG001_US-4020-5681');

-- ===== CREATE VIEW FOR EASY QUERYING =====
-- View to get users with their user group and property information
CREATE OR REPLACE VIEW public.users_with_hierarchy AS
SELECT 
    u.email,
    u.ug_id,
    ug.ug as user_group,
    p.property_name,
    p.prop_id as project_code,
    p.region,
    u.created_at,
    u.is_active
FROM public.users u
LEFT JOIN public.ug ON u.ug_id = public.ug.id
LEFT JOIN public.property p ON public.ug.prop_id = p.prop_id
WHERE u.is_active = true;

-- ===== VERIFY CLEAN SETUP =====
SELECT 'Clean database setup complete - 4 tables total + junction table!' as status;
SELECT COUNT(*) as property_count FROM public.property;
SELECT COUNT(*) as ug_count FROM public.ug;
SELECT COUNT(*) as ug_access_links FROM public.ug_property_access;
SELECT COUNT(*) as user_count FROM public.users;
SELECT COUNT(*) as layout_count FROM public.layouts;

-- List accessible properties per UG (sample)
SELECT 'UG access map:' as info;
SELECT ug_id, array_agg(prop_id ORDER BY prop_id) as properties
FROM public.ug_property_access
GROUP BY ug_id
ORDER BY ug_id;

-- Show the hierarchy
SELECT 'Sample hierarchy:' as info;
SELECT 
    u.email,
    ug.ug as user_group,
    p.property_name,
    p.prop_id as project_code,
    p.region
FROM public.users u
JOIN public.ug ON u.ug_id = public.ug.id
JOIN public.property p ON public.ug.prop_id = p.prop_id
ORDER BY p.region, ug.ug, u.email;

-- Show what tables exist now
SELECT 'Tables in database:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Show the complete hierarchy with layouts
SELECT 'Complete system overview:' as info;
SELECT 
    p.property_name,
    p.prop_id as project_code,
    p.region,
    ug.ug as user_group,
    u.email,
    COUNT(l.id) as layout_count
FROM public.property p
LEFT JOIN public.ug ON p.prop_id = public.ug.prop_id
LEFT JOIN public.users u ON public.ug.id = u.ug_id
LEFT JOIN public.layouts l ON u.email = l.user_email AND l.is_active = true
WHERE p.is_active = true
GROUP BY p.property_name, p.prop_id, p.region, ug.ug, u.email
ORDER BY p.region, ug.ug, u.email;
