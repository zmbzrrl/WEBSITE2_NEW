-- 🧹 IDPOTENT CLEAN DATABASE SETUP (PUBLIC SCHEMA)
-- Property → User Groups (UG) → Users → Layouts (+ UG access junction)
-- Safe to re-run: uses DROP IF EXISTS, CREATE IF NOT EXISTS, and ON CONFLICT DO NOTHING

-- ===== 0) OPTIONAL: SCHEMA ENSURE =====
-- CREATE SCHEMA IF NOT EXISTS public; -- (public exists by default in Supabase)

-- ===== 1) DROP VIEWS FIRST (IF THEY EXIST) =====
DROP VIEW IF EXISTS public.users_with_hierarchy CASCADE;
DROP VIEW IF EXISTS public.designs_with_hierarchy CASCADE;
DROP VIEW IF EXISTS public.designs_with_projects CASCADE;

-- ===== 2) DROP TABLES (REVERSE DEP ORDER) =====
DROP TABLE IF EXISTS public.design CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.ug_property_access CASCADE;
DROP TABLE IF EXISTS public.ug CASCADE;
DROP TABLE IF EXISTS public.property CASCADE;

-- If your DB previously had these optional tables in public, clean them too
DROP TABLE IF EXISTS public.design_versions CASCADE;
DROP TABLE IF EXISTS public.panel_configurations CASCADE;
DROP TABLE IF EXISTS public.user_designs CASCADE;
DROP TABLE IF EXISTS public.user_projects CASCADE;

-- ===== 3) CREATE TABLES (IF NOT EXISTS) =====

-- 3.1 PROPERTY (top-level)
CREATE TABLE IF NOT EXISTS public.property (
    prop_id TEXT PRIMARY KEY,
    region TEXT NOT NULL,
    property_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- 3.2 UG (belongs to property)
CREATE TABLE IF NOT EXISTS public.ug (
    "UG_PropID" TEXT PRIMARY KEY,
    ug_id TEXT NOT NULL, -- code like UG001, UG002
    ug TEXT NOT NULL,    -- human name like INTEREL, SIBCA
    prop_id TEXT REFERENCES public.property(prop_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- 3.3 UG ↔ PROPERTY ACCESS (junction; optional many-to-many)
CREATE TABLE IF NOT EXISTS public.ug_property_access (
    ug_id TEXT REFERENCES public.ug("UG_PropID") ON DELETE CASCADE,
    prop_id TEXT REFERENCES public.property(prop_id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (ug_id, prop_id)
);

-- 3.4 USERS (belongs to UG)
CREATE TABLE IF NOT EXISTS public.users (
    email TEXT PRIMARY KEY,
    ug_id TEXT REFERENCES public.ug("UG_PropID") ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- 3.5 DESIGN (unified: layouts and panel designs)
CREATE TABLE IF NOT EXISTS public.design (
    id TEXT PRIMARY KEY,
    user_email TEXT REFERENCES public.users(email) ON DELETE CASCADE,
    prop_id TEXT REFERENCES public.property(prop_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    data JSONB NOT NULL,
    design_type TEXT NOT NULL DEFAULT 'layout', -- e.g., 'layout', 'panel'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- ===== 4) INDEXES (IF NOT EXISTS) =====
CREATE INDEX IF NOT EXISTS idx_property_region ON public.property(region);
CREATE INDEX IF NOT EXISTS idx_ug_prop_id ON public.ug(prop_id);
CREATE INDEX IF NOT EXISTS idx_ug_ug ON public.ug(ug);
CREATE INDEX IF NOT EXISTS idx_ug_ug_id ON public.ug(ug_id);
CREATE INDEX IF NOT EXISTS idx_users_ug_id ON public.users(ug_id);
CREATE INDEX IF NOT EXISTS idx_design_user_email ON public.design(user_email);
CREATE INDEX IF NOT EXISTS idx_design_created_at ON public.design(created_at);
CREATE INDEX IF NOT EXISTS idx_design_prop_id ON public.design(prop_id);
CREATE INDEX IF NOT EXISTS idx_design_type ON public.design(design_type);

-- ===== 5) RLS (DISABLE FOR DEV) =====
ALTER TABLE public.property DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ug DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.design DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ug_property_access DISABLE ROW LEVEL SECURITY;

-- ===== 6) GRANTS =====
GRANT ALL ON public.property TO anon;
GRANT ALL ON public.property TO authenticated;
GRANT ALL ON public.ug TO anon;
GRANT ALL ON public.ug TO authenticated;
GRANT ALL ON public.users TO anon;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.design TO anon;
GRANT ALL ON public.design TO authenticated;
GRANT ALL ON public.ug_property_access TO anon;
GRANT ALL ON public.ug_property_access TO authenticated;

-- ===== 7) SEED DATA (ON CONFLICT DO NOTHING) =====
INSERT INTO public.property (prop_id, region, property_name) VALUES
('AE-4020-5678', 'Dubai', 'Marriott Palm Jumeirah'),
('UK-4020-5679', 'London', 'Hilton London Tower Bridge'),
('JP-4020-5680', 'Tokyo', 'Hyatt Regency Tokyo'),
('US-4020-5681', 'New York', 'InterContinental Times Square')
ON CONFLICT (prop_id) DO NOTHING;

INSERT INTO public.ug ("UG_PropID", ug_id, ug, prop_id) VALUES
('UG001_AE-4020-5678', 'UG001', 'UG001', 'AE-4020-5678'),
('UG002_AE-4020-5678', 'UG002', 'UG002', 'AE-4020-5678'),
('UG001_UK-4020-5679', 'UG001', 'UG001', 'UK-4020-5679'),
('UG001_JP-4020-5680', 'UG001', 'UG001', 'JP-4020-5680'),
('UG001_US-4020-5681', 'UG001', 'UG001', 'US-4020-5681')
ON CONFLICT ("UG_PropID") DO NOTHING;

INSERT INTO public.ug_property_access (ug_id, prop_id) VALUES
('UG001_AE-4020-5678', 'AE-4020-5678'),
('UG001_AE-4020-5678', 'UK-4020-5679'),
('UG002_AE-4020-5678', 'AE-4020-5678'),
('UG001_UK-4020-5679', 'UK-4020-5679'),
('UG001_JP-4020-5680', 'JP-4020-5680'),
('UG001_US-4020-5681', 'US-4020-5681')
ON CONFLICT (ug_id, prop_id) DO NOTHING;

INSERT INTO public.users (email, ug_id) VALUES
('admin@marriott.com', 'UG001_AE-4020-5678'),
('manager@marriott.com', 'UG002_AE-4020-5678'),
('admin@hilton.com', 'UG001_UK-4020-5679'),
('admin@hyatt.com', 'UG001_JP-4020-5680'),
('admin@ihg.com', 'UG001_US-4020-5681')
ON CONFLICT (email) DO NOTHING;

-- (Optional) seed for design — sample only
-- INSERT INTO public.design (id, user_email, prop_id, name, data, design_type)
-- VALUES ('DESIGN-001', 'admin@marriott.com', 'AE-4020-5678', 'Bedroom Layout', '{}', 'layout')
-- ON CONFLICT (id) DO NOTHING;

-- ===== 8) VIEWS (OR REPLACE) =====
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
LEFT JOIN public.ug ON u.ug_id = public.ug."UG_PropID"
LEFT JOIN public.property p ON public.ug.prop_id = p.prop_id
WHERE u.is_active = true;



-- ===== 9) VERIFICATION QUERIES =====
SELECT 'Idempotent clean setup complete (public schema)' as status;
SELECT COUNT(*) as property_count FROM public.property;
SELECT COUNT(*) as ug_count FROM public.ug;
SELECT COUNT(*) as ug_access_links FROM public.ug_property_access;
SELECT COUNT(*) as user_count FROM public.users;
SELECT COUNT(*) as design_count FROM public.design;

SELECT 'Tables in public schema:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Hierarchy preview
SELECT 
    u.email,
    ug.ug as user_group,
    p.property_name,
    p.prop_id as project_code,
    p.region
FROM public.users u
JOIN public.ug ON u.ug_id = public.ug."UG_PropID"
JOIN public.property p ON public.ug.prop_id = p.prop_id
ORDER BY p.region, ug.ug, u.email;


